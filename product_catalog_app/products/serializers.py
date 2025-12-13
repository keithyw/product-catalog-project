import json
from django.db import models
from rest_framework import serializers
from .models import Product, ProductAttribute, ProductAttributeSet, ProductMonitorJob
from assets.models import AssetAssociation
from assets.serializers import AssetSerializer
from brands.models import Brand
from categories.models import Category
from prices.models import Price
from prices.serializers import PriceSerializer

class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = [
            'id',
            'name',
            'code',
            'display_name',
            'display_order',
            'sample_values',
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

    product_type_brands = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Brand.objects.all(),
        allow_null=True,
        required=False,
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
            'product_type_brands',
            'attributes_detail',
            'brand',
            'brand_name',
            'category',
            'category_name',
            'lookup_field',
            'is_active',
            'is_ai_generated',
            'verification_status',
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
        brands_data = data.pop('product_type_brands', None)
        attributes_data = data.pop('attributes', None)

        dummy_instance = ProductAttributeSet(**{
            k: v for k, v in data.items() if k not in ['attributes_detail']
        })
        try:
            dummy_instance.clean()
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        if attributes_data is not None:
            data['attributes'] = attributes_data
        if brands_data is not None:
            data['product_type_brands'] = brands_data
        return data
        
    def create(self, validated_data):
        attributes_data = validated_data.pop('attributes', [])
        brands_data = validated_data.pop('product_type_brands', [])
        product_attribute_set = ProductAttributeSet.objects.create(**validated_data)
        product_attribute_set.attributes.set(attributes_data)
        product_attribute_set.product_type_brands.set(brands_data)
        return product_attribute_set
    
    def update(self, instance, validated_data):
        attributes_data = validated_data.pop('attributes', None)
        brands_data = validated_data.pop('product_type_brands', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if attributes_data is not None:
            instance.attributes.set(attributes_data)
        if brands_data is not None:
            instance.product_type_brands.set(brands_data)
        return instance

class AIImageProductGenerateRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=5000)
    product_type = serializers.CharField(max_length=150)
    file = serializers.FileField()

class AIProductGenerateRequestSeralizer(serializers.Serializer):
    prompt = serializers.CharField(max_length=5000)
    product_type = serializers.CharField(max_length=150)
class ProductSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=3)
    description = serializers.CharField(required=False, allow_null=True)
    uuid = serializers.UUIDField(read_only=True,)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    attribute_set_name = serializers.CharField(source='attribute_set.name', read_only=True)

    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        allow_null=True,
        required=False,
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )
    attribute_set = serializers.PrimaryKeyRelatedField(
        queryset=ProductAttributeSet.objects.all(),
    )
    assets = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'brand',
            'brand_name',
            'category',
            'category_name',
            'assets',
            'attribute_set',
            'attribute_set_name',
            'attributes_data',
            'price',
            'suggested_corrections',
            'uuid',
            'is_active',
            'is_ai_generated',
            'verification_status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'brand_name',
            'category_name',
            'attribute_set_name',
            'uuid',
            'created_at',
            'updated_at',
        ]

        def validate(self, data):
            # Retrieve the attribute_set and attributes_data from the incoming dictionary.
            # This is the reliable way to access sibling fields.
            attribute_set_id = data.get('attribute_set')
            attributes_data = data.get('attributes_data')

            # If we are updating an existing instance and the attribute_set is not provided,
            # we can get it from the instance.
            if self.instance and not attribute_set_id:
                attribute_set_id = self.instance.attribute_set_id

            # Proceed with validation only if an attribute set is specified.
            if not attribute_set_id:
                # If no attribute set, no attributes_data validation is needed.
                # We can return the data as is.
                return data

            try:
                attribute_set = ProductAttributeSet.objects.get(pk=attribute_set_id.id)
            except ProductAttributeSet.DoesNotExist:
                raise serializers.ValidationError({"attribute_set": "Attribute set does not exist"})

            defined_attributes = attribute_set.attributes.all()

            if attributes_data is None:
                attributes_data = {}

            if not isinstance(attributes_data, dict):
                raise serializers.ValidationError({"attributes_data": "must be a JSON object."})

            # The rest of your validation logic remains the same, but now operates
            # on the 'attributes_data' field from the 'data' dictionary.
            for attr in defined_attributes:
                attr_code = attr.code
                attr_value = attributes_data.get(attr_code)

                if attr.is_required and (attr_value is None or (isinstance(attr_value, str) and not attr_value.strip())):
                    raise serializers.ValidationError(
                        {attr_code: f"'{attr.name}' is required."}
                    )

                if attr_value is None and not attr.is_required:
                    continue

                if attr.type == 'number':
                    try:
                        # You should check for `isinstance(attr_value, (int, float))` first
                        # before attempting `float(attr_value)`.
                        if not isinstance(attr_value, (int, float)):
                            float(attr_value)
                    except (ValueError, TypeError):
                        raise serializers.ValidationError(
                            {attr_code: f"'{attr.name}' must be a valid number."}
                        )
                    # Validation rules check
                    if attr.validation_rules and isinstance(attr_value, (int, float)):
                        if 'min' in attr.validation_rules and attr_value < attr.validation_rules['min']:
                            raise serializers.ValidationError(
                                {attr_code: f"'{attr.name}' must be at least {attr.validation_rules['min']}."}
                            )
                        if 'max' in attr.validation_rules and attr_value > attr.validation_rules['max']:
                            raise serializers.ValidationError(
                                {attr_code: f"'{attr.name}' must be at most {attr.validation_rules['max']}'"}
                            )
                elif attr.type == 'boolean':
                    if not isinstance(attr_value, bool):
                        raise serializers.ValidationError(
                            {attr_code: f"'{attr.name}' must be a boolean"}
                        )
                elif attr.type in ['select', 'multiselect']:
                    valid_values = [opt['value'] for opt in attr.options] if attr.options else []
                    if attr.type == 'select':
                        if attr_value not in valid_values:
                            raise serializers.ValidationError(
                                {attr_code: f"'{attr.name}' value '{attr_value}' is not a valid option."}
                            )
                    elif attr.type == 'multiselect':
                        if not isinstance(attr_value, list):
                            raise serializers.ValidationError(
                                {attr_code: f"'{attr.name}' must be a list of values."}
                            )
                        if not all(item in valid_values for item in attr_value):
                            raise serializers.ValidationError(
                                {attr_code: f"One or more values in '{attr.name}' are not valid options."}
                            )
                elif attr.type == 'json':
                    if not isinstance(attr_value, (dict, list)):
                        try:
                            json.loads(attr_value)
                        except (json.JSONDecodeError, TypeError):
                            raise serializers.ValidationError(
                                {attr_code: f"'{attr.name}' must be valid JSON."}
                            )
                elif attr.type == 'date':
                    try:
                        models.DateField().to_python(attr_value)
                    except (ValueError, TypeError):
                        raise serializers.ValidationError(
                            {attr_code: f"'{attr.name}' must be a valid date (YYYY-MM-DD)."}
                        )
                elif attr.type == 'datetime':
                    try:
                        models.DateTimeField().to_python(attr_value)
                    except (ValueError, TypeError):
                        raise serializers.ValidationError(
                            {attr_code: f"'{attr.name}' must be a valid datetime (YYYY-MM-DDTHH:MM:SSZ)."}
                        )
                elif attr.type in ['text', 'textarea']:
                    if not isinstance(attr_value, str):
                        raise serializers.ValidationError(
                            {attr_code: f"'{attr.name}' must be a string."}
                        )
                    if attr.validation_rules and isinstance(attr_value, str):
                        if 'min_length' in attr.validation_rules and len(attr_value) < attr.validation_rules['min_length']:
                            raise serializers.ValidationError(
                                {attr_code: f"'{attr.name}' must be at least {attr.validation_rules['min_length']} characters long."}
                            )
                        if 'max_length' in attr.validation_rules and len(attr_value) > attr.validation_rules['max_length']:
                            raise serializers.ValidationError(
                                {attr_code: f"'{attr.name}' must be at most {attr.validation_rules['max_length']} characters long."}
                            )
                        if 'pattern' in attr.validation_rules:
                            import re
                            if not re.match(attr.validation_rules['pattern'], attr_value):
                                raise serializers.ValidationError(
                                    {attr_code: f"'{attr.name}' does not match the required pattern."}
                                )

            # Return the validated data at the end
            return data

    def get_assets(self, obj: Product) -> list:
        ENTITY_TYPE = 'Product'
        associations = AssetAssociation.objects.filter(
            entity=ENTITY_TYPE,
            entity_id=obj.pk,
        ).select_related('asset')
        ordered_assets = [
            assoc.asset for assoc in associations if assoc.asset
        ]
        return AssetSerializer(ordered_assets, many=True).data

    def get_price(self, obj: Product):
        try:
            price = Price.objects.get(
                product=obj,
                is_active=True,
            )
            return PriceSerializer(price).data if price else None
        except Price.DoesNotExist:
            return None
        except Exception:
            return None

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
    
class ProductMonitorJobSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        allow_null=False,
        required=True,
    )
    class Meta:
        model = ProductMonitorJob
        fields = [
            'id',
            'product',
            'target_price',
            'frequency',
            'is_active',
            'job_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'created_at',
            'updated_at',
        ]