# backend/apps/api/management/commands/fix_translations.py
import os
import json
import polib
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import translation
from django.core.cache import cache


class Command(BaseCommand):
    help = 'Виправлення та синхронізація всіх перекладів'

    def add_arguments(self, parser):
        parser.add_argument(
            '--locale',
            type=str,
            choices=['uk', 'en'],
            help='Конкретна локаль для обробки (uk або en)',
        )
        parser.add_argument(
            '--fix-po',
            action='store_true',
            help='Виправити помилки в .po файлах',
        )
        parser.add_argument(
            '--export-static',
            action='store_true',
            help='Експортувати статичні переклади',
        )
        parser.add_argument(
            '--clear-cache',
            action='store_true',
            help='Очистити кеш перекладів',
        )
        parser.add_argument(
            '--validate',
            action='store_true',
            help='Валідувати переклади',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔧 Початок виправлення перекладів...'))
        
        target_locale = options.get('locale')
        locales = [target_locale] if target_locale else ['uk', 'en']
        
        # 1. Очищення кешу
        if options.get('clear_cache'):
            self.clear_translations_cache()
        
        # 2. Виправлення .po файлів
        if options.get('fix_po'):
            for locale in locales:
                self.fix_po_file(locale)
        
        # 3. Експорт статичних перекладів
        if options.get('export_static'):
            for locale in locales:
                self.export_static_translations(locale)
        
        # 4. Валідація
        if options.get('validate'):
            for locale in locales:
                self.validate_translations(locale)
        
        self.stdout.write(self.style.SUCCESS('✅ Виправлення завершено!'))

    def clear_translations_cache(self):
        """Очищення всього кешу перекладів"""
        self.stdout.write('🧹 Очищення кешу перекладів...')
        
        try:
            # Спробуємо очистити Redis кеш
            from django_redis import get_redis_connection
            con = get_redis_connection("default")
            patterns = [
                "translations_*",
                "unified_translations_*", 
                "static_translations_*",
                "dynamic_translations_*"
            ]
            
            total_cleared = 0
            for pattern in patterns:
                keys = con.keys(pattern)
                if keys:
                    con.delete(*keys)
                    total_cleared += len(keys)
            
            self.stdout.write(f'   ✅ Очищено {total_cleared} ключів Redis кешу')
            
        except ImportError:
            # Fallback для локального кешу
            cache.clear()
            self.stdout.write('   ✅ Очищено локальний кеш')

    def fix_po_file(self, locale):
        """Виправлення помилок в .po файлах"""
        self.stdout.write(f'🔧 Виправлення .po файлу для {locale}...')
        
        po_file_path = os.path.join(
            settings.BASE_DIR, 'locale', locale, 'LC_MESSAGES', 'django.po'
        )
        
        if not os.path.exists(po_file_path):
            self.stdout.write(f'   ⚠️ Файл не знайдено: {po_file_path}')
            return
        
        try:
            po = polib.pofile(po_file_path)
            fixed_count = 0
            
            # Виправляємо метадані
            po.metadata['Language'] = locale
            po.metadata['Content-Type'] = 'text/plain; charset=UTF-8'
            
            # Виправляємо проблемні записи
            for entry in po:
                # Видаляємо fuzzy flag для перевірених записів
                if 'fuzzy' in entry.flags and entry.msgstr:
                    entry.flags.remove('fuzzy')
                    fixed_count += 1
                
                # Видаляємо порожні переклади
                if not entry.msgstr.strip() and entry.msgid.strip():
                    entry.msgstr = entry.msgid  # Fallback до оригінального тексту
                    fixed_count += 1
            
            # Зберігаємо файл
            po.save()
            
            self.stdout.write(f'   ✅ Виправлено {fixed_count} записів у {locale}')
            
        except Exception as e:
            self.stdout.write(f'   ❌ Помилка при виправленні {locale}: {str(e)}')

    def export_static_translations(self, locale):
        """Експорт статичних перекладів"""
        self.stdout.write(f'📤 Експорт статичних перекладів для {locale}...')
        
        # Створюємо папку для статичних перекладів
        static_dir = os.path.join(settings.BASE_DIR, 'static_translations')
        os.makedirs(static_dir, exist_ok=True)
        
        # Базові статичні переклади
        static_translations = self.get_static_translations(locale)
        
        # Додаємо переклади з .po файлів
        po_translations = self.get_po_translations(locale)
        static_translations.update(po_translations)
        
        # Зберігаємо у JSON файл
        output_file = os.path.join(static_dir, f'{locale}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(static_translations, f, ensure_ascii=False, indent=2)
        
        self.stdout.write(f'   ✅ Експортовано {len(static_translations)} перекладів у {output_file}')

    def get_static_translations(self, locale):
        """Отримання базових статичних перекладів"""
        if locale == 'en':
            return {
                # Header
                "header.company": "Company",
                "header.services": "Services",
                "header.projects": "Projects",
                "header.about": "About Us",
                "header.contact": "Contact",
                "header.careers": "Careers",
                
                # Navigation
                "nav.home": "Home",
                "nav.services": "Services",
                "nav.projects": "Projects",
                "nav.about": "About",
                "nav.contact": "Contact",
                "nav.menu": "Menu",
                
                # Common
                "common.loading": "Loading...",
                "common.error": "Error occurred",
                "common.success": "Success",
                "common.submit": "Submit",
                "common.cancel": "Cancel",
                "common.save": "Save",
                "common.edit": "Edit",
                "common.delete": "Delete",
                "common.search": "Search",
                "common.filter": "Filter",
                "common.reset": "Reset",
                "common.back": "Back",
                "common.next": "Next",
                "common.previous": "Previous",
                "common.close": "Close",
                "common.open": "Open",
                "common.show_more": "Show More",
                "common.show_less": "Show Less",
                
                # Footer
                "footer.company": "Company",
                "footer.services": "Services", 
                "footer.projects": "Projects",
                "footer.contact": "Contact",
                "footer.privacy": "Privacy Policy",
                "footer.terms": "Terms of Service",
                "footer.rights": "© 2024 All rights reserved",
                
                # Contact
                "contact.title": "Contact Us",
                "contact.subtitle": "Get in touch with our team",
                "contact.name": "Name",
                "contact.email": "Email",
                "contact.phone": "Phone",
                "contact.message": "Message",
                "contact.send": "Send Message",
                "contact.success": "Message sent successfully!",
                "contact.error": "Error sending message. Please try again.",
                
                # Forms
                "form.required": "This field is required",
                "form.invalid_email": "Please enter a valid email address",
                "form.invalid_phone": "Please enter a valid phone number",
                "form.min_length": "Minimum length is {{min}} characters",
                "form.max_length": "Maximum length is {{max}} characters",
            }
        else:  # uk
            return {
                # Header
                "header.company": "Компанія",
                "header.services": "Послуги",
                "header.projects": "Проекти",
                "header.about": "Про нас",
                "header.contact": "Контакти",
                "header.careers": "Кар'єра",
                
                # Navigation
                "nav.home": "Головна",
                "nav.services": "Послуги",
                "nav.projects": "Проекти",
                "nav.about": "Про нас",
                "nav.contact": "Контакти",
                "nav.menu": "Меню",
                
                # Common
                "common.loading": "Завантаження...",
                "common.error": "Сталася помилка",
                "common.success": "Успішно",
                "common.submit": "Відправити",
                "common.cancel": "Скасувати",
                "common.save": "Зберегти",
                "common.edit": "Редагувати",
                "common.delete": "Видалити",
                "common.search": "Пошук",
                "common.filter": "Фільтр",
                "common.reset": "Скинути",
                "common.back": "Назад",
                "common.next": "Далі",
                "common.previous": "Попередній",
                "common.close": "Закрити",
                "common.open": "Відкрити",
                "common.show_more": "Показати більше",
                "common.show_less": "Показати менше",
                
                # Footer
                "footer.company": "Компанія",
                "footer.services": "Послуги",
                "footer.projects": "Проекти",
                "footer.contact": "Контакти",
                "footer.privacy": "Політика конфіденційності",
                "footer.terms": "Умови використання",
                "footer.rights": "© 2024 Всі права захищені",
                
                # Contact
                "contact.title": "Зв'яжіться з нами",
                "contact.subtitle": "Звертайтеся до нашої команди",
                "contact.name": "Ім'я",
                "contact.email": "Email",
                "contact.phone": "Телефон",
                "contact.message": "Повідомлення",
                "contact.send": "Відправити повідомлення",
                "contact.success": "Повідомлення успішно відправлено!",
                "contact.error": "Помилка відправки. Спробуйте ще раз.",
                
                # Forms
                "form.required": "Це поле обов'язкове",
                "form.invalid_email": "Введіть коректну email адресу",
                "form.invalid_phone": "Введіть коректний номер телефону",
                "form.min_length": "Мінімальна довжина {{min}} символів",
                "form.max_length": "Максимальна довжина {{max}} символів",
            }

    def get_po_translations(self, locale):
        """Отримання перекладів з .po файлів"""
        po_file_path = os.path.join(
            settings.BASE_DIR, 'locale', locale, 'LC_MESSAGES', 'django.po'
        )
        
        translations = {}
        
        if os.path.exists(po_file_path):
            try:
                po = polib.pofile(po_file_path)
                for entry in po:
                    if entry.msgstr and not entry.obsolete:
                        # Створюємо ключ у форматі po.original_text
                        key = f"po.{entry.msgid.strip()}"
                        translations[key] = entry.msgstr
            except Exception as e:
                self.stdout.write(f'   ⚠️ Помилка читання .po файлу: {str(e)}')
        
        return translations

    def validate_translations(self, locale):
        """Валідація перекладів"""
        self.stdout.write(f'✅ Валідація перекладів для {locale}...')
        
        errors = []
        warnings = []
        
        # Перевіряємо статичні переклади
        static_file = os.path.join(settings.BASE_DIR, 'static_translations', f'{locale}.json')
        if os.path.exists(static_file):
            try:
                with open(static_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Перевіряємо на порожні значення
                for key, value in data.items():
                    if not value or (isinstance(value, str) and not value.strip()):
                        errors.append(f"Порожнє значення для ключа: {key}")
                
                self.stdout.write(f'   📄 Статичні переклади: {len(data)} ключів')
                
            except json.JSONDecodeError as e:
                errors.append(f"Помилка JSON у статичних перекладах: {str(e)}")
        else:
            warnings.append(f"Файл статичних перекладів не знайдено: {static_file}")
        
        # Перевіряємо .po файли
        po_file_path = os.path.join(
            settings.BASE_DIR, 'locale', locale, 'LC_MESSAGES', 'django.po'
        )
        
        if os.path.exists(po_file_path):
            try:
                po = polib.pofile(po_file_path)
                fuzzy_count = len([e for e in po if 'fuzzy' in e.flags])
                untranslated_count = len([e for e in po if not e.msgstr])
                
                self.stdout.write(f'   📝 PO переклади: {len(po)} записів')
                
                if fuzzy_count > 0:
                    warnings.append(f"Знайдено {fuzzy_count} fuzzy записів")
                
                if untranslated_count > 0:
                    warnings.append(f"Знайдено {untranslated_count} неперекладених записів")
                    
            except Exception as e:
                errors.append(f"Помилка читання .po файлу: {str(e)}")
        else:
            errors.append(f"PO файл не знайдено: {po_file_path}")
        
        # Виводимо результати
        if errors:
            self.stdout.write(f'   ❌ Знайдено {len(errors)} помилок:')
            for error in errors:
                self.stdout.write(f'     - {error}')
        
        if warnings:
            self.stdout.write(f'   ⚠️ Знайдено {len(warnings)} попереджень:')
            for warning in warnings:
                self.stdout.write(f'     - {warning}')
        
        if not errors and not warnings:
            self.stdout.write(f'   ✅ Переклади для {locale} валідні')
        
        return len(errors) == 0