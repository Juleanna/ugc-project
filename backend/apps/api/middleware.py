# backend/apps/api/middleware.py
from django.utils.cache import add_never_cache_headers
from django.core.cache import cache
from django.conf import settings
import hashlib
import json
from django.http import JsonResponse


class TranslationsCacheMiddleware:
    """
    Middleware для кешування перекладів та оптимізації їх віддачі
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Перевіряємо чи це запит до API перекладів
        if request.path.startswith('/api/v1/translations'):
            return self.process_translations_request(request)
        
        response = self.get_response(request)
        return response

    def process_translations_request(self, request):
        """Обробка запитів до API перекладів з кешуванням"""
        
        # Створюємо ключ кешу на основі URL та параметрів
        cache_key = self.generate_cache_key(request)
        
        # Перевіряємо кеш
        cached_response = cache.get(cache_key)
        if cached_response:
            response = JsonResponse(cached_response)
            response['X-Cache'] = 'HIT'
            return response
        
        # Якщо в кеші немає, обробляємо запит звичайним способом
        response = self.get_response(request)
        
        # Кешуємо відповідь якщо вона успішна
        if response.status_code == 200 and hasattr(response, 'data'):
            # Кешуємо на 1 годину для статичних перекладів
            timeout = 3600 if 'static' in request.path else 1800  # 30 хв для динамічних
            cache.set(cache_key, response.data, timeout)
            response['X-Cache'] = 'MISS'
        
        return response

    def generate_cache_key(self, request):
        """Генерує ключ кешу для запиту перекладів"""
        # Базовий ключ з шляху
        base_key = request.path.replace('/', '_').strip('_')
        
        # Додаємо параметри запиту
        params = sorted(request.GET.items())
        params_str = '&'.join([f"{k}={v}" for k, v in params])
        
        # Створюємо хеш для уникнення довгих ключів
        full_key = f"{base_key}_{params_str}"
        cache_key = f"translations_{hashlib.md5(full_key.encode()).hexdigest()}"
        
        return cache_key

