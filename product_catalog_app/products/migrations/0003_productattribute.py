# Generated by Django 5.2.3 on 2025-07-25 17:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_alter_product_description'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductAttribute',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('code', models.SlugField(blank=True, max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('type', models.CharField(choices=[('text', 'Text Input'), ('textarea', 'Text Area'), ('number', 'Number'), ('boolean', 'Boolean (Yes/No)'), ('select', 'Dropdown Select'), ('multiselect', 'Multi-Select Dropdown'), ('date', 'Date'), ('datetime', 'Date & Time'), ('json', 'JSON (Raw)')], default='text', max_length=20)),
                ('is_required', models.BooleanField(default=False)),
                ('default_value', models.JSONField(blank=True, null=True)),
                ('options', models.JSONField(blank=True, null=True)),
                ('validation_rules', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Product Attribute',
                'verbose_name_plural': 'Product Attributes',
                'ordering': ['name'],
            },
        ),
    ]
