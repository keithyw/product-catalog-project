from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import CategorySystem, Category
from .serializers import CategorySystemSerializer, CategorySerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
class CategorySystemViewSet(viewsets.ModelViewSet):
    queryset = CategorySystem.objects.all().order_by('name')
    serializer_class = CategorySystemSerializer
    permission_classes = []
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filter_fields = ['name']
    search_fields = ['name']
    ordering_fields = ['id', 'name']
    ordering = ['id']
    
    def get_queryset(self):
        return super().get_queryset()
    
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('category_system__name', 'path')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description', 'category_system_name']
    ordering_fields = ['id', 'name']

    def get_queryset(self):
        queryset = super().get_queryset()
        category_system_id = self.request.query_params.get('category_system_id', None)
        category_system_slug = self.request.query_params.get('category_system_slug', None)
        if category_system_id:
            queryset = queryset.filter(category_system_id=category_system_id)
        elif category_system_slug:
            queryset = queryset.filter(category_system_slug=category_system_slug)
        return queryset.select_related('category_system')
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        system_id = request.query_params.get('system_id', None)
        system_slug = request.query_params.get('system_slug', None)
        
        if not system_id and not system_slug:
            return Response(
                {"detail": "You must provide either system_id or system_slug."},
                status=status.HTTP_400_BAD_REQUEST
            )
        category_system = None
        if system_id:
            category_system = get_object_or_404(CategorySystem, pk=system_id)
        elif system_slug:
            category_system = get_object_or_404(CategorySystem, slug=system_slug)
        categories = Category.objects.filter(category_system=category_system).order_by('path')
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)