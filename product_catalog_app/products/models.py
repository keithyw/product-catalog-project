from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from brands.models import Brand
from categories.models import Category


class ProductAttribute(models.Model):
    ATTRIBUTE_TYPES = (
        ('text', 'Text Input'),
        ('textarea', 'Text Area'),
        ('number', 'Number'),
        ('boolean', 'Boolean (Yes/No)'),
        ('select', 'Dropdown Select'),
        ('multiselect', 'Multi-Select Dropdown'),
        ('date', 'Date'),
        ('datetime', 'Date & Time'),
        ('json', 'JSON (Raw)'),
    )

    name = models.CharField(max_length=100, unique=True)
    code = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=ATTRIBUTE_TYPES, default='text')
    is_required = models.BooleanField(default=False)
    default_value = models.JSONField(blank=True, null=True)
    options = models.JSONField(blank=True, null=True)
    validation_rules = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Product Attribute'
        verbose_name_plural = 'Product Attributes'
        ordering = ['name']

    def clean(self):
        super().clean()
        if self.type in ['select', 'multiselect']:
            if not self.options:
                raise ValidationError({'options': 'Options are required for select and multiselect types'})
            if not isinstance(self.options, list):
                raise ValidationError({'options': 'Options must be a list for select and multi-select types'})
            for option in self.options:
                if not isinstance(option, dict) or 'value' not in option or 'label' not in option:
                    raise ValidationError({'options': 'Options must be a list of dictionaries with "value" and "label" keys'})
        elif self.options is not None:
            self.options = None

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.type})"

class ProductAttributeSet(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)

    attributes = models.ManyToManyField(
        ProductAttribute,
        related_name='attribute_sets',        
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attribute_sets',
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attribute_sets',
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name = 'Product Attribute Set'
        verbose_name_plural = 'Product Attribute Sets'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name)
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        s = self.name
        if self.category:
            s += f" (Category: {self.category.name})"
        if self.brand:
            s += f" (Brand: {self.brand.name})"
        return s
    
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name