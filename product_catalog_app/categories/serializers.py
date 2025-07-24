from rest_framework import serializers
from django.db import transaction
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
            'category_system_id',
            'category_system_name',
            'category_system_slug',
            'depth',
            'path',
        ]
        read_only_fields = [
            'slug', 'created_at', 'updated_at',
            'depth', 'path', 'category_system_name', 'category_system_slug',
        ]
        
    def create(self, validated_data):
        parent = validated_data.pop('parent', None)
        category_system = validated_data['category_system'] # Get the CategorySystem instance

        # Check if a root for this category_system already exists
        # This is crucial: we only want one "treebeard root" per CategorySystem
        # All other top-level categories for this system should be siblings of that root.
        existing_root_for_system = Category.objects.filter(
            category_system=category_system,
            depth=1 # Depth 1 indicates a root node in treebeard's Materialized Path
        ).first()

        if parent is None: # Trying to create a new top-level category
            if existing_root_for_system:
                # If a root already exists for this system, add as a sibling to that root
                # This ensures all top-level categories for a system are part of the same treebeard tree
                category = existing_root_for_system.add_sibling('sorted-sibling', **validated_data)
            else:
                # No root exists for this system, create the first root
                category = Category.add_root(**validated_data)
        else:
            # Adding as a child to an existing parent
            category = parent.add_child(**validated_data)

        return category
        
    
    def update(self, instance, validated_data):
        if 'parent' in validated_data:
            new_parent = validated_data.pop('parent')
            if new_parent is None: # Moving to root level
                # Check if it's already a root, or move it to be a root's sibling
                if not instance.is_root():
                    # Find any existing root for its category system
                    existing_root_for_system = Category.objects.filter(
                        category_system=instance.category_system,
                        depth=1
                    ).first()
                    if existing_root_for_system and existing_root_for_system != instance:
                        # Move it as a sibling of the existing root
                        instance.move(existing_root_for_system, pos='sorted-sibling')
                    else:
                        # If no other root, or it's the only root, just ensure it's a root
                        # treebeard's move method handles making it a root if target is None.
                        # This might require a specific root-making method if treebeard doesn't auto-handle this.
                        # A direct move to None target usually means making it a root.
                        instance.move(None) # This makes it a new root in its own tree_id if tree_id_field wasn't set.
                                            # With tree_id_field, it should become a root within that tree_id.
            elif new_parent is not None:
                # Moving under a new parent
                # Ensure the new parent belongs to the same category system
                if new_parent.category_system != instance.category_system:
                    raise serializers.ValidationError(
                        {"parent": "Parent category must belong to the same category system."}
                    )
                instance.move(new_parent, pos='last-child') # Or 'sorted-child'
        return super().update(instance, validated_data)