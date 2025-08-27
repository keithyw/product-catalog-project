from rest_framework import serializers
from .models import Asset, AssetAssociation

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'id',
            'name',
            'url',
            'type',
            'filepath',
            'extension',
            'dimensions',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        
class AssetAssociationSerializer(serializers.ModelSerializer):
    owner_details = serializers.SerializerMethodField()
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())

    class Meta:
        model = AssetAssociation
        fields = [
            'id',
            'asset',
            'entity',
            'entity_id',
            'owner_details',
        ]
        read_only_fields = ['owner_details']
        
    def get_owner_details(self, obj):
        owner = obj.owner
        if owner:
            return {
                'id': owner.id,
                'name': getattr(owner, 'name', str(owner)),
                'type': owner._meta.model_name
            }
        return None