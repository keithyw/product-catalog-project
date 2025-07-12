from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.HyperlinkedModelSerializer):
    name = serializers.CharField(min_length=3)
    description = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']