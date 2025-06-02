from django.contrib import admin
from parler.admin import TranslatableAdmin
from .models import Service, ServiceFeature

# Модель Service
@admin.register(Service)
class ServiceAdmin(TranslatableAdmin):
    list_display = ['name', 'order', 'is_featured', 'is_active']
    list_filter = ['is_featured', 'is_active']
    search_fields = ['translations__name', 'translations__short_description', 'translations__detailed_description']


# Модель ServiceFeature
@admin.register(ServiceFeature)
class ServiceFeatureAdmin(TranslatableAdmin):
    list_display = ['title', 'service', 'order']
    list_filter = ['service']
    search_fields = ['translations__title', 'translations__description']
