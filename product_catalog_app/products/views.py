import logging
from asgiref.sync import async_to_sync
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FileUploadParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.text import slugify
from product_catalog_app.containers.django_container import DjangoContainer
from product_catalog_app.products.agents.generate_from_image.command import GenerateProductFromImageCommand
from product_catalog_app.products.agents.generate_from_image.params import GenerateProductFromImageParams
from product_catalog_app.products.commands.generate_description import GenerateDescriptionCommand
from product_catalog_app.products.commands.params import GenerateDescriptionParams
from .messaging import publish_validation_events
from .models import Product, ProductAttribute, ProductAttributeSet, ProductMonitorJob
from .serializers import AIProductGenerateRequestSeralizer, AIImageProductGenerateRequestSerializer, ProductSerializer, ProductAttributeSerializer, ProductAttributeSetSerializer, ProductMonitorJobSerializer
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
        serializer.is_valid(raise_exception=True)
        product_attributes = [
            ProductAttribute(
                name=p.get('name'),
                code=slugify(p.get('name')),
                type=p.get('type', 'text'),
                description=p.get('description', ''),
                options=p.get('options', {}),
                validation_rules=p.get('validation_rules', {}),
                display_name=p.get('display_name', ''),
                sample_values=p.get('sample_values', ''),
                is_required=p.get('is_required', False),
                default_value=p.get('default_value', ''),
            )
            for p in serializer.validated_data
        ]
        codes = {attr.code for attr in product_attributes}
        ProductAttribute.objects.bulk_create(product_attributes)
        created = ProductAttribute.objects.filter(code__in=codes)
        response_serializer = ProductAttributeSerializer(created, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class ProductAttributeSetViewSet(viewsets.ModelViewSet):
    queryset = ProductAttributeSet.objects.all().order_by('name')
    serializer_class = ProductAttributeSetSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['name', 'is_active']
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
    filterset_fields = ['name', 'description', 'is_ai_generated', 'verification_status']
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
                is_ai_generated=p.get('is_ai_generated'),
                verification_status=p.get('verification_status'),
                brand=p.get('brand'),
                category=p.get('category'),
                attribute_set=p.get('attribute_set'),
                attributes_data=p.get('attributes_data'),
                suggested_corrections=p.get('suggested_corrections'),
            )
            for p in serializer.validated_data
        ]
        names = {p.name for p in products}
        Product.objects.bulk_create(products)
        created = Product.objects.filter(name__in=names)
        product_ids = [p.id for p in created]
        publish_validation_events(product_ids)
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

    @action(detail=True, methods=['post'], url_path='generate-description')
    def generate_description(self, request, pk=None):
        container = DjangoContainer.get_instance()
        try:
            params = GenerateDescriptionParams(request.data['prompt'], {
                "product": self.get_object(),
            })
            cmd = GenerateDescriptionCommand(container, params)
            res = cmd.execute()
            if not res.success:
                container.logger.error(f"Failed generating description: {res.errors}")
                return Response({
                    "detail": f"Failed generating description: {res.errors}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                "detail": res.data
            })
        except Exception as e:
            return Response({
                "detail": "Product not found",
                "message": f"error details: {e}",
            }, status=status.HTTP_404_NOT_FOUND)

class ProductImageViewSet(APIView):
    parser_classes = (MultiPartParser, FormParser,)
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = AIImageProductGenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            product_type = serializer.validated_data['product_type']
            params = GenerateProductFromImageParams(
                'agents',
                'An agent that identifies product information from an image',
                'generate_product_from_image_user',
                {
                    'image': serializer.validated_data['file'],
                    'product_type': product_type,
                },
            )
            container = DjangoContainer.get_instance()
            cmd = GenerateProductFromImageCommand(container, params)
            async def async_cmd():
                return await cmd.execute()
            res = async_to_sync(async_cmd)()
            if res.success:
                return Response({
                    "status": "success",
                    "product_type": product_type,
                    "data": res.data,
                })
            else:
                return Response({
                    "details": "No product generated",
                    "message": f"error details: {res.errors}",
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "details": str(e),
                "message": "An unexpected server error occurred",
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
        
    def put(self, request, *args, **kwargs):
        logger.info("received request for image id")
        logger.info("data", request)
        serializer = AIImageProductGenerateRequestSerializer(data=request.data)
        logger.info("trying to validate data for image upload")
        serializer.is_valid(raise_exception=True)
        logger.info("data is valid for image upload")
        prompt = serializer.validated_data['prompt']
        product_type = serializer.validated_data['product_type']
        image = serializer.validated_data['file']
        try:
            svc = ProductAIGenerationService()
            content = svc.generate_by_image(prompt, product_type, image)
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
            
class ProductMonitorJobViewSet(viewsets.ModelViewSet):
    queryset = ProductMonitorJob.objects.all()
    serializer_class = ProductMonitorJobSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'user_id']
    ordering_fields = ['id']
    ordering = ['id']