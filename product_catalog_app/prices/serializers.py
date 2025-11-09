from rest_framework import serializers
from products.models import Product
from .models import Price

class PriceSerializer(serializers.ModelSerializer):
    product_price_name = serializers.CharField(source='product.name', read_only=True)
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        allow_null=False,
        required=True,
    )
    
    class Meta:
        model = Price
        fields = [
            'id',
            'price',
            'currency_code',
            'region_code',
            'product',
            'product_price_name',
            'price_source',
            'is_active',
            'valid_from',
            'valid_to',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'product_price_name',
            'created_at',
            'updated_at',
        ]
        