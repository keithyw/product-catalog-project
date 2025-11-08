from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import PriceViewSet

router = DefaultRouter()
router.register(r'prices', PriceViewSet, basename='price')

urlpatterns = [
    path('', include(router.urls)),
]