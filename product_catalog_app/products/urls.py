from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from products import views

# router = routers.DefaultRouter()
# router.register(r'products', ProductViewSet)    

urlpatterns = [
    path('products/', views.ProductList.as_view()),
    path('products/<int:pk>/', views.ProductDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)