from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserMeView, ChangePasswordView, GroupViewSet, PermissionListView

router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/me/password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
    path('permissions/', PermissionListView.as_view(), name='permission-list'),
]

# urlpatterns = format_suffix_patterns(urlpatterns)
# urlpatterns