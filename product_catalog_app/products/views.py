from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, ProductAttribute, ProductAttributeSet
from .serializers import ProductSerializer, ProductAttributeSerializer, ProductAttributeSetSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
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