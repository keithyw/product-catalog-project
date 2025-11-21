from django.db import models

class InventoryItem(models.Model):
    product = models.ForeignKey(
        'products.Product', 
        on_delete=models.CASCADE,
        related_name='inventory_items',
        help_text='The product this inventory item belongs to',
    )
    sku = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Stock Keeping Unit identifier.'
    )
    attributes_data = models.JSONField(
        blank=True, 
        null=True, 
        default=dict,
        help_text='Attributes data for the inventory item',
    )
    quantity = models.PositiveIntegerField(
        default=0,
        help_text='The quantity of the product in stock',
    )
    reserved = models.PositiveIntegerField(
        default=0,
        help_text="Quantity reserved for pending orders to prevent overselling"
    )
    low_stock_threshold = models.PositiveIntegerField(
        default=5,
        help_text="Quantity level that triggers low stock alerts"
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Whether the inventory item is active',
    )
    last_stocktake = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date of last physical inventory count"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Inventory Item"
        verbose_name_plural = "Inventory Items"
        unique_together = ('product', 'sku')
        ordering = ['product', 'sku']
    
