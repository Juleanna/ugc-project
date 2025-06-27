# backend/apps/api/translations_views.py - РЕФАКТОРИНГ
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.core.cache import cache
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.http import JsonResponse
import json
import os
import logging

logger = logging.getLogger(__name__)


class TranslationsRateThrottle(AnonRateThrottle):
    """Спеціальний throttle для API перекладів"""
    scope = 'translations'
    rate = '100/min'  # 100 запитів за хвилину


class UnifiedTranslationsAPIView(APIView):
    """
    Універсальний API для всіх типів перекладів
    Об'єднує функціональність StaticTranslationsAPIView, 
    DynamicTranslationsAPIView та TranslationsAPIView
    """
    
    throttle_classes = [TranslationsRateThrottle]
    
    SUPPORTED_LOCALES = ['uk', 'en']
    SUPPORTED_SOURCES = ['all', 'static', 'po', 'dynamic']
    
    def get(self, request, locale='uk'):
        """Повертає переклади для заданої локалі"""
        
        # Валідація параметрів
        if locale not in self.SUPPORTED_LOCALES:
            return Response({
                'error': f'Непідтримувана локаль: {locale}',
                'supported_locales': self.SUPPORTED_LOCALES
            }, status=status.HTTP_400_BAD_REQUEST)
        
        source = request.GET.get('source', 'all')
        namespace = request.GET.get('namespace', None)
        force_refresh = request.GET.get('refresh', 'false').lower() == 'true'
        
        if source not in self.SUPPORTED_SOURCES:
            return Response({
                'error': f'Непідтримуване джерело: {source}',
                'supported_sources': self.SUPPORTED_SOURCES
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cache_key = self._get_cache_key(locale, source, namespace)
        
        # Перевіряємо кеш (якщо не примусове оновлення)
        if not force_refresh:
            translations = cache.get(cache_key)
            if translations is not None:
                logger.info(f"Повернуто з кешу: {cache_key}")
                return Response({
                    'translations': translations,
                    'locale': locale,
                    'source': 'cache',
                    'namespace': namespace,
                    'count': len(translations),
                    'cache_key': cache_key
                })
        
        # Завантажуємо переклади
        try:
            translations = self._load_translations(locale, source, namespace)
            
            # Зберігаємо в кеш на 15 хвилин
            cache.set(cache_key, translations, 60 * 15)
            
            logger.info(f"Завантажено {len(translations)} перекладів для {locale} з {source}")
            
            return Response({
                'translations': translations,
                'locale': locale,
                'source': source,
                'namespace': namespace,
                'count': len(translations),
                'cached': True
            })
            
        except Exception as e:
            logger.error(f"Помилка завантаження перекладів: {str(e)}")
            return Response({
                'error': 'Помилка завантаження перекладів',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_cache_key(self, locale, source, namespace):
        """Генерує ключ для кешування"""
        namespace_part = f"_{namespace}" if namespace else ""
        return f"translations_{locale}_{source}{namespace_part}"
    
    def _load_translations(self, locale, source, namespace):
        """Завантажує переклади залежно від джерела"""
        translations = {}
        
        if source in ['all', 'static']:
            static_translations = self._load_static_translations(locale, namespace)
            translations.update(static_translations)
            
        if source in ['all', 'po']:
            po_translations = self._load_po_translations(locale, namespace)
            translations.update(po_translations)
            
        if source in ['all', 'dynamic']:
            dynamic_translations = self._load_dynamic_translations(locale, namespace)
            translations.update(dynamic_translations)
        
        return translations
    
    def _load_static_translations(self, locale, namespace):
        """Завантаження статичних JSON файлів"""
        try:
            # Визначаємо шлях до файлу
            frontend_path = getattr(settings, 'FRONTEND_DIR', 
                                  os.path.join(settings.BASE_DIR, '..', 'frontend'))
            
            file_name = f'{namespace}.json' if namespace else 'common.json'
            file_path = os.path.join(frontend_path, 'public', 'locales', locale, file_name)
            
            if not os.path.exists(file_path):
                logger.warning(f"Файл не знайдено: {file_path}")
                
                # Fallback до української якщо це не українська
                if locale != 'uk':
                    fallback_path = os.path.join(frontend_path, 'public', 'locales', 'uk', file_name)
                    if os.path.exists(fallback_path):
                        file_path = fallback_path
                        logger.info(f"Використано fallback: {fallback_path}")
                    else:
                        return {}
                else:
                    return {}
            
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logger.info(f"Завантажено статичних перекладів: {len(data)} з {file_path}")
                return data
                
        except json.JSONDecodeError as e:
            logger.error(f"Помилка парсингу JSON файлу {file_path}: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"Помилка завантаження статичних перекладів: {str(e)}")
            return {}
    
    def _load_po_translations(self, locale, namespace):
        """Завантаження з .po файлів Django"""
        try:
            from django.utils.translation import get_language, activate
            from django.utils.translation import gettext_lazy as _
            
            # Зберігаємо поточну мову
            current_language = get_language()
            
            try:
                # Активуємо потрібну мову
                activate(locale)
                
                # Тут би була логіка для читання .po файлів
                # Для прикладу повертаємо порожній словник
                po_translations = {}
                
                # Якщо є конкретний namespace, фільтруємо
                if namespace:
                    po_translations = {
                        k: v for k, v in po_translations.items() 
                        if k.startswith(f"{namespace}.")
                    }
                
                return po_translations
                
            finally:
                # Відновлюємо попередню мову
                activate(current_language)
                
        except Exception as e:
            logger.error(f"Помилка завантаження .po перекладів: {str(e)}")
            return {}
    
    def _load_dynamic_translations(self, locale, namespace):
        """Завантаження з моделей Django (для перекладів контенту)"""
        try:
            dynamic_translations = {}
            
            # Тут можна додати логіку для завантаження перекладів з моделей
            # Наприклад, якщо у вас є модель Translation або подібна
            
            # Приклад для завантаження перекладів з різних моделей
            try:
                from apps.content.models import HomePage, AboutPage
                from apps.services.models import Service
                from apps.projects.models import Project, ProjectCategory
                
                # Завантажуємо переклади з моделей залежно від namespace
                if not namespace or namespace == 'content':
                    # Головна сторінка
                    try:
                        homepage = HomePage.objects.filter(is_active=True).first()
                        if homepage:
                            dynamic_translations.update({
                                'homepage.company_description': getattr(homepage, f'company_description_{locale}', homepage.company_description),
                                'homepage.mission_text': getattr(homepage, f'mission_text_{locale}', homepage.mission_text),
                                'homepage.values_text': getattr(homepage, f'values_text_{locale}', homepage.values_text),
                            })
                    except Exception as e:
                        logger.warning(f"Помилка завантаження HomePage: {str(e)}")
                
                if not namespace or namespace == 'services':
                    # Послуги
                    try:
                        services = Service.objects.filter(is_active=True)[:20]  # Обмежуємо кількість
                        for service in services:
                            dynamic_translations.update({
                                f'services.{service.id}.name': getattr(service, f'name_{locale}', service.name),
                                f'services.{service.id}.description': getattr(service, f'short_description_{locale}', service.short_description),
                            })
                    except Exception as e:
                        logger.warning(f"Помилка завантаження Services: {str(e)}")
                
                if not namespace or namespace == 'projects':
                    # Категорії проектів
                    try:
                        categories = ProjectCategory.objects.filter(is_active=True)
                        for category in categories:
                            dynamic_translations.update({
                                f'categories.{category.id}.name': getattr(category, f'name_{locale}', category.name),
                                f'categories.{category.id}.description': getattr(category, f'description_{locale}', category.description),
                            })
                    except Exception as e:
                        logger.warning(f"Помилка завантаження ProjectCategory: {str(e)}")
                
                logger.info(f"Завантажено {len(dynamic_translations)} динамічних перекладів")
                
            except ImportError as e:
                logger.warning(f"Модулі не знайдено для динамічних перекладів: {str(e)}")
            
            return dynamic_translations
            
        except Exception as e:
            logger.error(f"Помилка завантаження динамічних перекладів: {str(e)}")
            return {}


class TranslationWebhookView(APIView):
    """
    Webhook для очищення кешу перекладів при оновленні
    """
    
    def post(self, request):
        """Очищує кеш перекладів"""
        try:
            # Очищаємо всі кеші перекладів
            cache_pattern = "translations_*"
            
            # Якщо використовується Redis
            try:
                from django_redis import get_redis_connection
                con = get_redis_connection("default")
                keys = con.keys(cache_pattern)
                if keys:
                    con.delete(*keys)
                    logger.info(f"Очищено {len(keys)} ключів кешу перекладів")
            except ImportError:
                # Fallback для локального кешу
                cache.clear()
                logger.info("Очищено весь локальний кеш")
            
            return Response({
                'success': True,
                'message': 'Кеш перекладів очищено'
            })
            
        except Exception as e:
            logger.error(f"Помилка очищення кешу: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)