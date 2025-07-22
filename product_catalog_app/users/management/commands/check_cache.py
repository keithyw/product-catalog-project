from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.db import connection
from django.contrib.auth import get_user_model
import time

User = get_user_model()

class Command(BaseCommand):
    help = 'Check if cachalot is working by monitoring cache and query counts'

    def handle(self, *args, **options):
        # Clear any existing cache
        cache.clear()
        self.stdout.write('Cache cleared.')
        
        # Reset query count
        connection.queries_log.clear()
        
        # First query - should hit database
        self.stdout.write('\n=== First Query (should hit database) ===')
        start_queries = len(connection.queries)
        
        users = list(User.objects.all()[:5])
        
        end_queries = len(connection.queries)
        query_count_1 = end_queries - start_queries
        
        self.stdout.write(f'Query count: {query_count_1}')
        self.stdout.write(f'Users found: {len(users)}')
        
        # Check cache keys
        cache_info = self._get_cache_info()
        self.stdout.write(f'Cache keys after first query: {cache_info["key_count"]}')
        
        # Second identical query - should hit cache
        self.stdout.write('\n=== Second Query (should hit cache) ===')
        start_queries = len(connection.queries)
        
        users_cached = list(User.objects.all()[:5])
        
        end_queries = len(connection.queries)
        query_count_2 = end_queries - start_queries
        
        self.stdout.write(f'Query count: {query_count_2}')
        self.stdout.write(f'Users found: {len(users_cached)}')
        
        # Results
        self.stdout.write('\n=== Results ===')
        if query_count_2 < query_count_1:
            self.stdout.write(
                self.style.SUCCESS('✅ Cachalot is working! Second query used fewer database hits.')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ Cachalot might not be working. Same number of queries.')
            )
        
        # Cache statistics
        final_cache_info = self._get_cache_info()
        self.stdout.write(f'\nFinal cache key count: {final_cache_info["key_count"]}')
        
        # Show some cache keys
        if final_cache_info["keys"]:
            self.stdout.write('\nSample cache keys:')
            for key in final_cache_info["keys"][:5]:
                self.stdout.write(f'  - {key}')

    def _get_cache_info(self):
        """Get information about current cache state"""
        try:
            # For Redis, we can get all keys
            from django_redis import get_redis_connection
            redis_conn = get_redis_connection("default")
            keys = redis_conn.keys("*")
            return {
                "key_count": len(keys),
                "keys": [key.decode() if isinstance(key, bytes) else key for key in keys]
            }
        except Exception as e:
            return {"key_count": "Unknown", "keys": [], "error": str(e)}
