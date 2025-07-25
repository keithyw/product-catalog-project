from django.urls import include, path
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns
from .views import ProductAttributeViewSet, ProductAttributeSetViewSet, ProductViewSet

router = routers.DefaultRouter()
router.register(r'product-attributes', ProductAttributeViewSet, basename='product-attribute')
router.register(r'product-attribute-sets', ProductAttributeSetViewSet, basename='product-attribute-set')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # path('products/', views.ProductList.as_view()),
    # path('products/<int:pk>/', views.ProductDetail.as_view()),
    path('', include(router.urls)),
]

# urlpatterns = format_suffix_patterns(urlpatterns)