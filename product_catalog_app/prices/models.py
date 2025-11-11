from django.db import models
from products.models import Product

class Price(models.Model):
    price = models.DecimalField(decimal_places=2, max_digits=20, default=0.0)
    # ISO 4217
    currency_code = models.CharField(max_length=3, blank=True, null=True, default='USD')
    # ISO 3166-1 alpha-3
    region_code = models.CharField(max_length=3, blank=True, null=True, default='USA')
    # Price depends on being associated to a product
    product = models.ForeignKey(
        Product,
        related_name='products',
        on_delete=models.CASCADE,
    )
    # easier than enum; manual, import, api, calculated etc
    price_source = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(blank=True, null=True)
    valid_to = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Price'
        verbose_name_plural = 'Prices'
        ordering = ['created_at']
        
class PriceModifier(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(decimal_places=2, max_digits=20, default=0.0)
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='price_modifiers',
    )
    
    product_attribute = models.ForeignKey(
        'products.ProductAttribute',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='price_modifiers',
    )
    
    MODIFIER_TYPES = (
        ('flat_amount', 'Flat Amount'),
        ('percentage', 'Percentage'),
        ('fixed_price', 'Fixed Price'),
    )
    type = models.CharField(max_length=20, choices=MODIFIER_TYPES, default='flat_amount')
    priority = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name = 'Price Modifier'
        verbose_name_plural = 'Price Modifiers'
        ordering = ['priority']