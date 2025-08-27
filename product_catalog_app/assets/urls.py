from django.urls import include, path
from rest_framework import routers
from .views import AssetViewSet, AssetAssociationViewSet

router = routers.DefaultRouter()
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'asset-associations', AssetAssociationViewSet, basename='asset-association')

urlpatterns = [
    path('', include(router.urls)),
]