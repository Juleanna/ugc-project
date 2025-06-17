from django.utils.cache import add_never_cache_headers
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse
import hashlib
import json
import time

class TranslationsCacheMiddleware:
    """
    Middleware для кешування перекладів та rate limiting
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit_window = 60  # 1 хвилина
        self.max_requests_per_window = 30  # максимум 30 запитів за хвилину

    def __call__(self, request):
        # Перевіряємо чи це запит до API перекладів
        if request.path.startswith('/api/v1/translations') or \
           request.path.startswith('/api/v1/dynamic-translations'):
            return self.process_translations_request(request)
        
        response = self.get_response(request)
        return response

    def process_translations_request(self, request):
        """Обробка запитів до API перекладів з кешуванням та rate limiting"""
        
        # Rate limiting
        if not self.check_rate_limit(request):
            return JsonResponse(
                {'error': 'Rate limit exceeded. Please wait before making more requests.'}, 
                status=429
            )
        
        # Створюємо ключ кешу на основі URL та параметрів
        cache_key = self.generate_cache_key(request)
        
        # Перевіряємо кеш
        cached_response = cache.get(cache_key)
        if cached_response:
            response = JsonResponse(cached_response)
            response['X-Cache'] = 'HIT'
            response['X-Cache-Key'] = cache_key[:20] + '...'
            return response
        
        # Якщо в кеші немає, обробляємо запит звичайним способом
        response = self.get_response(request)
        
        # Кешуємо відповідь якщо вона успішна
        if response.status_code == 200:
            try:
                response_data = json.loads(response.content.decode('utf-8'))
                # Кешуємо на різний час залежно від типу
                if 'static' in request.path or 'translations' in request.path:
                    timeout = 3600  # 1 година для статичних
                else:
                    timeout = 1800  # 30 хв для динамічних
                    
                cache.set(cache_key, response_data, timeout)
                response['X-Cache'] = 'MISS'
                response['X-Cache-Timeout'] = str(timeout)
            except:
                pass
        
        return response

    def check_rate_limit(self, request):
        """Перевірка rate limiting"""
        # Отримуємо IP клієнта
        client_ip = self.get_client_ip(request)
        rate_key = f"rate_limit_translations_{client_ip}"
        
        # Отримуємо поточний count
        current_requests = cache.get(rate_key, 0)
        
        if current_requests >= self.max_requests_per_window:
            return False
        
        # Збільшуємо лічильник
        cache.set(rate_key, current_requests + 1, self.rate_limit_window)
        return True

    def get_client_ip(self, request):
        """Отримання IP адреси клієнта"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

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