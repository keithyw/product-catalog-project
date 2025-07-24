from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategorySystemViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'category-systems', CategorySystemViewSet, basename='category-system')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]