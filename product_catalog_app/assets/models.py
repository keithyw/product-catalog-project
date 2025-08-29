from django.db import models

class Asset(models.Model):
    url = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=50, null=False)
    filepath = models.CharField(max_length=500, blank=True, null=True)
    extension = models.CharField(max_length=10, blank=True, null=True)
    dimensions = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Assets'
    
    def __str__(self):
        return f"{self.type} ({self.url})"
    
class AssetAssociation(models.Model):    
    asset = models.ForeignKey(
        'Asset',
        on_delete=models.CASCADE,
        related_name='asset_associations',
    )
    entity = models.CharField(max_length=100, blank=True, null=True)
    entity_id = models.PositiveIntegerField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'Asset Assocations'
        unique_together = ('asset', 'entity', 'entity_id')
        
    def __str__(self):
        if self.entity and self.entity_id:
            return f"{self.asset.name or self.asset.url} associated with {self.entity} ID: {self.entity_id}"
        return f"{self.asset.name or self.asset.url} (unassociated)"
    
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
            self.entity = f"{obj._meta.app_label}.{obj._meta.model_name}"
            self.entity_id = obj.pk