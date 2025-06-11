from pathlib import Path
import os
from decouple import config
from django.urls import reverse_lazy
from django.templatetags.static import static
from django.utils.translation import gettext_lazy as _
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost').split(',')



# Application definition

DJANGO_APPS = [
    'modeltranslation',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'parler', 
    'rosetta',
    'ckeditor',
    'ckeditor_uploader',
]

LOCAL_APPS = [
   # Ваши приложения
    'apps.content',
    'apps.services',
    'apps.projects',
    'apps.jobs',
    'apps.partners',
    'apps.contacts',
    'apps.api',
    
]
UNFOLOD = [
    'unfold',  # before django.contrib.admin
    'unfold.contrib.filters',  # optional, requires django-filter
    'unfold.contrib.forms',  # optional, requires django-crispy-forms
    'unfold.contrib.inlines',  # optional
    'unfold.contrib.import_export',  # optional, requires django-import-export
    'unfold.contrib.guardian',  # optional, requires django-guardian
    'unfold.contrib.simple_history',  # optional, requires django-simple-history
]

INSTALLED_APPS = UNFOLOD + DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
]

ROOT_URLCONF = 'ugc_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ugc_backend.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Internationalization
LANGUAGE_CODE = 'uk'
TIME_ZONE = 'Europe/Kiev'
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ('uk', 'Українська'),
    ('en', 'English'),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',  
]


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework настройки
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}

MODELTRANSLATION_DEFAULT_LANGUAGE = 'uk'
MODELTRANSLATION_LANGUAGES = ('uk', 'en')
MODELTRANSLATION_FALLBACK_LANGUAGES = ('uk',)

