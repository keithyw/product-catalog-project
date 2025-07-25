from rest_framework import serializers
from .models import Product, ProductAttribute, ProductAttributeSet
from brands.models import Brand
from categories.models import Category

class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = [
            'id',
            'name',
            'code',
            'description',
            'type',
            'is_required',
            'default_value',
            'options',
            'validation_rules',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['code', 'created_at', 'updated_at']
        
    def validate(self, data):
        instance = ProductAttribute(**data)
        try:
            instance.clean()
        except Exception as e:
            raise serializers.ValidationError(e.message_dict)
        return data

class ProductAttributeSetSerializer(serializers.ModelSerializer):
    attributes = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=ProductAttribute.objects.all(),
    )

    attributes_detail = ProductAttributeSerializer(source='attributes', many=True, read_only=True)

    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        allow_null=True,
        required=False
    )
    
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False
    )
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = ProductAttributeSet
        fields = [
            'id',
            'name',
            'code',
            'description',
            'attributes',
            'attributes_detail',
            'brand',
            'brand_name',
            'category',
            'category_name',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'code',
            'created_at',
            'updated_at',
            'brand_name',
            'category_name',
        ]
        
    def validate(self, data):
        dummy_instance = ProductAttributeSet(**{
            k: v for k, v in data.items() if k not in ['attributes', 'attributes_detail']
        })
        try:
            dummy_instance.clean()
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data
        
    def create(self, validated_data):
        attributes_data = validated_data.pop('attributes', [])
        product_attribute_set = ProductAttributeSet.objects.create(**validated_data)
        product_attribute_set.attributes.set(attributes_data)
        return product_attribute_set
    
    def update(self, instance, validated_data):
        attributes_data = validated_data.pop('attributes', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if attributes_data is not None:
            instance.attributes.set(attributes_data)
        return instance    

class ProductSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=3)
    description = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']