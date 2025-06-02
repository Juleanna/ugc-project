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
    BASE_DIR / 'locale',  # Укажите путь для хранения файлов перевода
]

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS settings для Next.js
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js dev server
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# DRF settings
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
    ],
}

# Parler settings (мультиязычность)
PARLER_LANGUAGES = {
    None: (
        {'code': 'uk'},
        {'code': 'en'},
    ),
    'default': {
        'fallbacks': ['uk'],
        'hide_untranslated': False,
    }
}


CKEDITOR_UPLOAD_PATH = "uploads/"
# Максимальный размер загружаемых файлов
CKEDITOR_IMAGE_BACKEND = "pillow"
CKEDITOR_RESTRICT_BY_USER = True  # Ограничить доступ к файлам текущего пользователя (опционально)
CKEDITOR_ALLOW_NONIMAGE_FILES = False  # Разрешить только изображения

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

UNFOLD = {
    "SITE_TITLE": "Адмін панель",
    "SITE_HEADER": "Управління сайтом",
    "SITE_URL": "/",
    "SITE_ICON": lambda request: static("icon.svg"),  # опционально
    "SITE_LOGO": lambda request: static("logo.svg"),  # опционально
    "SITE_SYMBOL": "speed",  # symbol from icon set
    "SHOW_HISTORY": True,  # show/hide "History" button
    "SHOW_VIEW_ON_SITE": True,  # show/hide "View on site" button
    "ENVIRONMENT": "ugc_backend.settings.environment_callback",  # опционально
    "DASHBOARD_CALLBACK": "ugc_backend.settings.dashboard_callback",  # опционально
    "LOGIN": {
        "image": lambda request: static("login-bg.jpg"),  # опционально
        "redirect_after": lambda request: reverse_lazy("admin:index"),
    },
    "STYLES": [
        lambda request: static("css/styles.css"),  # опционально
    ],
    "SCRIPTS": [
        lambda request: static("js/script.js"),  # опционально
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
                "ru": "🇷🇺",
            },
        },
    },
    "SIDEBAR": {
        "show_search": True,  # Search in applications and models names
        "show_all_applications": True,  # Dropdown with all applications and models
        "navigation": [
            {
                "title": _("Навігація"),
                "separator": True,  # Top border
                "items": [
                    {
                        "title": _("Головна"),
                        "icon": "dashboard",  # Supported icon set: https://fonts.google.com/icons
                        "link": lambda request: reverse_lazy("admin:index"),
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
                        "link": lambda request: reverse_lazy("admin:ugc_backend_office_changelist"),
                    },
                    {
                        "title": _("Звернення"),
                        "icon": "contact_support",
                        "link": lambda request: reverse_lazy("admin:ugc_backend_contactinquiry_changelist"),
                    },
                ],
            },
        ],
    },
    "TABS": [
        {
            "models": [
                "ugc_backend.office",
            ],
            "items": [
                {
                    "title": _("Всі офіси"),
                    "link": lambda request: reverse_lazy("admin:ugc_backend_office_changelist"),
                },
                {
                    "title": _("Активні"),
                    "link": lambda request: reverse_lazy("admin:ugc_backend_office_changelist") + "?is_active__exact=1",
                },
                {
                    "title": _("Головні офіси"),
                    "link": lambda request: reverse_lazy("admin:ugc_backend_office_changelist") + "?is_main__exact=1",
                },
            ],
        },
        {
            "models": [
                "ugc_backend.contactinquiry",
            ],
            "items": [
                {
                    "title": _("Всі звернення"),
                    "link": lambda request: reverse_lazy("admin:ugc_backend_contactinquiry_changelist"),
                },
                {
                    "title": _("Необроблені"),
                    "link": lambda request: reverse_lazy("admin:ugc_backend_contactinquiry_changelist") + "?is_processed__exact=0",
                },
                {
                    "title": _("Оброблені"),
                    "link": lambda request: reverse_lazy("admin:ugc_backend_contactinquiry_changelist") + "?is_processed__exact=1",
                },
            ],
        },
    ],
}

def dashboard_callback(request, context):
    return context