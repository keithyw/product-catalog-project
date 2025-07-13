from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.HyperlinkedModelSerializer):
    username = serializers.CharField(min_length=3)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'date_joined',
            'last_login',        
        ]
        read_only_fields = [
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
        ]
        
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = [
            'id',
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'password', 
            'password_confirm',
            'is_active',
            'is_staff',
            'date_joined',
            'last_login',
        ]
        read_only_fields = [
            'id',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
        ]
        extra_kwargs = {'password': {'write_only': True}}
        
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
        
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
        
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'username', 'email', 'date_joined', 'last_login']
        
    def update(self, instance, validated_data):
        validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
            

