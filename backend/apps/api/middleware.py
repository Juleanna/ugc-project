# backend/apps/api/middleware.py - ВИПРАВЛЕНИЙ
from django.utils.cache import add_never_cache_headers
from django.core.cache import cache
from django.conf import settings
from django.http import JsonResponse
import hashlib
import json
import time
import logging

logger = logging.getLogger(__name__)


class TranslationsCacheMiddleware:
    """
    Middleware для кешування перекладів та rate limiting
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit_window = 60  # 1 хвилина
        self.max_requests_per_window = 100  # максимум 100 запитів за хвилину (збільшено)

    def __call__(self, request):
        # Перевіряємо чи це запит до API перекладів
        if self._is_translations_request(request):
            return self._process_translations_request(request)
        
        response = self.get_response(request)
        return response

    def _is_translations_request(self, request):
        """Перевіряє чи це запит до API перекладів"""
        translations_paths = [
            '/api/v1/translations',
            '/api/v1/dynamic-translations',
            '/api/v1/po-translations'
        ]
        return any(request.path.startswith(path) for path in translations_paths)

    def _process_translations_request(self, request):
        """Обробка запитів до API перекладів з кешуванням та rate limiting"""
        
        # Rate limiting
        if not self._check_rate_limit(request):
            logger.warning(f"Rate limit exceeded for IP: {self._get_client_ip(request)}")
            return JsonResponse({
                'error': 'Перевищено ліміт запитів. Спробуйте пізніше.',
                'retry_after': self.rate_limit_window
            }, status=429)
        
        # Створюємо ключ кешу на основі URL та параметрів
        cache_key = self._generate_cache_key(request)
        
        # Перевіряємо кеш тільки для GET запитів
        if request.method == 'GET':
            cached_response = cache.get(cache_key)
            if cached_response:
                logger.info(f"Cache HIT для: {cache_key[:30]}...")
                response = JsonResponse(cached_response)
                response['X-Cache'] = 'HIT'
                response['X-Cache-Key'] = cache_key[:20] + '...'
                return response
        
        # Якщо в кеші немає, обробляємо запит звичайним способом
        response = self.get_response(request)
        
        # Кешуємо відповідь якщо вона успішна і це GET запит
        if (response.status_code == 200 and 
            request.method == 'GET' and 
            hasattr(response, 'content')):
            
            try:
                response_data = json.loads(response.content.decode('utf-8'))
                
                # Визначаємо час кешування залежно від типу перекладів
                if 'dynamic' in request.path:
                    timeout = 1800  # 30 хв для динамічних
                elif 'static' in request.path or 'translations' in request.path:
                    timeout = 3600  # 1 година для статичних
                else:
                    timeout = 900   # 15 хв для інших
                    
                cache.set(cache_key, response_data, timeout)
                response['X-Cache'] = 'MISS'
                response['X-Cache-Timeout'] = str(timeout)
                logger.info(f"Cache SET для: {cache_key[:30]}... (timeout: {timeout}s)")
                
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                logger.warning(f"Не вдалося кешувати відповідь: {str(e)}")
        
        return response

    def _check_rate_limit(self, request):
        """Перевірка rate limiting"""
        # Отримуємо IP клієнта
        client_ip = self._get_client_ip(request)
        rate_key = f"rate_limit_translations_{client_ip}"
        
        # Отримуємо поточний count
        current_requests = cache.get(rate_key, 0)
        
        if current_requests >= self.max_requests_per_window:
            return False
        
        # Збільшуємо лічильник
        cache.set(rate_key, current_requests + 1, self.rate_limit_window)
        return True

    def _get_client_ip(self, request):
        """Отримання IP адреси клієнта"""
        # Перевіряємо заголовки від проксі
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        return ip

    def _generate_cache_key(self, request):
        """Генерує ключ кешу для запиту перекладів"""
        # Базовий ключ з шляху
        base_key = request.path.replace('/api/v1/', '').replace('/', '_').strip('_')
        
        # Додаємо відсортовані параметри запиту
        params = sorted(request.GET.items())
        params_str = '&'.join([f"{k}={v}" for k, v in params])
        
        # Додаємо мову з заголовків якщо є
        accept_language = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
        
        # Створюємо повний ключ
        full_key = f"{base_key}_{params_str}_{accept_language}"
        
        # Створюємо хеш для уникнення довгих ключів
        cache_key = f"trans_cache_{hashlib.md5(full_key.encode()).hexdigest()}"
        
        return cache_key


class CorsMiddleware:
    """
    Спрощений CORS middleware для API перекладів
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Додаємо CORS заголовки для всіх API запитів
        if request.path.startswith('/api/'):
            if request.method == 'OPTIONS':
                response = JsonResponse({})
                response['Access-Control-Allow-Origin'] = self._get_allowed_origin(request)
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Max-Age'] = '86400'
                return response
        
        response = self.get_response(request)
        
        # Додаємо CORS заголовки до відповіді
        if request.path.startswith('/api/'):
            response['Access-Control-Allow-Origin'] = self._get_allowed_origin(request)
            response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
    
    def _get_allowed_origin(self, request):
        """Визначає дозволений origin"""
        origin = request.META.get('HTTP_ORIGIN', '')
        
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ])
        
        if origin in allowed_origins:
            return origin
        
        # В режимі DEBUG дозволяємо localhost
        if settings.DEBUG and ('localhost' in origin or '127.0.0.1' in origin):
            return origin
            
        # За замовчуванням
        return allowed_origins[0] if allowed_origins else '*'


class SecurityHeadersMiddleware:
    """
    Додає безпекові заголовки для API
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Додаємо безпекові заголовки тільки для API
        if request.path.startswith('/api/'):
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-Frame-Options'] = 'DENY'
            response['X-XSS-Protection'] = '1; mode=block'
            
            # Для перекладів додаємо кешування
            if 'translations' in request.path:
                response['Cache-Control'] = 'public, max-age=1800'  # 30 хвилин
            else:
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        
        return response