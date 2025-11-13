from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Price, PriceModifier, PriceRule
from .serializers import PriceSerializer, PriceModifierSerializer, PriceRuleSerializer

class PriceRuleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing price rule instances.
    """
    queryset = PriceRule.objects.all()
    serializer_class = PriceRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['name', 'description', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name', 'priority']
    ordering = ['id']
    
class PriceModifierViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing price modifier instances.
    """
    queryset = PriceModifier.objects.all()
    serializer_class = PriceModifierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['name', 'description', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name', 'priority']
    ordering = ['id']
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