import logging
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, ProductAttribute, ProductAttributeSet
from .serializers import AIProductGenerateRequestSeralizer, ProductSerializer, ProductAttributeSerializer, ProductAttributeSetSerializer
from .services import ProductAIGenerationService, ProductAIGenerationServiceError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 200
    
class ProductAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductAttribute.objects.all().order_by('name')
    serializer_class = ProductAttributeSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_fields = ['name', 'type']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name']
    ordering = ['id']

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request, *args, **kwargs):
        if not request.user.has_perm('products.add_productattribute'):
            raise PermissionDenied('You do not have permission to bulk create product attributes.')
        if not isinstance(request.data, list):
            return Response(
                message="Expected a list of product attributes for bulk creation.",
                status=status.HTTP_400_BAD_REQUEST,
                created_product_attributes = [],
            )
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            created_product_attributes = []
            errors = []
            for p in serializer.validated_data:
                try:
                    product_attribute, created = ProductAttribute.objects.get_or_create(
                        name=p['name'],
                        defaults={
                            'type': p.get('type', 'text'),
                            'description': p.get('description', ''),
                            'options': p.get('options', {}),
                            'validation_rules': p.get('validation_rules', {}),
                            'display_name': p.get('display_name', ''),
                            'sample_values': p.get('sample_values', ''),
                            'is_required': p.get('is_required', False),
                            'default_value': p.get('default_value', ''),
                        },
                    )
                    if created:
                        created_product_attributes.append(product_attribute)
                except Exception as e:
                    errors.append({
                        "data": p,
                        "error": str(e),
                    })
            response_serializer = self.get_serializer(created_product_attributes, many=True)

            response_data = {
                "status": "success",
                "message": f"Successfully processed {len(created_product_attributes)} product attributes "
                            f"{len(created_product_attributes)} new product attributes created."
                            f"{len(request.data) - len(created_product_attributes)} skipped.",
                "created_product_attributes": response_serializer.data,
            }

            if errors:
                response_data["errors"] = errors
                return Response(response_data, status=status.HTTP_207_MULTI_STATUS)
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

class ProductAttributeSetViewSet(viewsets.ModelViewSet):
    queryset = ProductAttributeSet.objects.all().order_by('name')
    serializer_class = ProductAttributeSetSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_fields = ['name', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name']
    ordering = ['id']

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing product instances.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_fields = ['name', 'description']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name']
    ordering = ['id']

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request, *args, **kwargs):
        logger.info("Received bulk create request for products.")
        if not request.user.has_perm('products.add_product'):
            raise PermissionDenied('You do not have permission to bulk create products.')
        if not isinstance(request.data, list):
            return Response(
                {"error": "Invalid request format. Expected a list of products."},
                status=status.HTTP_400_BAD_REQUEST,
                created_products=[],
            )
        logger.info(f"Bulk create request received with {len(request.data)} products.")
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        products = [
            Product(
                name=p.get('name'),
                description=p.get('description'),
                is_active=p.get('is_active'),
                brand=p.get('brand'),
                category=p.get('category'),
                attribute_set=p.get('attribute_set'),
                attributes_data=p.get('attributes_data'),
            )
            for p in serializer.validated_data
        ]
        created = Product.objects.bulk_create(products)
        response_serializer = self.get_serializer(created, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request, *args, **kwargs):
        logger.info("Received AI generation request for product")
        serializer = AIProductGenerateRequestSeralizer(data=request.data)
        serializer.is_valid(raise_exception=True)
        prompt = serializer.validated_data['prompt']
        product_type = serializer.validated_data['product_type']
        try:
            svc = ProductAIGenerationService()
            content = svc.generate(prompt, product_type)
            return Response({
                "status": "success",
                "product_type": product_type,
                "data": content['data'],
            })

        except ProductAIGenerationServiceError as e:
            logger.error(f"Product AI generation error for {product_type}, prompt={prompt[:50]}... {e.message} Details: {e.details}")
            return Response({
                "status": "error",
                "message": str(e),
                "details": e.details,
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "status": "error",
                "message": "An unexpected server error occurred",
                "details": str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)