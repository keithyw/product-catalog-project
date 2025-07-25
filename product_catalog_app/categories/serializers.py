from rest_framework import serializers
from .models import CategorySystem, Category

class CategorySystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategorySystem
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'entity',
            'entity_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'owner_detail']
        
    def get_owner_detail(self, obj):
        owner = obj.owner
        if owner:
            return {
                'id': owner.id,
                'name': getattr(owner, 'name', str(owner)),
                'type': owner._meta.model_name
            }
        return None
    
class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False
    )
    category_system_id = serializers.PrimaryKeyRelatedField(
        queryset=CategorySystem.objects.all(),
        source='category_system'
    )
    category_system_name = serializers.CharField(source='category_system.name', read_only=True)
    category_system_slug = serializers.CharField(source='category_system.slug', read_only=True)
    
    parent_name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'image_url',
            'banner_image_url',
            'is_active',
            'display_order',
            'meta_title',
            'meta_description',
            'meta_keywords',
            'created_at',
            'updated_at',
            'parent',
            'parent_name',
            'category_system_id',
            'category_system_name',
            'category_system_slug',
            'depth',
            'path',
        ]
        read_only_fields = [
            'slug', 'created_at', 'updated_at',
            'depth', 'path', 'category_system_name', 'category_system_slug', 
            'parent_name',
        ]

    def get_parent_name(self, obj):
        if obj.parent:
            return obj.parent.name
        return None
        
    def create(self, validated_data):
        parent_instance = validated_data.pop('parent', None)
        category_system = validated_data['category_system']

        if parent_instance is None: # Trying to create a new top-level category
            existing_root_for_system = Category.objects.filter(
                category_system=category_system, depth=1
            ).first()

            if existing_root_for_system:
                category = existing_root_for_system.add_sibling('sorted-sibling', **validated_data)
            else:
                # No root exists for this system, create the first root
                category = Category.add_root(**validated_data)
        else:
            category = parent_instance.add_child(**validated_data)
            category.parent = parent_instance
            category.save()
        return category
        
    
    def update(self, instance, validated_data):
        new_parent_instance = validated_data.pop('parent')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_parent_instance is not None and new_parent_instance != instance.parent:
            if new_parent_instance.category_system != instance.category_system:
                raise serializers.ValidationError({ "parent": "Parent category must belong to the same category system"})
            instance.move(new_parent_instance, pos='sorted-child')
            instance.parent = new_parent_instance
        elif new_parent_instance is None and instance.parent is not None:
            if not instance.is_root():
                existing_root_for_system = Category.objects.filter(
                    category_system=instance.category_system,
                    depth=1
                ).first()
                if existing_root_for_system and existing_root_for_system != instance:
                    instance.move(existing_root_for_system, pos='sorted-sibling')
                else:
                    instance.move(None)
            instance.parent = None
        instance.save()
        return instance