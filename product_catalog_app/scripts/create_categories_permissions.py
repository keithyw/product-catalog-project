# scripts/create_categories_permissions.py

import os
import sys
import django
# from django.conf import settings
# from django.apps import apps
# from django.contrib.contenttypes.models import ContentType
# from django.contrib.auth.models import Permission
# from django.db import transaction

script_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory (which should be the Django project root)
project_root = os.path.dirname(script_dir)
# Add the project root to sys.path so Django can find your project's settings module
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# --- IMPORTANT: Configure Django environment ---
# Replace 'your_project_name.settings' with the actual path to your project's settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'product_catalog_app.settings')

print("DEBUG: Calling django.setup()...")
django.setup()
print("DEBUG: django.setup() completed successfully.")

from django.conf import settings
from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from django.db import transaction

print("DEBUG: Django model and module imports successful after setup.")

def create_categories_permissions():
    """
    Creates ContentType and default Permissions for CategorySystem and Category
    models specifically in the user_db.
    """
    # Define the models for which you need permissions
    try:
        CategorySystem = apps.get_model('categories', 'CategorySystem')
        Category = apps.get_model('categories', 'Category')
    except LookupError:
        print("Error: Could not find 'categories.CategorySystem' or 'categories.Category' models.")
        print("Ensure 'categories' app is in INSTALLED_APPS and models are correctly defined.")
        return

    target_models = [CategorySystem, Category]

    # --- IMPORTANT: Specify the database alias for permissions ---
    # This should be the alias defined in your settings.py for your user database
    permissions_db_alias = 'user_db' # <-- Confirm this matches your settings.py

    print(f"Attempting to create ContentTypes and Permissions for 'categories' app models in '{permissions_db_alias}'...")

    # Use a transaction for atomic operations
    with transaction.atomic(using=permissions_db_alias):
        for model in target_models:
            app_label = model._meta.app_label
            model_name = model._meta.model_name # Lowercase model name for ContentType

            # 1. Get or create the ContentType for the model in the target database
            content_type, created_ct = ContentType.objects.using(permissions_db_alias).get_or_create(
                app_label=app_label,
                model=model_name
            )
            if created_ct:
                print(f" - Created ContentType for {app_label}.{model_name}")
            else:
                print(f" - ContentType for {app_label}.{model_name} already exists.")

            # 2. Create default permissions (add, change, delete, view) for the ContentType
            default_permissions_data = [
                (f'add_{model_name}', f'Can add {model._meta.verbose_name_raw}'),
                (f'change_{model_name}', f'Can change {model._meta.verbose_name_raw}'),
                (f'delete_{model_name}', f'Can delete {model._meta.verbose_name_raw}'),
                (f'view_{model_name}', f'Can view {model._meta.verbose_name_raw}'),
            ]

            for codename, name in default_permissions_data:
                permission, created_perm = Permission.objects.using(permissions_db_alias).get_or_create(
                    codename=codename,
                    defaults={'name': name, 'content_type': content_type}
                )
                if created_perm:
                    print(f"   - Created permission: '{codename}'")
                else:
                    print(f"   - Permission '{codename}' already exists.")

    print("\nPermissions creation process complete.")

if __name__ == '__main__':
    create_categories_permissions()