from rest_framework import serializers
from categories.models import Category
from products.models import Product, ProductAttribute
from .models import Price, PriceModifier

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

class PriceModifierSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )
    product_attribute_name = serializers.CharField(source='product_attribute.name', read_only=True)
    product_attribute = serializers.PrimaryKeyRelatedField(
        queryset=ProductAttribute.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = PriceModifier
        fields = [
            'id',
            'name',
            'description',
            'amount',
            'category',
            'category_name',
            'product_attribute',
            'product_attribute_name',
            'type',
            'priority',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'category_name',
            'product_attribute_name',
            'created_at',
            'updated_at',
        ]

                