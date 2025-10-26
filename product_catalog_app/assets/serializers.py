from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers
from .models import Asset, AssetAssociation

class AssetSerializer(serializers.ModelSerializer):
    url = serializers.CharField(max_length=255, required=False)
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
        
    def validate(self, attrs):
        request = self.context.get('request')
        file = request and request.FILES.get('file')
        url = attrs.get('url')
        if request.method == 'POST':
            if not file and not url:
                raise serializers.ValidationError({"message": "Provide either an uploaded file or url"})
        if file and 'url' in attrs:
            del attrs['url']
        return attrs

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