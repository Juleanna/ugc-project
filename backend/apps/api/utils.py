from django.core.cache import cache
from django.utils import translation
import json
import os

class TranslationManager:
    """
    Утиліта для управління перекладами
    """
    
    @staticmethod
    def invalidate_translations_cache(locale=None):
        """Очищує кеш перекладів"""
        if locale:
            # Очищаємо кеш для конкретної локалі
            cache.delete_many([
                f"static_translations_{locale}",
                f"dynamic_translations_{locale}",
                f"po_translations_{locale}"
            ])
        else:
            # Очищаємо весь кеш перекладів
            from django.conf import settings
            for lang_code, _ in settings.LANGUAGES:
                cache.delete_many([
                    f"static_translations_{lang_code}",
                    f"dynamic_translations_{lang_code}",
                    f"po_translations_{lang_code}"
                ])
    
    @staticmethod
    def preload_translations():
        """Попередньо завантажує переклади в кеш"""
        from django.conf import settings
        from .translations_views import TranslationsAPIView, DynamicTranslationsAPIView
        
        for lang_code, _ in settings.LANGUAGES:
            try:
                # Завантажуємо статичні переклади
                translations_view = TranslationsAPIView()
                static_data = translations_view.get(None, lang_code)
                
                # Завантажуємо динамічні переклади
                dynamic_view = DynamicTranslationsAPIView()
                dynamic_data = dynamic_view.get(None, lang_code)
                
                print(f"Попередньо завантажено переклади для {lang_code}")
                
            except Exception as e:
                print(f"Помилка при попередньому завантаженні для {lang_code}: {e}")

    @staticmethod
    def export_to_frontend(output_path):
        """Експортує переклади для фронтенду"""
        from django.conf import settings
        from .translations_views import TranslationsAPIView, DynamicTranslationsAPIView
        
        os.makedirs(output_path, exist_ok=True)
        
        for lang_code, _ in settings.LANGUAGES:
            try:
                # Отримуємо всі переклади
                translations_view = TranslationsAPIView()
                static_response = translations_view.get(None, lang_code)
                
                dynamic_view = DynamicTranslationsAPIView()
                dynamic_response = dynamic_view.get(None, lang_code)
                
                # Об'єднуємо переклади
                all_translations = {}
                if hasattr(static_response, 'data') and 'translations' in static_response.data:
                    all_translations.update(static_response.data['translations'])
                
                if hasattr(dynamic_response, 'data') and 'translations' in dynamic_response.data:
                    all_translations.update(dynamic_response.data['translations'])
                
                # Зберігаємо в файл
                output_file = os.path.join(output_path, f"{lang_code}.json")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(all_translations, f, ensure_ascii=False, indent=2)
                
                print(f"Експортовано {len(all_translations)} перекладів для {lang_code}")
                
            except Exception as e:
                print(f"Помилка експорту для {lang_code}: {e}")


