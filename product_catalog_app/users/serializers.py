from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']
class GroupSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions']

        
class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(min_length=3)
    email = serializers.EmailField(required=True)
    groups = GroupSerializer(many=True, read_only=True)

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
            'groups',
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
    groups = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.all(),
        required=False,    
    )
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
            'groups',
        ]
        read_only_fields = ['id', 'username', 'email', 'date_joined', 'last_login']
        
    def update(self, instance, validated_data):
        validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
            
class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for authenticater user profile
    """
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'date_joined',
            'last_login',
        ]
        read_only_fields = fields
        
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating authenticated user profile
    """
    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
        ]
        read_only_fields = [
            'username',
            'is_active',
            'is_staff',
            'date_joined',
            'last_login',
        ]
        
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError({"old_password": "Old password is incorrect."})
        return value
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New password does not match."})
        return data