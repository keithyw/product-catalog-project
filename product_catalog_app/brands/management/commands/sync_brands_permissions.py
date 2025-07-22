from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from django.apps import apps
from django.db import transaction


class Command(BaseCommand):
    help = 'Sync brands app content types and permissions to user_db'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating it',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Get the brands app
        try:
            brands_app = apps.get_app_config('brands')
        except LookupError:
            self.stdout.write(
                self.style.ERROR('Brands app not found. Make sure it\'s in INSTALLED_APPS.')
            )
            return

        # Get all models from the brands app
        brands_models = list(brands_app.get_models())
        
        if not brands_models:
            self.stdout.write(
                self.style.WARNING('No models found in brands app.')
            )
            return

        self.stdout.write(f'Found {len(brands_models)} model(s) in brands app:')
        for model in brands_models:
            self.stdout.write(f'  - {model._meta.label}')

        # Process each model
        created_content_types = 0
        created_permissions = 0
        
        with transaction.atomic(using='user_db'):
            for model in brands_models:
                # Create or get content type in user_db
                content_type, ct_created = self._create_content_type(model, dry_run)
                if ct_created:
                    created_content_types += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'{"[DRY RUN] Would create" if dry_run else "Created"} ContentType: {content_type}')
                    )
                else:
                    self.stdout.write(f'ContentType already exists: {content_type}')

                # Create permissions for this model
                permissions_created = self._create_permissions(model, content_type, dry_run)
                created_permissions += permissions_created

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('SUMMARY:'))
        self.stdout.write(f'Content Types {"would be " if dry_run else ""}created: {created_content_types}')
        self.stdout.write(f'Permissions {"would be " if dry_run else ""}created: {created_permissions}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nRun without --dry-run to actually create these entries.'))
        else:
            self.stdout.write(self.style.SUCCESS('\nSync completed successfully!'))

    def _create_content_type(self, model, dry_run):
        """Create or get ContentType for a model in user_db"""
        if dry_run:
            # Check if it exists
            try:
                ct = ContentType.objects.using('user_db').get(
                    app_label=model._meta.app_label,
                    model=model._meta.model_name
                )
                return ct, False
            except ContentType.DoesNotExist:
                # Would be created
                return ContentType(
                    app_label=model._meta.app_label,
                    model=model._meta.model_name
                ), True
        else:
            # Actually create or get
            ct, created = ContentType.objects.using('user_db').get_or_create(
                app_label=model._meta.app_label,
                model=model._meta.model_name
            )
            return ct, created

    def _create_permissions(self, model, content_type, dry_run):
        """Create default permissions for a model"""
        permissions_created = 0
        
        # Default Django permissions
        default_permissions = [
            ('add', f'Can add {model._meta.verbose_name}'),
            ('change', f'Can change {model._meta.verbose_name}'),
            ('delete', f'Can delete {model._meta.verbose_name}'),
            ('view', f'Can view {model._meta.verbose_name}'),
        ]
        
        for codename_suffix, name in default_permissions:
            codename = f'{codename_suffix}_{model._meta.model_name}'
            
            if dry_run:
                # In dry-run mode, check if content type exists first
                try:
                    existing_ct = ContentType.objects.using('user_db').get(
                        app_label=model._meta.app_label,
                        model=model._meta.model_name
                    )
                    # Check if permission exists using the existing content type
                    try:
                        Permission.objects.using('user_db').get(
                            content_type=existing_ct,
                            codename=codename
                        )
                        self.stdout.write(f'  Permission already exists: {codename}')
                    except Permission.DoesNotExist:
                        self.stdout.write(
                            self.style.SUCCESS(f'  [DRY RUN] Would create permission: {codename}')
                        )
                        permissions_created += 1
                except ContentType.DoesNotExist:
                    # Content type doesn't exist, so permission definitely doesn't exist
                    self.stdout.write(
                        self.style.SUCCESS(f'  [DRY RUN] Would create permission: {codename}')
                    )
                    permissions_created += 1
            else:
                # Actually create
                permission, created = Permission.objects.using('user_db').get_or_create(
                    content_type=content_type,
                    codename=codename,
                    defaults={'name': name}
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'  Created permission: {codename}')
                    )
                    permissions_created += 1
                else:
                    self.stdout.write(f'  Permission already exists: {codename}')
        
        return permissions_created
