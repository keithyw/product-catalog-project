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
    children = serializers.SerializerMethodField(read_only=True)

    nested_children_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

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
            'children',
            'nested_children_data',
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

    def get_children(self, obj):
        current_depth = self.context.get('depth', 2)
        if current_depth <= 0:
            return []
        context = self.context.copy()
        context['depth'] = current_depth - 1
        children = obj.get_children().filter(category_system=obj.category_system)
        return CategorySerializer(children, many=True, context=context).data

    def create(self, validated_data):
        nested_children_data = validated_data.pop('nested_children_data', [])
        parent_instance = validated_data.pop('parent', None)
        category_system = validated_data['category_system']
        category = None
        existing_category = Category.objects.filter(
            name=validated_data['name'],
            category_system=category_system,
            parent=parent_instance,
        ).first()

        if existing_category:
            for attr, val in validated_data.items():
                setattr(existing_category, attr, val)
            existing_category.save()
            category = existing_category
        else:
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

        for child_data in nested_children_data:
            child_data['parent'] = category.id
            child_data['category_system_id'] = category_system.id
            child_serializer = CategorySerializer(data=child_data, context=self.context)
            child_serializer.is_valid(raise_exception=True)
            child_serializer.save()

        return category

    def update(self, instance, validated_data):
        nested_children_data = validated_data.pop('nested_children_data', [])
        new_parent_instance = validated_data.pop('parent', None)

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