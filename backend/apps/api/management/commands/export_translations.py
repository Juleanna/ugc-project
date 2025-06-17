# backend/apps/api/management/commands/export_translations.py
import os
import json
import polib
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import translation


class Command(BaseCommand):
    help = 'Експорт перекладів у JSON формат для фронтенду'

    def add_arguments(self, parser):
        parser.add_argument(
            '--locale',
            type=str,
            help='Локаль (uk, en)',
        )
        parser.add_argument(
            '--include-dynamic',
            action='store_true',
            help='Включити динамічні переклади',
        )
        parser.add_argument(
            '--include-po',
            action='store_true',
            help='Включити переклади з .po файлів',
        )
        parser.add_argument(
            '--merge-existing',
            action='store_true',
            help='Об\'єднати з існуючими перекладами',
        )

    def handle(self, *args, **options):
        output_dir = os.path.join(settings.BASE_DIR, 'translations')
        os.makedirs(output_dir, exist_ok=True)
        
        target_locale = options.get('locale')
        include_dynamic = options.get('include_dynamic', False)
        include_po = options.get('include_po', False)
        merge_existing = options.get('merge_existing', False)
        
        # Якщо не вказана локаль, обробляємо всі
        locales = [target_locale] if target_locale else ['uk', 'en']
        
        for locale in locales:
            self.stdout.write(f'🌍 Обробка локалі: {locale}')
            
            try:
                translations = {}
                
                # 1. Завантажуємо існуючі переклади (якщо потрібно)
                if merge_existing:
                    existing_translations = self.load_existing_translations(output_dir, locale)
                    translations.update(existing_translations)
                    self.stdout.write(f'📁 Завантажено {len(existing_translations)} існуючих перекладів')
                
                # 2. Базові фронтенд переклади
                frontend_translations = self.get_frontend_translations(locale)
                translations.update(frontend_translations)
                self.stdout.write(f'🎨 Додано {len(frontend_translations)} фронтенд перекладів')
                
                # 3. Переклади з .po файлів Django (якщо потрібно)
                if include_po:
                    po_translations = self.get_po_translations(locale)
                    translations.update(po_translations)
                    self.stdout.write(f'📝 Додано {len(po_translations)} перекладів з .po файлів')
                
                # 4. Динамічні переклади з моделей (якщо потрібно)
                if include_dynamic:
                    dynamic_translations = self.get_dynamic_translations(locale)
                    translations.update(dynamic_translations)
                    self.stdout.write(f'🔄 Додано {len(dynamic_translations)} динамічних перекладів')
                
                # 5. Збереження файлу
                output_file = os.path.join(output_dir, f'{locale}.json')
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(translations, f, ensure_ascii=False, indent=2)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Успішно експортовано {len(translations)} перекладів для {locale} → {output_file}'
                    )
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Помилка для {locale}: {str(e)}')
                )

    def load_existing_translations(self, output_dir, locale):
        """Завантаження існуючих перекладів"""
        file_path = os.path.join(output_dir, f'{locale}.json')
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                self.stdout.write(f'Помилка читання існуючого файлу: {e}')
        return {}

    def get_po_translations(self, locale):
        """Переклади з .po файлів Django"""
        po_file_path = os.path.join(
            settings.BASE_DIR,
            'locale',
            locale,
            'LC_MESSAGES',
            'django.po'
        )
        
        translations = {}
        
        if os.path.exists(po_file_path):
            try:
                po = polib.pofile(po_file_path)
                for entry in po:
                    if entry.msgstr:  # Якщо переклад існує
                        # Зберігаємо як оригінальний ключ, так і підготовлений для фронтенду
                        translations[entry.msgid] = entry.msgstr
                        
                        # Створюємо ключ для фронтенду (замінюємо пробіли на крапки)
                        frontend_key = self.create_frontend_key(entry.msgid)
                        if frontend_key != entry.msgid:
                            translations[frontend_key] = entry.msgstr
                            
            except Exception as e:
                self.stdout.write(f'Помилка читання .po файлу: {e}')
        
        return translations

    def create_frontend_key(self, msgid):
        """Створює ключ для фронтенду з msgid"""
        if not msgid:
            return ''
        
        # Перетворюємо в lowercase та замінюємо пробіли на крапки
        key = msgid.lower()
        key = key.replace(' ', '.')
        key = key.replace("'", '')  # Видаляємо апострофи
        key = key.replace('"', '')  # Видаляємо лапки
        
        # Замінюємо спеціальні символи
        replacements = {
            'і': 'i',
            'ї': 'i', 
            'є': 'e',
            'ґ': 'g',
            'ь': '',
            "'": '',
            '(': '',
            ')': '',
            '/': '.',
            '-': '.',
            ',': '',
            ':': '',
            ';': '',
        }
        
        for old, new in replacements.items():
            key = key.replace(old, new)
        
        # Видаляємо множинні крапки
        while '..' in key:
            key = key.replace('..', '.')
            
        # Видаляємо крапки на початку та в кінці
        key = key.strip('.')
        
        return key

    def get_frontend_translations(self, locale):
        """Переклади для фронтенду (UI елементи)"""
        if locale == 'uk':
            return {
                # Навігація
                "nav.home": "Головна",
                "nav.about": "Про нас",
                "nav.services": "Послуги",
                "nav.projects": "Проекти",
                "nav.contact": "Контакти",
                "nav.jobs": "Вакансії",
                
                # Загальні елементи
                "common.loading": "Завантаження...",
                "common.error": "Помилка",
                "common.retry": "Спробувати знову",
                "common.save": "Зберегти",
                "common.cancel": "Скасувати",
                "common.submit": "Відправити",
                "common.back": "Назад",
                "common.next": "Далі",
                "common.close": "Закрити",
                "common.open": "Відкрити",
                "common.edit": "Редагувати",
                "common.delete": "Видалити",
                "common.view": "Переглянути",
                "common.download": "Завантажити",
                
                # Форми
                "form.name": "Ім'я",
                "form.email": "Електронна пошта",
                "form.phone": "Телефон",
                "form.company": "Компанія",
                "form.message": "Повідомлення",
                "form.subject": "Тема",
                "form.send": "Відправити",
                "form.required": "Обов'язкове поле",
                "form.invalid": "Некоректне значення",
                "form.success": "Форма успішно відправлена",
                
                # Головна сторінка
                "hero.title": "Виробник спецодягу в Україні.",
                "hero.description": "Ми створюємо якісний та надійний спецодяг, який забезпечує комфорт і безпеку в будь-яких умовах.",
                
                "clients.title": "Ми працюємо з провідними компаніями України та Європи",
                
                "caseStudies.title": "Надійність та якість у кожній деталі",
                "caseStudies.description": "Наш багаторічний досвід у виробництві спецодягу гарантує високу якість і надійність кожного виробу.",
                "caseStudies.successfulProject": "Успішний проєкт",
                "caseStudies.items.phobia.title": "Захисний одяг для промисловості",
                "caseStudies.items.phobia.description": "Розробка та виготовлення спецодягу для захисту працівників у важких умовах.",
                "caseStudies.items.familyFund.title": "Медичний одяг",
                "caseStudies.items.familyFund.description": "Комфортний та функціональний медичний одяг для персоналу лікарень.",
                "caseStudies.items.unseal.title": "Військова форма",
                "caseStudies.items.unseal.description": "Надійна та практична форма для військових підрозділів.",
                
                "services.eyebrow": "Послуги",
                "services.title": "Ми створюємо якісний спецодяг під ваші потреби.",
                "services.description": "Ми виготовляємо спецодяг для різних галузей, включаючи військову форму, медичний одяг, а також спецодяг для інших сфер.",
                "services.technicalSpecs.title": "Розробка технічних умов (ТУ)",
                "services.technicalSpecs.description": "Ми спеціалізуємося на створенні технічних умов згідно з вашими вимогами.",
                "services.tailoring.title": "Пошиття одягу",
                "services.tailoring.description": "За вашими специфікаціями ми виготовляємо продукцію з використанням ваших матеріалів або наших власних.",
                "services.logoApplication.title": "Нанесення логотипу",
                "services.logoApplication.description": "Ми пропонуємо послуги нанесення логотипу або бренду на вироби.",
                "services.other.title": "Інше",
                "services.other.description": "Крім того, ми пропонуємо широкий асортимент готових виробів, тканин та фурнітури.",
                
                "testimonial.quote": "Команда UGC перевершила наші очікування, забезпечивши високу якість спецодягу та дотримання термінів. Відмінна комунікація і професійний підхід зробили співпрацю легкою та ефективною.",
                
                # Процес роботи
                "process.discover.title": "Аналіз потреб",
                "process.discover.description1": "Наша команда проводить ретельний аналіз специфіки вашої діяльності, умов праці та особливих потреб.",
                "process.discover.description2": "На цьому етапі ми визначаємо технічні характеристики, матеріали, дизайн та функціональні особливості майбутнього спецодягу.",
                "process.build.title": "Розробка",
                "process.build.description1": "На основі зібраних даних ми розробляємо технічну документацію, створюємо лекала та виготовляємо перші зразки для тестування.",
                "process.deliver.title": "Виробництво",
                "process.deliver.description1": "Після затвердження зразків ми переходимо до серійного виробництва з контролем якості на кожному етапі.",
                
                # Контакти
                "contact.title": "Зв'яжіться з нами",
                "contact.description": "Готові відповісти на ваші запитання та обговорити можливості співпраці.",
                "contact.getInTouch": "Як з нами зв'язатися",
                
                # Футер
                "footer.company": "Компанія",
                "footer.services": "Послуги",
                "footer.projects": "Проекти",
                "footer.contact": "Контакти",
                "footer.privacy": "Політика конфіденційності",
                "footer.terms": "Умови використання",
                "footer.rights": "Всі права захищені",
            }
            
        elif locale == 'en':
            return {
                # Navigation
                "nav.home": "Home",
                "nav.about": "About",
                "nav.services": "Services",
                "nav.projects": "Projects",
                "nav.contact": "Contact",
                "nav.jobs": "Jobs",
                
                # Common
                "common.loading": "Loading...",
                "common.error": "Error",
                "common.retry": "Try again",
                "common.save": "Save",
                "common.cancel": "Cancel",
                "common.submit": "Submit",
                "common.back": "Back",
                "common.next": "Next",
                "common.close": "Close",
                "common.open": "Open",
                "common.edit": "Edit",
                "common.delete": "Delete",
                "common.view": "View",
                "common.download": "Download",
                
                # Forms
                "form.name": "Name",
                "form.email": "Email",
                "form.phone": "Phone",
                "form.company": "Company",
                "form.message": "Message",
                "form.subject": "Subject",
                "form.send": "Send",
                "form.required": "Required field",
                "form.invalid": "Invalid value",
                "form.success": "Form submitted successfully",
                
                # Homepage
                "hero.title": "Workwear Manufacturer in Ukraine.",
                "hero.description": "We create high-quality and reliable workwear that ensures comfort and safety in any conditions.",
                
                "clients.title": "We work with leading companies in Ukraine and Europe",
                
                "caseStudies.title": "Reliability and quality in every detail",
                "caseStudies.description": "Our many years of experience in workwear manufacturing guarantees high quality and reliability of every product.",
                "caseStudies.successfulProject": "Successful project",
                "caseStudies.items.phobia.title": "Protective clothing for industry",
                "caseStudies.items.phobia.description": "Development and manufacturing of workwear to protect workers in harsh conditions.",
                "caseStudies.items.familyFund.title": "Medical clothing",
                "caseStudies.items.familyFund.description": "Comfortable and functional medical clothing for hospital staff.",
                "caseStudies.items.unseal.title": "Military uniform",
                "caseStudies.items.unseal.description": "Reliable and practical uniform for military units.",
                
                "services.eyebrow": "Services",
                "services.title": "We create quality workwear tailored to your needs.",
                "services.description": "We manufacture workwear for various industries, including military uniforms, medical clothing, and workwear for other sectors.",
                "services.technicalSpecs.title": "Technical Specifications Development",
                "services.technicalSpecs.description": "We specialize in creating technical specifications according to your requirements.",
                "services.tailoring.title": "Clothing Manufacturing",
                "services.tailoring.description": "According to your specifications, we manufacture products using your materials or our own.",
                "services.logoApplication.title": "Logo Application",
                "services.logoApplication.description": "We offer logo or brand application services on products.",
                "services.other.title": "Other",
                "services.other.description": "In addition, we offer a wide range of ready-made products, fabrics and accessories.",
                
                "testimonial.quote": "The UGC team exceeded our expectations by ensuring high quality workwear and meeting deadlines. Excellent communication and professional approach made the collaboration easy and effective.",
                
                # Process
                "process.discover.title": "Needs Analysis",
                "process.discover.description1": "Our team conducts a thorough analysis of your business specifics, working conditions and special needs.",
                "process.discover.description2": "At this stage, we determine the technical characteristics, materials, design and functional features of the future workwear.",
                "process.build.title": "Development",
                "process.build.description1": "Based on the collected data, we develop technical documentation, create patterns and produce the first samples for testing.",
                "process.deliver.title": "Production",
                "process.deliver.description1": "After approval of samples, we proceed to mass production with quality control at every stage.",
                
                # Contact
                "contact.title": "Contact Us",
                "contact.description": "Ready to answer your questions and discuss collaboration opportunities.",
                "contact.getInTouch": "Get in Touch",
                
                # Footer
                "footer.company": "Company",
                "footer.services": "Services",
                "footer.projects": "Projects",
                "footer.contact": "Contact",
                "footer.privacy": "Privacy Policy",
                "footer.terms": "Terms of Service",
                "footer.rights": "All rights reserved",
            }
        else:
            return {}

    def get_dynamic_translations(self, locale):
        """Динамічні переклади з Django моделей"""
        from django.utils import translation
        
        translation.activate(locale)
        translations = {}
        
        try:
            # Послуги
            try:
                from apps.services.models import Service
                services = Service.objects.filter(is_active=True)
                for service in services:
                    if hasattr(service, 'name'):
                        # Використовуємо як ID, так і slug (якщо є)
                        if hasattr(service, 'slug') and service.slug:
                            key_base = f"service.{service.slug}"
                        else:
                            key_base = f"service.{service.pk}"
                            
                        translations[f"{key_base}.name"] = str(service.name)
                        
                        if hasattr(service, 'short_description') and service.short_description:
                            translations[f"{key_base}.description"] = str(service.short_description)
                            
            except Exception as e:
                self.stdout.write(f"⚠️ Послуги: {e}")
            
            # Категорії проектів
            try:
                from apps.projects.models import ProjectCategory
                categories = ProjectCategory.objects.filter(is_active=True)
                for category in categories:
                    if hasattr(category, 'name'):
                        if hasattr(category, 'slug') and category.slug:
                            key_base = f"category.{category.slug}"
                        else:
                            key_base = f"category.{category.pk}"
                            
                        translations[f"{key_base}.name"] = str(category.name)
                        
                        if hasattr(category, 'description') and category.description:
                            translations[f"{key_base}.description"] = str(category.description)
                            
            except Exception as e:
                self.stdout.write(f"⚠️ Категорії: {e}")
            
            # Проекти (обмежуємо кількість)
            try:
                from apps.projects.models import Project
                projects = Project.objects.filter(is_active=True)[:10]
                for project in projects:
                    if hasattr(project, 'title'):
                        if hasattr(project, 'slug') and project.slug:
                            key_base = f"project.{project.slug}"
                        else:
                            key_base = f"project.{project.pk}"
                            
                        translations[f"{key_base}.title"] = str(project.title)
                        
                        if hasattr(project, 'short_description') and project.short_description:
                            translations[f"{key_base}.description"] = str(project.short_description)
                            
            except Exception as e:
                self.stdout.write(f"⚠️ Проекти: {e}")
            
            # Головна сторінка
            try:
                from apps.content.models import HomePage
                homepage = HomePage.objects.filter(is_active=True).first()
                if homepage:
                    if hasattr(homepage, 'company_description') and homepage.company_description:
                        translations['homepage.company_description'] = str(homepage.company_description)
                    if hasattr(homepage, 'mission_text') and homepage.mission_text:
                        translations['homepage.mission_text'] = str(homepage.mission_text)
                    if hasattr(homepage, 'values_text') and homepage.values_text:
                        translations['homepage.values_text'] = str(homepage.values_text)
                        
            except Exception as e:
                self.stdout.write(f"⚠️ Головна сторінка: {e}")
                
        except Exception as e:
            self.stdout.write(f"⚠️ Загальна помилка динамічних перекладів: {e}")
        finally:
            translation.deactivate()
            
        return translations