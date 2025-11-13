from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import PriceViewSet, PriceModifierViewSet, PriceRuleViewSet


router = DefaultRouter()
router.register(r'price-rules', PriceRuleViewSet, basename='price-rule')
router.register(r'price-modifiers', PriceModifierViewSet, basename='price-modifier')
router.register(r'prices', PriceViewSet, basename='price')

urlpatterns = [
    path('', include(router.urls)),
]