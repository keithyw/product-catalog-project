from rest_framework import serializers
from .models import InventoryItem
from products.models import Product

class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        allow_null=True,
        required=False,
    )
    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'product_name',
            'product',
            'sku',
            'attributes_data',
            'quantity',
            'reserved',
            'low_stock_threshold',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'product_name',
            'created_at',
            'updated_at',
        ]