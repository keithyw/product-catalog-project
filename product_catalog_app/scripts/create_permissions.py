# scripts/create_permissions.py - Generic permissions creator for any Django model

import os
import sys
import django
import argparse
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

def create_permissions_for_models(app_models, db_alias='user_db'):
    """
    Creates ContentType and default Permissions for specified models.
    
    Args:
        app_models: List of tuples in format [(app_label, model_name), ...]
        db_alias: Database alias where permissions should be created
    """
    target_models = []
    
    # Dynamically import the specified models
    for app_label, model_name in app_models:
        try:
            model = apps.get_model(app_label, model_name)
            target_models.append(model)
            print(f"Successfully loaded model: {app_label}.{model_name}")
        except LookupError:
            print(f"Error: Could not find '{app_label}.{model_name}' model.")
            print(f"Ensure '{app_label}' app is in INSTALLED_APPS and model '{model_name}' is correctly defined.")
            return False

    print(f"Attempting to create ContentTypes and Permissions for {len(target_models)} models in '{db_alias}'...")

    # Use a transaction for atomic operations
    with transaction.atomic(using=db_alias):
        for model in target_models:
            app_label = model._meta.app_label
            model_name = model._meta.model_name # Lowercase model name for ContentType

            # 1. Get or create the ContentType for the model in the target database
            content_type, created_ct = ContentType.objects.using(db_alias).get_or_create(
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
                permission, created_perm = Permission.objects.using(db_alias).get_or_create(
                    codename=codename,
                    defaults={'name': name, 'content_type': content_type}
                )
                if created_perm:
                    print(f"   - Created permission: '{codename}'")
                else:
                    print(f"   - Permission '{codename}' already exists.")

    print("\nPermissions creation process complete.")
    return True


def parse_arguments():
    """
    Parse command line arguments for app and model specifications.
    """
    parser = argparse.ArgumentParser(
        description='Create Django permissions for specified models',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python create_permissions.py categories.CategorySystem categories.Category
  python create_permissions.py --db-alias default users.User brands.Brand
  python create_permissions.py products.Product --db-alias user_db
        """
    )
    
    parser.add_argument(
        'models',
        nargs='+',
        help='Models to create permissions for in format app_label.ModelName (e.g., categories.Category)'
    )
    
    parser.add_argument(
        '--db-alias',
        default='user_db',
        help='Database alias where permissions should be created (default: user_db)'
    )
    
    return parser.parse_args()


def main():
    """
    Main function to handle command line execution.
    """
    args = parse_arguments()
    
    # Parse model specifications
    app_models = []
    for model_spec in args.models:
        if '.' not in model_spec:
            print(f"Error: Invalid model specification '{model_spec}'. Use format 'app_label.ModelName'")
            sys.exit(1)
        
        app_label, model_name = model_spec.split('.', 1)
        app_models.append((app_label, model_name))
    
    print(f"Creating permissions for models: {[f'{app}.{model}' for app, model in app_models]}")
    print(f"Target database: {args.db_alias}")
    print()
    
    # Create permissions
    success = create_permissions_for_models(app_models, args.db_alias)
    
    if success:
        print("\n✅ All permissions created successfully!")
    else:
        print("\n❌ Some errors occurred during permission creation.")
        sys.exit(1)


if __name__ == '__main__':
    main()