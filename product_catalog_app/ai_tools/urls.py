from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AIGenerateContentView

# router = DefaultRouter()
# router.register(r'ai-tools', AIGenerateContentView, basename='ai_tools')

urlpatterns = [
    path('generate/', AIGenerateContentView.as_view(), name='ai-tools')
]