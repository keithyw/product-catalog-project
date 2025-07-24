from django.core.management.base import BaseCommand
from categories.models import Category


class Command(BaseCommand):
    help = 'Fix category tree structure and resolve path conflicts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write(self.style.SUCCESS('Starting category tree fix...'))
        
        # Check current tree state
        total_categories = Category.objects.count()
        self.stdout.write(f'Total categories: {total_categories}')
        
        if total_categories == 0:
            self.stdout.write(self.style.WARNING('No categories found.'))
            return
        
        # Get all paths and check for duplicates
        paths = list(Category.objects.values_list('path', flat=True))
        duplicate_paths = [p for p in set(paths) if paths.count(p) > 1]
        
        if duplicate_paths:
            self.stdout.write(
                self.style.ERROR(f'Found duplicate paths: {duplicate_paths}')
            )
        else:
            self.stdout.write(self.style.SUCCESS('No duplicate paths found.'))
        
        # Check tree consistency
        try:
            problems = Category.find_problems()
            if problems:
                self.stdout.write(
                    self.style.ERROR(f'Tree problems found: {len(problems)} issues')
                )
                for problem in problems[:5]:  # Show first 5 problems
                    self.stdout.write(f'  - {problem}')
                if len(problems) > 5:
                    self.stdout.write(f'  ... and {len(problems) - 5} more')
            else:
                self.stdout.write(self.style.SUCCESS('Tree structure is consistent.'))
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error checking tree problems: {e}')
            )
        
        # Fix the tree if not dry run
        if not dry_run:
            if duplicate_paths or (problems if 'problems' in locals() else False):
                self.stdout.write('Attempting to fix tree structure...')
                try:
                    Category.fix_tree()
                    self.stdout.write(self.style.SUCCESS('Tree structure fixed!'))
                    
                    # Verify fix
                    new_paths = list(Category.objects.values_list('path', flat=True))
                    new_duplicates = [p for p in set(new_paths) if new_paths.count(p) > 1]
                    
                    if new_duplicates:
                        self.stdout.write(
                            self.style.ERROR(f'Still have duplicate paths: {new_duplicates}')
                        )
                    else:
                        self.stdout.write(self.style.SUCCESS('All path duplicates resolved!'))
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error fixing tree: {e}')
                    )
            else:
                self.stdout.write(self.style.SUCCESS('No fixes needed.'))
        else:
            self.stdout.write(self.style.WARNING('Dry run mode - no changes made.'))
        
        self.stdout.write(self.style.SUCCESS('Category tree fix completed.'))
