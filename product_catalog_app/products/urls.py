from django.urls import include, path
from rest_framework import routers
from .views import ProductAttributeViewSet, ProductAttributeSetViewSet, ProductViewSet, ProductImageViewSet

router = routers.DefaultRouter()
router.register(r'product-attributes', ProductAttributeViewSet, basename='product-attribute')
router.register(r'product-attribute-sets', ProductAttributeSetViewSet, basename='product-attribute-set')
router.register(r'products', ProductViewSet, basename='product')
# router.register(r'product-image', ProductImageViewSet, basename='product-image')

urlpatterns = [
    path('', include(router.urls)),
    path('product-image/', ProductImageViewSet.as_view(), name='product-image')
]