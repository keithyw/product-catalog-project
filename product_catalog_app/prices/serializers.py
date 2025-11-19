from rest_framework import serializers
from categories.models import Category
from products.models import Product, ProductAttribute, ProductAttributeSet
from .models import Price, PriceModifier, PriceRule

class PriceRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceRule
        fields = [
            'id',
            'name',
            'description',
            'rule_type',
            'rule_config',
            'active_from',
            'active_to',
            'callback_function',
            'priority',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
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
    
    product_attribute_set_name = serializers.CharField(source='product_attribute_set.name', read_only=True)
    product_attribute_set = serializers.PrimaryKeyRelatedField(
        queryset=ProductAttributeSet.objects.all(),
        allow_null=True,
        required=False,
    )

    price_rules_output = PriceRuleSerializer(
        source='price_rules',
        many=True,
        read_only=True,
    )

    price_rules = serializers.PrimaryKeyRelatedField(
        queryset=PriceRule.objects.all(),
        many=True,
        required=False,
        write_only=True,
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
            'price_rules',
            'price_rules_output',
            'product_attribute',
            'product_attribute_value',
            'product_attribute_name',
            'product_attribute_set',
            'product_attribute_set_name',
            'type',
            'priority',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'category_name',
            'product_attribute_name',
            'product_attribute_set_name',
            'created_at',
            'updated_at',
        ]
class PriceSerializer(serializers.ModelSerializer):
    product_price_name = serializers.CharField(source='product.name', read_only=True)
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        allow_null=False,
        required=True,
    )
    
    price_modifiers = serializers.PrimaryKeyRelatedField(
        queryset=PriceModifier.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )
    
    price_modifiers_output = PriceModifierSerializer(
        source='price_modifiers',
        many=True,
        read_only=True,
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
            'price_modifiers',
            'price_modifiers_output',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'product_price_name',
            'created_at',
            'updated_at',
        ]



