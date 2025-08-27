from rest_framework import viewsets, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Asset, AssetAssociation
from .serializers import AssetSerializer, AssetAssociationSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 200

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by('id')
    serializer_class = AssetSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_fields = ['name', 'type', 'filepath', 'extension', 'url']
    search_fields = ['name', 'type', 'filepath', 'extension', 'url']
    ordering_fields = ['id', 'name']
    ordering = ['id']
    
    def get_queryset(self):
        return super().get_queryset()
    
class AssetAssociationViewSet(viewsets.ModelViewSet):
    queryset = AssetAssociation.objects.all().order_by('id')
    serializer_class = AssetAssociationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]    
    ordering = ['id']
        
    