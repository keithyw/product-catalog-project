from rest_framework import viewsets, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .models import Brand
from .serializers import BrandSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 200
    
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    pagination_class = StandardResultsSetPagination
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
    
    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request, *args, **kwargs):
        if not request.user.has_perm('brands.add_brand'):
            raise PermissionDenied('You do not have permission to bulk create brands')
        if not isinstance(request.data, list):
            return Response(
                message="Expected a list of brand objects for bulk creation",
                status=status.HTTP_400_BAD_REQUEST,
                created_brands=[]
            )
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        brands = [
            Brand(
                name=b.get('name'),
                description=b.get('description'),
                logo_url=b.get('logo_url'),
                website_url=b.get('website_url'),
                contact_email=b.get('contact_email'),
                contact_id=b.get('contact_id'),
            )
            for b in serializer.validated_data
        ]
        created = Brand.objects.bulk_create(brands)
        response_serializer = self.get_serializer(created, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)