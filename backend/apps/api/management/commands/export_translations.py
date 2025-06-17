import os
import json
import polib
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import translation


class Command(BaseCommand):
    help = 'Експорт перекладів з .po файлів у JSON формат для фронтенду'

    def add_arguments(self, parser):
        parser.add_argument(
            '--locale',
            type=str,
            help='Конкретна локаль для експорту (uk, en)',
        )
        parser.add_argument(
            '--output-dir',
            type=str,
            default=os.path.join(settings.BASE_DIR, 'translations'),
            help='Папка для збереження JSON файлів',
        )
        parser.add_argument(
            '--include-dynamic',
            action='store_true',
            help='Включити динамічні переклади з моделей',
        )

    def handle(self, *args, **options):
        output_dir = options['output_dir']
        include_dynamic = options['include_dynamic']
        target_locale = options.get('locale')

        # Створюємо папку якщо не існує
        os.makedirs(output_dir, exist_ok=True)

        # Визначаємо локалі для обробки
        locales = [target_locale] if target_locale else [lang[0] for lang in settings.LANGUAGES]

        for locale in locales:
            self.stdout.write(f'Обробка локалі: {locale}')
            
            try:
                translations = {}
                
                # Експорт статичних перекладів з .po файлів
                static_translations = self.export_static_translations(locale)
                translations.update(static_translations)
                
                # Експорт динамічних перекладів з моделей
                if include_dynamic:
                    dynamic_translations = self.export_dynamic_translations(locale)
                    translations.update(dynamic_translations)
                
                # Збереження в JSON файл
                output_file = os.path.join(output_dir, f'{locale}.json')
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(translations, f, ensure_ascii=False, indent=2)
                
                self.stdout.write(
                    self.style.SUCCESS(f'Успішно експортовано {len(translations)} перекладів для {locale} в {output_file}')
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Помилка при обробці {locale}: {str(e)}')
                )

    def export_static_translations(self, locale):
        """Експорт статичних перекладів з .po файлів"""
        po_file_path = os.path.join(
            settings.BASE_DIR,
            'locale',
            locale,
            'LC_MESSAGES',
            'django.po'
        )
        
        translations = {}
        
        if os.path.exists(po_file_path):
            po = polib.pofile(po_file_path)
            
            for entry in po:
                if entry.msgstr:  # Якщо переклад існує
                    key = self.create_key(entry.msgid)
                    translations[key] = entry.msgstr
                    
                    # Також зберігаємо оригінальний msgid як ключ
                    translations[entry.msgid] = entry.msgstr
        
        return translations

    def export_dynamic_translations(self, locale):
        """Експорт динамічних перекладів з моделей"""
        translation.activate(locale)
        
        try:
            # Імпортуємо моделі
            from apps.services.models import Service
            from apps.projects.models import ProjectCategory, Project
            from apps.content.models import HomePage, AboutPage
            from apps.jobs.models import JobPosition
            
            translations = {}
            
            # Переклади послуг
            services = Service.objects.filter(is_active=True)
            for service in services:
                base_key = f"service.{service.slug}"
                translations[f"{base_key}.name"] = str(service.name)
                translations[f"{base_key}.short_description"] = str(service.short_description)
                if hasattr(service, 'description'):
                    translations[f"{base_key}.description"] = str(service.description)
            
            # Переклади категорій проектів
            categories = ProjectCategory.objects.filter(is_active=True)
            for category in categories:
                base_key = f"category.{category.slug}"
                translations[f"{base_key}.name"] = str(category.name)
                translations[f"{base_key}.description"] = str(category.description)
            
            # Переклади проектів
            projects = Project.objects.filter(is_active=True)
            for project in projects:
                base_key = f"project.{project.slug}"
                translations[f"{base_key}.title"] = str(project.title)
                translations[f"{base_key}.short_description"] = str(project.short_description)
                if hasattr(project, 'description'):
                    translations[f"{base_key}.description"] = str(project.description)
            
            # Переклади вакансій
            jobs = JobPosition.objects.filter(is_active=True)
            for job in jobs:
                base_key = f"job.{job.slug}"
                translations[f"{base_key}.title"] = str(job.title)
                translations[f"{base_key}.description"] = str(job.description)
                if hasattr(job, 'requirements'):
                    translations[f"{base_key}.requirements"] = str(job.requirements)
            
            # Переклади головної сторінки
            try:
                homepage = HomePage.objects.filter(is_active=True).first()
                if homepage:
                    translations['homepage.company_description'] = str(homepage.company_description)
                    translations['homepage.mission_text'] = str(homepage.mission_text)
                    translations['homepage.values_text'] = str(homepage.values_text)
            except:
                pass
            
            # Переклади сторінки "Про нас"
            try:
                about = AboutPage.objects.filter(is_active=True).first()
                if about:
                    translations['about.history_text'] = str(about.history_text)
                    translations['about.mission_text'] = str(about.mission_text)
                    translations['about.values_text'] = str(about.values_text)
                    if hasattr(about, 'social_responsibility'):
                        translations['about.social_responsibility'] = str(about.social_responsibility)
            except:
                pass
            
            return translations
            
        except Exception as e:
            self.stdout.write(f'Помилка при експорті динамічних перекладів: {str(e)}')
            return {}
        finally:
            translation.deactivate()

    def create_key(self, msgid):
        """Створює ключ з msgid для використання у фронтенді"""
        if not msgid:
            return ''
        
        # Перетворюємо текст в ключ
        key = msgid.lower()
        # Замінюємо спеціальні символи на підкреслення
        key = ''.join(c if c.isalnum() else '_' for c in key)
        # Видаляємо послідовні підкреслення
        while '__' in key:
            key = key.replace('__', '_')
        # Видаляємо підкреслення на початку та в кінці
        key = key.strip('_')
        # Обмежуємо довжину ключа
        return key[:50]