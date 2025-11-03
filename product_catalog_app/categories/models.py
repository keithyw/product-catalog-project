from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from treebeard.mp_tree import MP_Node

class CategorySystem(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)        
    entity = models.CharField(max_length=100, blank=True, null=True)
    entity_id = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Category Systems'
        constraints = [
            models.CheckConstraint(
                check=(
                    (models.Q(entity__isnull=True) & models.Q(entity_id__isnull=True)) |
                    (models.Q(entity__isnull=False) & models.Q(entity_id__isnull=False))
                ),
            name='categorysystem_entity_xor_null'
            )
        ]
        
    def clean(self):
        super().clean()
        if (self.entity and not self.entity_id) or (not self.entity and self.entity_id):
            raise ValidationError("Entity and entity_id are not set")
            
        
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        if self.entity and self.entity_id:
            return f"{self.name} ({self.entity} ID: {self.entity_id})"
        return f"{self.name} (Global)"
    
    @property
    def owner(self):
        if self.entity and self.entity_id:
            try:
                from django.apps import apps
                model_class = apps.get_model(self.entity)
                return model_class.objects.get(pk=self.entity_id)
            except (LookupError, model_class.DoesNotExist):
                return None
        return None
    
    @owner.setter
    def owner(self, obj):
        if obj is None:
            self.entity = None
            self.entity_id = None
        else:
            from django.contrib.contenttypes.models import ContentTypeHeader
            self.entity = f"{obj._meta.app_label}.{obj._meta.model_name}"
            self.entity_id = obj.pk            

class Category(MP_Node):
    category_system = models.ForeignKey(
        'CategorySystem',
        on_delete=models.CASCADE,
        related_name='categories',
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    banner_image_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_ai_generated = models.BooleanField(default=False)
    display_order = models.IntegerField(default = 0)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.CharField(max_length=255, blank=True, null=True)
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    node_order_by = ['display_order', 'name']
    path = models.CharField(max_length=255, db_index=True)
    depth = models.PositiveIntegerField(db_index=True)
    numchild = models.PositiveIntegerField(default=0, db_index=True)
    tree_id_field = 'category_system'
    
    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = (('slug', 'category_system'), ('name', 'category_system'), ('path', 'category_system'),)
        # unique_together = unique_together + (('name', 'category_system'),)
        
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
        
    def __str__(self):
        return '-' * (self.depth - 1) + ' ' + self.name if self.depth > 0 else self.name

