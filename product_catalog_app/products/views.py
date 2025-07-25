from rest_framework import permissions, viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
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