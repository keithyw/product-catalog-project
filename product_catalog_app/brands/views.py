from rest_framework import viewsets, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .models import Brand
from .serializers import BrandSerializer

class StandardResultsSetPagianation(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 20
    
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    pagination_class = StandardResultsSetPagianation
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_fields = ['name', 'description']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name']
    ordering = ['id']
    
    def list(self, request, *args, **kwargs):
        if not request.user.has_perm('brands.view_brand'):
            raise PermissionDenied('You do not have permission to view brands.')
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        if not request.user.has_perm('brands.view_brand'):
            raise PermissionDenied('You do not have permission to view brands.')
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        if not request.user.has_perm('brands.add_brand'):
            raise PermissionDenied('You do not have permission to create brands.')
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        if not request.user.has_perm('brands.change_brand'):
            raise PermissionDenied('You do not have permission to change brands.')
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        if not request.user.has_perm('brands.change_brand'):
            raise PermissionDenied('You do not have permission to change brands.')
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if not request.user.has_perm('brands.delete_brand'):
            raise PermissionDenied('You do not have permission to delete brands.')
        return super().destroy(request, *args, **kwargs)
    
