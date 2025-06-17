# backend/apps/api/translations_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import translation
from django.conf import settings
import os
import json

class StaticTranslationsAPIView(APIView):
    """
    API для віддачі готових JSON файлів перекладів
    """
    
    def get(self, request, locale=None):
        """
        GET /api/v1/translations/uk/
        GET /api/v1/translations/en/
        """
        if not locale:
            locale = request.GET.get('locale', settings.LANGUAGE_CODE)
        
        # Перевіряємо чи локаль підтримується
        supported_locales = [lang[0] for lang in settings.LANGUAGES]
        if locale not in supported_locales:
            return Response(
                {'error': f'Локаль {locale} не підтримується'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Шлях до JSON файлу з перекладами (можете створити цю папку)
            json_file_path = os.path.join(
                settings.BASE_DIR, 
                'translations', 
                f'{locale}.json'
            )
            
            if os.path.exists(json_file_path):
                with open(json_file_path, 'r', encoding='utf-8') as file:
                    translations = json.load(file)
            else:
                # Якщо файл не існує, повертаємо пустий об'єкт
                translations = {}
            
            return Response({
                'locale': locale,
                'translations': translations,
                'count': len(translations)
            })
                
        except Exception as e:
            return Response(
                {'error': f'Помилка при читанні перекладів: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TranslationsAPIView(APIView):
    """
    API для отримання перекладів з .po файлів Django
    """
    
    def get(self, request, locale=None):
        """
        GET /api/v1/po-translations/uk/
        GET /api/v1/po-translations/en/
        """
        if not locale:
            locale = request.GET.get('locale', settings.LANGUAGE_CODE)
        
        # Перевіряємо чи локаль підтримується
        supported_locales = [lang[0] for lang in settings.LANGUAGES]
        if locale not in supported_locales:
            return Response(
                {'error': f'Локаль {locale} не підтримується'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Спрощений варіант - повертаємо базові переклади
            translations = self._get_basic_translations(locale)
            
            return Response({
                'locale': locale,
                'translations': translations,
                'count': len(translations)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Помилка при читанні .po перекладів: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_basic_translations(self, locale):
        """Базові переклади для початку роботи"""
        if locale == 'uk':
            return {
                # Навігація
                'nav.home': 'Головна',
                'nav.about': 'Про нас', 
                'nav.services': 'Послуги',
                'nav.projects': 'Проекти',
                'nav.contact': 'Контакти',
                'nav.jobs': 'Вакансії',
                
                # Загальні
                'common.loading': 'Завантаження...',
                'common.error': 'Помилка',
                'common.retry': 'Спробувати знову',
                'common.save': 'Зберегти',
                'common.cancel': 'Скасувати',
                'common.submit': 'Відправити',
                'common.back': 'Назад',
                'common.next': 'Далі',
                
                # Форми
                'form.name': 'Ім\'я',
                'form.email': 'Email',
                'form.phone': 'Телефон',
                'form.message': 'Повідомлення',
                'form.send': 'Відправити',
                'form.required': 'Обов\'язкове поле',
                
                # Процес (ваші існуючі ключі)
                'process.discover.title': 'Аналіз потреб',
                'process.build.title': 'Розробка',
                'process.deliver.title': 'Виробництво',
            }
        elif locale == 'en':
            return {
                # Navigation
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.services': 'Services', 
                'nav.projects': 'Projects',
                'nav.contact': 'Contact',
                'nav.jobs': 'Jobs',
                
                # Common
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.retry': 'Try again',
                'common.save': 'Save',
                'common.cancel': 'Cancel',
                'common.submit': 'Submit',
                'common.back': 'Back',
                'common.next': 'Next',
                
                # Forms
                'form.name': 'Name',
                'form.email': 'Email',
                'form.phone': 'Phone',
                'form.message': 'Message',
                'form.send': 'Send',
                'form.required': 'Required field',
                
                # Process
                'process.discover.title': 'Needs Analysis',
                'process.build.title': 'Development',
                'process.deliver.title': 'Production',
            }
        else:
            return {}


class DynamicTranslationsAPIView(APIView):
    """
    API для отримання динамічних перекладів з моделей
    """
    
    def get(self, request, locale=None):
        """
        GET /api/v1/dynamic-translations/uk/
        GET /api/v1/dynamic-translations/en/
        """
        if not locale:
            locale = request.GET.get('locale', settings.LANGUAGE_CODE)
        
        # Активуємо потрібну локаль
        translation.activate(locale)
        
        try:
            translations = {}
            
            # Базові переклади з моделей (додайте згідно ваших моделей)
            try:
                from apps.services.models import Service
                services = Service.objects.filter(is_active=True)
                for service in services:
                    if hasattr(service, 'slug'):
                        key = f"service.{service.slug}.name"
                        translations[key] = str(service.name)
            except:
                pass
            
            try:
                from apps.projects.models import ProjectCategory
                categories = ProjectCategory.objects.filter(is_active=True)
                for category in categories:
                    if hasattr(category, 'slug'):
                        key = f"category.{category.slug}.name"
                        translations[key] = str(category.name)
            except:
                pass
            
            return Response({
                'locale': locale,
                'translations': translations,
                'count': len(translations)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Помилка при отриманні динамічних перекладів: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        finally:
            translation.deactivate()
    
    def get_plural_forms(self, locale, key, count):
        """Обробка множинних форм для української мови"""
    
        if locale == 'uk':
            # Українські правила множини
            if count % 10 == 1 and count % 100 != 11:
                return f"{key}_one"
            elif 2 <= count % 10 <= 4 and (count % 100 < 10 or count % 100 >= 20):
                return f"{key}_few"
            else:
                return f"{key}_many"
    
        return f"{key}_other"