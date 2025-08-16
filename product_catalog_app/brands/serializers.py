from rest_framework import serializers
from .models import Brand

class BrandSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=1)
    description = serializers.CharField(required=False, allow_null=True)
    logo_url = serializers.URLField(required=False, allow_null=True)
    website_url = serializers.URLField(required=False, allow_null=True)
    contact_email = serializers.EmailField(required=False, allow_null=True)
    contact_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'description',
            'logo_url',
            'website_url',
            'contact_email',
            'contact_id',
        ]