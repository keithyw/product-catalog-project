from rest_framework import generics, permissions
from .models import Product
from .serializers import ProductSerializer

class ProductList(generics.ListCreateAPIView):
    """
    List all products or create a new product
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for viewing and editing product instances.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
            
# class ProductViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for viewing and editing product instances.
#     """
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer

# def index(request):
#     products = Product.objects.all()
#     product_list = ', '.join([product.name for product in products])
#     return HttpResponse(product_list or "No products available")

# def detail(request, product_id):
#     try:
#         p = Product.objects.get(id=product_id)
#     except Product.DoesNotExist:
#         return HttpResponse(f"Product {product_id} not found", status=404)
#     return HttpResponse(f"Name: {p.name} Description: {p.description}")