# backend/apps/api/translations_views.py - ВИПРАВЛЕНИЙ
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.core.cache import cache
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import json
import os
import logging
import polib

logger = logging.getLogger(__name__)


class TranslationsRateThrottle(AnonRateThrottle):
    """Спеціальний throttle для API перекладів"""
    scope = 'translations'
    rate = '100/min'  # 100 запитів за хвилину


class UnifiedTranslationsAPIView(APIView):
    """
    Об'єднаний API для всіх типів перекладів
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
        
        # Генеруємо ключ кешу
        cache_key = f"unified_translations_{locale}_{source}_{namespace or 'all'}"
        
        # Перевіряємо кеш
        if not force_refresh:
            cached_data = cache.get(cache_key)
            if cached_data:
                logger.info(f"Використання кешованих перекладів: {cache_key}")
                return Response(cached_data)
        
        try:
            # Збираємо переклади з різних джерел
            translations = {}
            sources_used = []
            
            if source in ['all', 'static']:
                static_translations = self.get_static_translations(locale, namespace)
                translations.update(static_translations)
                sources_used.append('static')
                logger.info(f"Завантажено {len(static_translations)} статичних перекладів")
            
            if source in ['all', 'po']:
                po_translations = self.get_po_translations(locale)
                translations.update(po_translations)
                sources_used.append('po')
                logger.info(f"Завантажено {len(po_translations)} po перекладів")
            
            if source in ['all', 'dynamic']:
                dynamic_translations = self.get_dynamic_translations(locale, namespace)
                translations.update(dynamic_translations)
                sources_used.append('dynamic')
                logger.info(f"Завантажено {len(dynamic_translations)} динамічних перекладів")
            
            # Формуємо відповідь
            response_data = {
                'locale': locale,
                'translations': translations,
                'count': len(translations),
                'sources': sources_used,
                'namespace': namespace,
                'cached': False,
                'timestamp': str(timezone.now()) if hasattr(timezone, 'now') else 'unknown'
            }
            
            # Кешуємо результат
            cache_timeout = 3600 if source != 'dynamic' else 1800  # 1 год для статичних, 30 хв для динамічних
            cache.set(cache_key, response_data, cache_timeout)
            
            logger.info(f"Успішно повернуто {len(translations)} перекладів для {locale}")
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Помилка при отриманні перекладів: {str(e)}")
            return Response({
                'error': 'Помилка сервера при завантаженні перекладів',
                'detail': str(e) if settings.DEBUG else 'Внутрішня помилка'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_static_translations(self, locale, namespace=None):
        """Статичні переклади з JSON файлів"""
        try:
            static_file_path = os.path.join(
                settings.BASE_DIR, 'static_translations', f'{locale}.json'
            )
            
            if os.path.exists(static_file_path):
                with open(static_file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Фільтруємо за namespace якщо потрібно
                if namespace:
                    filtered_data = {k: v for k, v in data.items() if k.startswith(f"{namespace}.")}
                    return filtered_data
                
                return data
            else:
                logger.warning(f"Файл статичних перекладів не знайдено: {static_file_path}")
                return self.get_fallback_static_translations(locale)
        
        except Exception as e:
            logger.error(f"Помилка завантаження статичних перекладів: {str(e)}")
            return self.get_fallback_static_translations(locale)
    
    def get_fallback_static_translations(self, locale):
        """Fallback статичні переклади"""
        if locale == 'en':
            return {
                "header.company": "Company",
                "header.services": "Services", 
                "header.projects": "Projects",
                "header.about": "About",
                "header.contact": "Contact",
                "footer.rights": "All rights reserved",
                "common.loading": "Loading...",
                "common.error": "Error occurred"
            }
        else:  # uk
            return {
                "header.company": "Компанія",
                "header.services": "Послуги",
                "header.projects": "Проекти", 
                "header.about": "Про нас",
                "header.contact": "Контакти",
                "footer.rights": "Всі права захищені",
                "common.loading": "Завантаження...",
                "common.error": "Сталася помилка"
            }
    
    def get_po_translations(self, locale):
        """Переклади з .po файлів Django"""
        try:
            po_file_path = os.path.join(
                settings.BASE_DIR, 'locale', locale, 'LC_MESSAGES', 'django.po'
            )
            
            if not os.path.exists(po_file_path):
                logger.warning(f"PO файл не знайдено: {po_file_path}")
                return {}
            
            po = polib.pofile(po_file_path)
            translations = {}
            
            for entry in po:
                if entry.msgstr and not entry.obsolete:
                    # Очищуємо ключ від спеціальних символів
                    clean_key = entry.msgid.strip().replace('\n', ' ')
                    translations[f"po.{clean_key}"] = entry.msgstr
            
            return translations
            
        except Exception as e:
            logger.error(f"Помилка завантаження po перекладів: {str(e)}")
            return {}
    
    def get_dynamic_translations(self, locale, namespace=None):
        """Динамічні переклади з Django моделей"""
        from django.utils import translation
        
        translation.activate(locale)
        dynamic_translations = {}
        
        try:
            if not namespace or namespace == 'services':
                # Послуги
                try:
                    from apps.services.models import Service
                    services = Service.objects.filter(is_active=True)
                    for service in services:
                        name_field = f'name_{locale}' if hasattr(service, f'name_{locale}') else 'name'
                        desc_field = f'short_description_{locale}' if hasattr(service, f'short_description_{locale}') else 'short_description'
                        
                        dynamic_translations.update({
                            f'services.{service.id}.name': getattr(service, name_field, service.name or ''),
                            f'services.{service.id}.description': getattr(service, desc_field, service.short_description or ''),
                        })
                except Exception as e:
                    logger.warning(f"Помилка завантаження Services: {str(e)}")
            
            if not namespace or namespace == 'projects':
                # Категорії проектів
                try:
                    from apps.projects.models import ProjectCategory
                    categories = ProjectCategory.objects.filter(is_active=True)
                    for category in categories:
                        name_field = f'name_{locale}' if hasattr(category, f'name_{locale}') else 'name'
                        desc_field = f'description_{locale}' if hasattr(category, f'description_{locale}') else 'description'
                        
                        dynamic_translations.update({
                            f'categories.{category.id}.name': getattr(category, name_field, category.name or ''),
                            f'categories.{category.id}.description': getattr(category, desc_field, getattr(category, 'description', '') or ''),
                        })
                except Exception as e:
                    logger.warning(f"Помилка завантаження ProjectCategory: {str(e)}")
            
            logger.info(f"Завантажено {len(dynamic_translations)} динамічних перекладів")
            return dynamic_translations
            
        except Exception as e:
            logger.error(f"Помилка завантаження динамічних перекладів: {str(e)}")
            return {}


# Імпортуємо timezone тільки якщо потрібно
try:
    from django.utils import timezone
except ImportError:
    timezone = None


class TranslationWebhookView(APIView):
    """
    Webhook для очищення кешу перекладів при оновленні
    """
    
    def post(self, request):
        """Очищує кеш перекладів"""
        try:
            # Очищаємо всі кеші перекладів
            cache_patterns = [
                "unified_translations_*",
                "static_translations_*", 
                "dynamic_translations_*",
                "po_translations_*"
            ]
            
            cleared_keys = 0
            
            # Для Django Redis
            try:
                from django_redis import get_redis_connection
                con = get_redis_connection("default")
                for pattern in cache_patterns:
                    keys = con.keys(pattern)
                    if keys:
                        con.delete(*keys)
                        cleared_keys += len(keys)
                logger.info(f"Очищено {cleared_keys} ключів кешу перекладів через Redis")
            except ImportError:
                # Fallback для локального кешу
                cache.clear()
                cleared_keys = "all"
                logger.info("Очищено весь локальний кеш")
            
            return Response({
                'success': True,
                'message': 'Кеш перекладів очищено',
                'cleared_keys': cleared_keys
            })
            
        except Exception as e:
            logger.error(f"Помилка очищення кешу: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)