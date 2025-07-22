from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_id = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name