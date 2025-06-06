from django.contrib import admin
from django.db import models
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import path, reverse
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RangeNumericFilter,
    SingleNumericFilter,
)
from unfold.contrib.forms.widgets import (
    WysiwygWidget,
    ArrayWidget,
)
from unfold.decorators import display
from parler.admin import TranslatableAdmin
from .models import Service, ServiceFeature


class ServiceFeatureInline(TabularInline):
    """Инлайн для особенностей услуг"""
    model = ServiceFeature
    extra = 1
    min_num = 0
    fields = ['title', 'description', 'icon', 'order']
    
    formfield_overrides = {
        models.TextField: {"widget": WysiwygWidget},
    }


@admin.register(Service)
class ServiceAdmin(TranslatableAdmin, ModelAdmin):
    """Админка для услуг"""
    list_display = [
        'name',
        'service_preview',
        'order',
        'is_featured_display',
        'is_active_display',
        'features_count',
        'created_at',
        'is_featured', 
        'is_active'
    ]
    list_filter = [
        'is_featured',
        'is_active',
        ('created_at', RangeDateFilter),
        ('min_order_quantity', RangeNumericFilter),
    ]
    search_fields = [
        'translations__name',
        'translations__short_description',
        'translations__detailed_description'
    ]
    list_editable = ['order', 'is_featured', 'is_active']
    ordering = ['order', 'translations__name']
    date_hierarchy = 'created_at'
    
    inlines = [ServiceFeatureInline]
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['name', 'slug', 'short_description', 'detailed_description'],
            'classes': ['tab'],
        }),
        (_("Медіа"), {
            'fields': ['icon', 'main_image'],
            'classes': ['tab'],
        }),
        (_("Додаткова інформація"), {
            'fields': ['benefits', 'min_order_quantity', 'production_time'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['order', 'is_featured', 'is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Зображення"))
    def service_preview(self, obj):
        if obj.main_image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.main_image.url
            )
        return "Немає зображення"
    
    @display(description=_("Рекомендована"), ordering='is_featured')
    def is_featured_display(self, obj):
        if obj.is_featured:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Рекомендована</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Звичайна</span>'
        )
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активна</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивна</span>'
        )
    
    @display(description=_("Особливості"))
    def features_count(self, obj):
        count = obj.features.count()
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{} особливостей</span>',
            count
        )

    formfield_overrides = {
        models.TextField: {"widget": WysiwygWidget},
    }
    
    actions = ['make_active', 'make_inactive', 'mark_as_featured', 'unmark_as_featured']
    
    @admin.action(description=_("Позначити як активні"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} послуг позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивні"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} послуг позначено як неактивні.")
    
    @admin.action(description=_("Позначити як рекомендовані"))
    def mark_as_featured(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f"{count} послуг позначено як рекомендовані.")
    
    @admin.action(description=_("Зняти рекомендацію"))
    def unmark_as_featured(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f"З {count} послуг знято рекомендацію.")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('features')


@admin.register(ServiceFeature)
class ServiceFeatureAdmin(TranslatableAdmin, ModelAdmin):
    """Админка для особенностей услуг"""
    list_display = [
        'title',
        'service',
        'icon_display',
        'order'
    ]
    list_filter = [
        'service',
    ]
    search_fields = [
        'translations__title',
        'translations__description',
        'service__translations__name'
    ]
    list_editable = ['order']
    ordering = ['service', 'order']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['service', 'title', 'description'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['icon', 'order'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Іконка"))
    def icon_display(self, obj):
        if obj.icon:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><i class="{}"></i> {}</span>',
                obj.icon,
                obj.icon
            )
        return "Немає іконки"

    autocomplete_fields = ['service']
    
    formfield_overrides = {
        models.TextField: {"widget": WysiwygWidget},
    }