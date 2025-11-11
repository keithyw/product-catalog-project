from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import PriceViewSet, PriceModifierViewSet


router = DefaultRouter()
router.register(r'prices', PriceViewSet, basename='price')
router.register(r'price-modifiers', PriceModifierViewSet, basename='price-modifier')

urlpatterns = [
    path('', include(router.urls)),
]