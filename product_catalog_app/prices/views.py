from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Price
from .serializers import PriceSerializer

class PriceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing price instances.
    """
    queryset = Price.objects.all()
    serializer_class = PriceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['price', 'currency_code', 'region_code', 'is_active']
    search_fields = ['price', 'currency_code', 'region_code']
    ordering_fields = ['id', 'price']
    ordering = ['id']
    
