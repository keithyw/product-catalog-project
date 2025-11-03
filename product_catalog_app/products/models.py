import uuid
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
    display_name = models.CharField(max_length=100, blank=True, null=True)
    sample_values = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.PositiveSmallIntegerField(blank=True, null=True)

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

    product_type_brands = models.ManyToManyField(
        Brand,
        related_name='product_attribute_sets',
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

    VERIFICATION_CHOICES = (
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('FAILED', 'Failed Verification'),
        ('EXEMPT', 'Does not require verification'),
        ('REJECTED', 'Rejected'),
        ('ACCEPTED', 'Accepted'),
    )

    verification_status = models.CharField(
        max_length=25,
        choices=VERIFICATION_CHOICES,
        default='EXEMPT',
        help_text="Status realted to AI generated product's that require verification",
    )

    # this will serve as a composite key from the attributes. because
    # attributes are dynamic, we can't easily create a normal key
    lookup_field = models.JSONField(blank=True, null=True, default=list)
    is_active = models.BooleanField(default=True)
    is_ai_generated = models.BooleanField(default=False)
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

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )

    is_active = models.BooleanField(default=True)
    is_ai_generated = models.BooleanField(default=False)

    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
    )
    attribute_set = models.ForeignKey(
        ProductAttributeSet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
    )

    attributes_data = models.JSONField(blank=True, null=True, default=dict)
    suggested_corrections = models.JSONField(blank=True, null=True, default=dict)

    VERIFICATION_CHOICES = (
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('FAILED', 'Failed Verification'),
        ('EXEMPT', 'Does not require verification'),
        ('REJECTED', 'Rejected'),
        ('ACCEPTED', 'Accepted'),
    )

    verification_status = models.CharField(
        max_length=25,
        choices=VERIFICATION_CHOICES,
        default='EXEMPT',
        help_text="Status realted to AI generated product's that require verification",
    )

    class Meta:
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['name']

    def clean(self):
        super().clean()
        pass

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (ID: {self.id})"