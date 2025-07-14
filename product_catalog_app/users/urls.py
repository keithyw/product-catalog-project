from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserMeView, ChangePasswordView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/me/password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]

# urlpatterns = format_suffix_patterns(urlpatterns)
# urlpatterns