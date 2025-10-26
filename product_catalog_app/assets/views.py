from rest_framework import viewsets, serializers, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from product_catalog_app.core.utils.file_management import delete_asset_file, save_uploaded_file
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
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        return super().get_queryset()
    
    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        data = self.request.data.copy()
        type = data.get('type')
        if file:
            try:
                file_info = save_uploaded_file(file, type)
                serializer.validated_data['url'] = self.request.build_absolute_uri(file_info['url'])
                serializer.validated_data['extension'] = file_info['extension']
                serializer.validated_data['filepath'] = file_info['filepath']
                serializer.validated_data['type'] = type
            except Exception as e:
                raise serializers.ValidationError({"message": f"Failed saving file: {e}"})
        serializer.save()

    def perform_update(self, serializer):
        file = self.request.FILES.get('file')
        instance = serializer.instance
        data = self.request.data.copy()
        type = data.get('type')
        old_file = instance.filepath
        if file:
            try:
                file_info = save_uploaded_file(file, type)
                serializer.validated_data['url'] = self.request.build_absolute_uri(file_info['url'])
                serializer.validated_data['extension'] = file_info['extension']
                serializer.validated_data['filepath'] = file_info['filepath']
                serializer.validated_data['type'] = type
                if old_file:
                    delete_asset_file(old_file)
            except Exception as e:
                raise serializers.ValidationError({"message": f"Failed saving file: {e}"})
        elif data.get('url') and not file and old_file:
            delete_asset_file(old_file)
        serializer.save()

    def perform_destroy(self, instance):
        file = instance.filepath
        if file:
            delete_asset_file(file)
        super().perform_destroy(instance)

class AssetAssociationViewSet(viewsets.ModelViewSet):
    queryset = AssetAssociation.objects.all().order_by('id')
    serializer_class = AssetAssociationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]    
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['entity', 'entity_id']
    ordering = ['id']
        
    