CKEDITOR_CONFIGS = {
    'default': {
        #'skin': 'moono',
        'skin': 'office2013',
        'toolbar_Basic': [
            ['Source', '-', 'Bold', 'Italic']
        ],
        'toolbar_YourCustomToolbarConfig': [
            {'name': 'document', 'items': ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates']},
            {'name': 'clipboard', 'items': ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
            {'name': 'editing', 'items': ['Find', 'Replace', '-', 'SelectAll']},
            {'name': 'forms',
             'items': ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton',
                       'HiddenField']},
            '/',
            {'name': 'basicstyles',
             'items': ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
            {'name': 'paragraph',
             'items': ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-',
                       'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl',
                       'Language']},
            {'name': 'links', 'items': ['Link', 'Unlink', 'Anchor']},
            {'name': 'insert',
             'items': ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']},
            '/',
            {'name': 'styles', 'items': ['Styles', 'Format', 'Font', 'FontSize']},
            {'name': 'colors', 'items': ['TextColor', 'BGColor']},
            {'name': 'tools', 'items': ['Maximize', 'ShowBlocks']},
            {'name': 'about', 'items': ['About']},
            '/',  # put this to force next toolbar on new line
            {'name': 'yourcustomtools', 'items': [
                # put the name of your editor.ui.addButton here
                'Preview',
                'Maximize',
                

            ]},
        ],
        'image2_alignClasses': ['align-left', 'align-center', 'align-right'],
        'toolbar': 'YourCustomToolbarConfig',  
       
        'tabSpaces': 4,
        'extraPlugins': ','.join([
            'uploadimage', 
            'div',
            'justify',
            'autolink',
            'autoembed',
            'embedsemantic',
            'autogrow',
           
            'widget',
            'lineutils',
            'clipboard',
            'dialog',
            'dialogui',
            'elementspath'
        ]),
    }
}

# Unfold Admin Configuration
UNFOLD = {
    "SITE_TITLE": "UGC - Адмін панель",
    "SITE_HEADER": "Управління сайтом UGC",
    "SITE_URL": "/",
    "SITE_ICON": lambda request: static("image/favicon.ico"),  # опционально
    
   
    "SITE_SYMBOL": "business",  # symbol from icon set
    "SHOW_HISTORY": True,  # show/hide "History" button
    "SHOW_VIEW_ON_SITE": True,  # show/hide "View on site" button
    "ENVIRONMENT": "ugc_backend.settings.environment_callback",  # опционально
    "DASHBOARD_CALLBACK": "ugc_backend.settings.dashboard_callback",  # опционально
    "LOGIN": {
        "image": lambda request: static("login-bg.jpg"),  # опционально
        "redirect_after": lambda request: reverse_lazy("admin:index"),
    },
    "STYLES": [
        #lambda request: static("css/styles.css"),  # опционально
    ],
    "SCRIPTS": [
        #lambda request: static("js/script.js"),  # опционально
    ],
    "COLORS": {
        "primary": {
            "50": "250 245 255",
            "100": "243 232 255",
            "200": "233 213 255",
            "300": "216 180 254",
            "400": "196 141 253",
            "500": "168 85 247",
            "600": "147 51 234",
            "700": "126 34 206",
            "800": "107 33 168",
            "900": "88 28 135",
        },
    },
    "EXTENSIONS": {
        "modeltranslation": {
            "flags": {
                "en": "🇺🇸",
                "uk": "🇺🇦",
            },
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": _("Навігація"),
                "separator": True,
                "items": [
                    {
                        "title": _("Головна"),
                        "icon": "dashboard",
                        "link": lambda request: reverse_lazy("admin:index"),
                    },
                ],
            },
            {
                "title": _("Контент"),
                "separator": True,
                "items": [
                    {
                        "title": _("Головна сторінка"),
                        "icon": "home",
                        "link": lambda request: reverse_lazy("admin:content_homepage_changelist"),
                    },
                    {
                        "title": _("Про нас"),
                        "icon": "info",
                        "link": lambda request: reverse_lazy("admin:content_aboutpage_changelist"),
                    },
                    {
                        "title": _("Команда"),
                        "icon": "group",
                        "link": lambda request: reverse_lazy("admin:content_teammember_changelist"),
                    },
                    {
                        "title": _("Сертифікати"),
                        "icon": "verified",
                        "link": lambda request: reverse_lazy("admin:content_certificate_changelist"),
                    },
                    {
                        "title": _("Фото виробництва"),
                        "icon": "photo_library",
                        "link": lambda request: reverse_lazy("admin:content_productionphoto_changelist"),
                    },
                ],
            },
            {
                "title": _("Послуги"),
                "separator": True,
                "items": [
                    {
                        "title": _("Всі послуги"),
                        "icon": "design_services",
                        "link": lambda request: reverse_lazy("admin:services_service_changelist"),
                    },
                    {
                        "title": _("Особливості послуг"),
                        "icon": "star",
                        "link": lambda request: reverse_lazy("admin:services_servicefeature_changelist"),
                    },
                ],
            },
            {
                "title": _("Проєкти"),
                "separator": True,
                "items": [
                    {
                        "title": _("Категорії проєктів"),
                        "icon": "category",
                        "link": lambda request: reverse_lazy("admin:projects_projectcategory_changelist"),
                    },
                    {
                        "title": _("Всі проєкти"),
                        "icon": "work",
                        "link": lambda request: reverse_lazy("admin:projects_project_changelist"),
                    },
                    {
                        "title": _("Зображення проєктів"),
                        "icon": "collections",
                        "link": lambda request: reverse_lazy("admin:projects_projectimage_changelist"),
                    },
                ],
            },
            {
                "title": _("Вакансії"),
                "separator": True,
                "items": [
                    {
                        "title": _("Позиції"),
                        "icon": "work_outline",
                        "link": lambda request: reverse_lazy("admin:jobs_jobposition_changelist"),
                    },
                    {
                        "title": _("Заявки"),
                        "icon": "assignment",
                        "link": lambda request: reverse_lazy("admin:jobs_jobapplication_changelist"),
                    },
                    {
                        "title": _("Фото робочих місць"),
                        "icon": "business_center",
                        "link": lambda request: reverse_lazy("admin:jobs_workplacephoto_changelist"),
                    },
                ],
            },
            {
                "title": _("Партнери"),
                "separator": True,
                "items": [
                    {
                        "title": _("Інформація для партнерів"),
                        "icon": "handshake",
                        "link": lambda request: reverse_lazy("admin:partners_partnershipinfo_changelist"),
                    },
                    {
                        "title": _("Етапи роботи"),
                        "icon": "timeline",
                        "link": lambda request: reverse_lazy("admin:partners_workstage_changelist"),
                    },
                    {
                        "title": _("Запити партнерів"),
                        "icon": "mail",
                        "link": lambda request: reverse_lazy("admin:partners_partnerinquiry_changelist"),
                    },
                ],
            },
            {
                "title": _("Контакти"),
                "separator": True,
                "items": [
                    {
                        "title": _("Офіси та фабрики"),
                        "icon": "business",
                        "link": lambda request: reverse_lazy("admin:contacts_office_changelist"),
                    },
                    {
                        "title": _("Звернення"),
                        "icon": "contact_support",
                        "link": lambda request: reverse_lazy("admin:contacts_contactinquiry_changelist"),
                    },
                ],
            },
        ],
    },
    "TABS": [
        {
            "models": [
                "contacts.office",
            ],
            "items": [
                {
                    "title": _("Всі офіси"),
                    "link": lambda request: reverse_lazy("admin:contacts_office_changelist"),
                },
                {
                    "title": _("Активні"),
                    "link": lambda request: reverse_lazy("admin:contacts_office_changelist") + "?is_active__exact=1",
                },
                {
                    "title": _("Головні офіси"),
                    "link": lambda request: reverse_lazy("admin:contacts_office_changelist") + "?is_main__exact=1",
                },
            ],
        },
        {
            "models": [
                "contacts.contactinquiry",
            ],
            "items": [
                {
                    "title": _("Всі звернення"),
                    "link": lambda request: reverse_lazy("admin:contacts_contactinquiry_changelist"),
                },
                {
                    "title": _("Необроблені"),
                    "link": lambda request: reverse_lazy("admin:contacts_contactinquiry_changelist") + "?is_processed__exact=0",
                },
                {
                    "title": _("Оброблені"),
                    "link": lambda request: reverse_lazy("admin:contacts_contactinquiry_changelist") + "?is_processed__exact=1",
                },
            ],
        },
        {
            "models": [
                "services.service",
            ],
            "items": [
                {
                    "title": _("Всі послуги"),
                    "link": lambda request: reverse_lazy("admin:services_service_changelist"),
                },
                {
                    "title": _("Активні"),
                    "link": lambda request: reverse_lazy("admin:services_service_changelist") + "?is_active__exact=1",
                },
                {
                    "title": _("Рекомендовані"),
                    "link": lambda request: reverse_lazy("admin:services_service_changelist") + "?is_featured__exact=1",
                },
            ],
        },
        {
            "models": [
                "projects.project",
            ],
            "items": [
                {
                    "title": _("Всі проєкти"),
                    "link": lambda request: reverse_lazy("admin:projects_project_changelist"),
                },
                {
                    "title": _("Активні"),
                    "link": lambda request: reverse_lazy("admin:projects_project_changelist") + "?is_active__exact=1",
                },
                {
                    "title": _("Рекомендовані"),
                    "link": lambda request: reverse_lazy("admin:projects_project_changelist") + "?is_featured__exact=1",
                },
            ],
        },
        {
            "models": [
                "jobs.jobposition",
            ],
            "items": [
                {
                    "title": _("Всі вакансії"),
                    "link": lambda request: reverse_lazy("admin:jobs_jobposition_changelist"),
                },
                {
                    "title": _("Активні"),
                    "link": lambda request: reverse_lazy("admin:jobs_jobposition_changelist") + "?is_active__exact=1",
                },
                {
                    "title": _("Термінові"),
                    "link": lambda request: reverse_lazy("admin:jobs_jobposition_changelist") + "?is_urgent__exact=1",
                },
            ],
        },
        {
            "models": [
                "jobs.jobapplication",
            ],
            "items": [
                {
                    "title": _("Всі заявки"),
                    "link": lambda request: reverse_lazy("admin:jobs_jobapplication_changelist"),
                },
                {
                    "title": _("Нові"),
                    "link": lambda request: reverse_lazy("admin:jobs_jobapplication_changelist") + "?is_reviewed__exact=0",
                },
                {
                    "title": _("Переглянуті"),
                    "link": lambda request: reverse_lazy("admin:jobs_jobapplication_changelist") + "?is_reviewed__exact=1",
                },
            ],
        },
        {
            "models": [
                "partners.partnerinquiry",
            ],
            "items": [
                {
                    "title": _("Всі запити"),
                    "link": lambda request: reverse_lazy("admin:partners_partnerinquiry_changelist"),
                },
                {
                    "title": _("Нові"),
                    "link": lambda request: reverse_lazy("admin:partners_partnerinquiry_changelist") + "?is_processed__exact=0",
                },
                {
                    "title": _("Оброблені"),
                    "link": lambda request: reverse_lazy("admin:partners_partnerinquiry_changelist") + "?is_processed__exact=1",
                },
            ],
        },
    ],
}

def get_site_icon(request):
    return static("image/favicon.ico")

def get_site_logo(request):
    return static("image/logo.png")


def environment_callback(request):
    """Определение окружения для отображения в админке"""
    return "Розробка" if DEBUG else "Продакшн"

def dashboard_callback(request, context):
    """Дополнительные данные для дашборда"""
    return context

# Кеширование Redis (добавить если еще нет)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'ugc_api',
        'TIMEOUT': 300,  # 5 минут по умолчанию
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Додайте STATICFILES_DIRS
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# CKEditor media files
CKEDITOR_BASEPATH = "/static/ckeditor/ckeditor/"
CKEDITOR_UPLOAD_PATH = "uploads/"
CKEDITOR_IMAGE_BACKEND = "pillow"


CKEDITOR_RESTRICT_BY_USER = True
CKEDITOR_ALLOW_NONIMAGE_FILES = False

# Важливо! Додайте це для правильної роботи завантаження:
CKEDITOR_BROWSE_SHOW_DIRS = True
CKEDITOR_UPLOAD_SLUGIFY_FILENAME = True

# Переконайтеся, що MEDIA налаштування правильні:
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Для табів в адмінці
MODELTRANSLATION_ENABLE_FALLBACKS = True
MODELTRANSLATION_PREPOPULATE_LANGUAGE = 'uk'