from rest_framework import viewsets, generics, mixins, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer, UserProfileSerializer, UserProfileUpdateSerializer, PasswordChangeSerializer, GroupSerializer, PermissionSerializer

User = get_user_model()

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 500

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['get', 'put'], serializer_class=PermissionSerializer, permission_classes=[IsAdminUser])
    def permissions(self, request, pk=None):
        group = self.get_object()
        if request.method == 'GET':
            serializer = PermissionSerializer(group.permissions.all(), many=True)
            return Response(serializer.data)
        elif request.method == 'PUT':
            perm_ids = request.data
            if not isinstance(perm_ids, list):
                return Response(
                    {"detail": "Permission ids are not provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            perms = Permission.objects.filter(id__in=perm_ids)
            if len(perms) != len(set(perm_ids)):
                found_ids = set(p.id for p in perms)
                missing_ids = [id for id in perm_ids if id not in found_ids]
                return Response (
                    {"detail": f"One or more permission IDs are invalid or do not exist: {missing_ids}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            group.permissions.set(perms)
            serializer = PermissionSerializer(group.permissions.all(), many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]    
    filterset_fields = ['name', 'codename']
    search_fields = ['name', 'codename']
    ordering_fields = ['id', 'name', 'codename']
    ordering = ['name']

# class UserViewSet(viewsets.ModelViewSet):
class UserViewSet(
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]  # Base authentication, specific permissions handled by decorators
    pagination_class = StandardResultsSetPagination    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['username', 'email', 'first_name', 'last_name']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['id', 'username', 'first_name', 'last_name', 'date_joined', 'last_login']    
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def list(self, request, *args, **kwargs):
        """List users - requires view_user permission"""
        if not request.user.has_perm('users.view_user'):
            raise PermissionDenied('You do not have permission to view users.')
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a user - requires view_user permission"""
        if not request.user.has_perm('users.view_user'):
            raise PermissionDenied('You do not have permission to view users.')
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update a user - requires change_user permission"""
        if not request.user.has_perm('users.change_user'):
            raise PermissionDenied('You do not have permission to change users.')
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Partially update a user - requires change_user permission"""
        if not request.user.has_perm('users.change_user'):
            raise PermissionDenied('You do not have permission to change users.')
        return super().partial_update(request, *args, **kwargs)

    def filter_queryset(self, queryset):
        ordering = self.request.query_params.get('ordering')
        if ordering:
            fields = []
            for field in ordering.split(','):
                field = field.strip()
                if field == 'full_name':
                    fields.extend(['first_name', 'last_name'])
                elif field == '-full_name':
                    fields.extend(['-first_name', '-last_name'])
                else:
                    fields.append(field)
            queryset = queryset.order_by(*fields)
            return super().filter_queryset(queryset.none()) | queryset
        return super().filter_queryset(queryset)
    
    @action(detail=True, methods=['get', 'put'], serializer_class=GroupSerializer)
    def groups(self, request, pk=None):
        if not request.user.has_perm('users.change_user'):
            raise PermissionDenied('You do not have permission to manage user groups.')
        user = self.get_object()
        if request.method == 'GET':
            serializer = GroupSerializer(user.groups.all(), many=True)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            group_ids = request.data
            if not isinstance(group_ids, list):
                return Response(
                    {"detail": "Group ids are not provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            existing_groups_queryset = Group.objects.filter(id__in=group_ids)
            if len(existing_groups_queryset) != len(set(group_ids)):
                found_ids = set(g.id for g in existing_groups_queryset)
                missing_ids = [id for id in group_ids if id not in found_ids]
                return Response(
                    {"detail": f"One or more group IDs are invalid or do not exist: {missing_ids}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.groups.set(existing_groups_queryset)
            serializer = GroupSerializer(user.groups.all(), many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
 
        
    def create(self, request, *args, **kwargs):
        """Create a user - requires add_user permission"""
        if not request.user.has_perm('users.add_user'):
            raise PermissionDenied('You do not have permission to create users.')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a user - requires delete_user permission"""
        if not request.user.has_perm('users.delete_user'):
            raise PermissionDenied('You do not have permission to delete users.')
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserMeView(APIView):        
    """
    API endpoint for authenticated user to view and modify
    their profile
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request, *args, **kwargs):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(UserProfileSerializer(user, context={'request': request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password changed successfully'}, status=status.HTTP_200_OK)
        
    
    