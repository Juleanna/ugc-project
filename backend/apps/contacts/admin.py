from django.contrib import admin
from django.db import models
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse, path
from django.utils.safestring import mark_safe
from datetime import datetime
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RangeNumericFilter,
    SingleNumericFilter,
    SliderNumericFilter,
)
from unfold.contrib.forms.widgets import (
    WysiwygWidget,
    ArrayWidget,
)
from unfold.decorators import display
from parler.admin import TranslatableAdmin
from .models import (
    Office, ContactInquiry
)
from django.forms import CheckboxInput
from django.http import HttpResponse

@admin.register(Office)
class OfficeAdmin(TranslatableAdmin, ModelAdmin):
    # Основные настройки
    list_display = [
        'name', 
        'office_type_display', 
        'phone', 
        'email', 
        'is_main', 
        'is_active',
        'order'
    ]
    list_display_links = ['name']
    list_filter = [
        'office_type',
        'is_main',
        'is_active',
    ]
    list_editable = ['order', 'is_active']
    search_fields = ['translations__name', 'translations__address', 'phone', 'email']
    ordering = ['order', 'translations__name']
    
    # Группировка полей
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['name', 'office_type', 'description'],
            'classes': ['tab'],
        }),
        (_("Контактна інформація"), {
            'fields': ['phone', 'email', 'address', 'working_hours'],
            'classes': ['tab'],
        }),
        (_("Місцезнаходження"), {
            'fields': ['latitude', 'longitude'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['order', 'is_main', 'is_active'],
            'classes': ['tab'],
        }),
    ]
    
    # Настройки для переводимых полей
    def get_prepopulated_fields(self, request, obj=None):
        return {}
    
    # Кастомные методы отображения
    @display(description=_("Тип"), ordering='office_type')
    def office_type_display(self, obj):
        colors = {
            'office': 'blue',
            'factory': 'green', 
            'warehouse': 'orange'
        }
        color = colors.get(obj.office_type, 'gray')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{}-100 text-{}-800">{}</span>',
            color, color, obj.get_office_type_display()
        )
    
    formfield_overrides = {
        models.TextField: {"widget": WysiwygWidget},
        models.BooleanField: {"widget": CheckboxInput},
    }
    
    # Дополнительные настройки
    save_on_top = True
    save_as = True
    list_per_page = 20
    
    # Действия
    actions = ['make_active', 'make_inactive', 'mark_as_main']
    
    @admin.action(description=_("Позначити як активні"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} офісів позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивні"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} офісів позначено як неактивні.")
    
    @admin.action(description=_("Позначити як головний офіс"))
    def mark_as_main(self, request, queryset):
        Office.objects.update(is_main=False)
        if queryset.exists():
            queryset.first().is_main = True
            queryset.first().save()
            self.message_user(request, "Головний офіс змінено.")

    # Кастомный маршрут
    def get_urls(self):
        """Добавляет пользовательский маршрут."""
        urls = super().get_urls()
        custom_urls = [
            path(
                "office-list/",
                self.admin_site.admin_view(self.office_changelist_view),
                name="ugc_backend_office_changelist",
            ),
        ]
        return custom_urls + urls

    def office_changelist_view(self, request):
        # просто возвращаем стандартный changelist для модели Office
        return super().changelist_view(request)
    
    # Добавление ссылки на маршрут
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["custom_links"] = [
            {
                "name": "Список офисов",
                "url": reverse("admin:ugc_backend_office_changelist"),
            }
        ]
        return super().changelist_view(request, extra_context=extra_context)


@admin.register(ContactInquiry)
class ContactInquiryAdmin(ModelAdmin):
    # Основные настройки
    list_display = [
        'name',
        'email', 
        'inquiry_type',
        'subject',
        'created_at',
        'is_processed',
        'company'
    ]
    list_display_links = ['name', 'subject']
    list_filter = [
        'inquiry_type',
        'is_processed',
        ('created_at', RangeDateFilter),
        ('processed_at', RangeDateFilter),
    ]
    list_editable = ['is_processed']
    search_fields = ['name', 'email', 'company', 'subject', 'message']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    readonly_fields = ['created_at']
    
    fieldsets = [
        (_("Інформація про відправника"), {
            'fields': ['name', 'email', 'phone', 'company'],
            'classes': ['tab'],
        }),
        (_("Звернення"), {
            'fields': ['inquiry_type', 'subject', 'message'],
            'classes': ['tab'],
        }),
        (_("Обробка"), {
            'fields': ['is_processed', 'response', 'processed_at'],
            'classes': ['tab'],
        }),
        (_("Системна інформація"), {
            'fields': ['created_at'],
            'classes': ['tab', 'collapse'],
        }),
    ]
    
    @admin.action(description=_("Позначити як оброблені"))
    def mark_processed(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(is_processed=True, processed_at=timezone.now())
        self.message_user(request, f"{count} звернень позначено як оброблені.")
    
    @admin.action(description=_("Позначити як необроблені"))
    def mark_unprocessed(self, request, queryset):
        count = queryset.update(is_processed=False, processed_at=None)
        self.message_user(request, f"{count} звернень позначено як необроблені.")
    
    def save_model(self, request, obj, form, change):
        if 'is_processed' in form.changed_data and obj.is_processed:
            from django.utils import timezone
            obj.processed_at = timezone.now()
        elif 'is_processed' in form.changed_data and not obj.is_processed:
            obj.processed_at = None
        super().save_model(request, obj, form, change)


# Кастомный маршрут
    def get_urls(self):
        """Добавляет пользовательский маршрут."""
        urls = super().get_urls()
        custom_urls = [
            path(
                "contactinquiry-list/",
                self.admin_site.admin_view(self.contactinquiry_changelist_view),
                name="ugc_backend_contactinquiry_changelist",
            ),
        ]
        return custom_urls + urls

    def contactinquiry_changelist_view(self, request):
        # просто возвращаем стандартный changelist для модели Office
        return super().changelist_view(request)

    # Добавление ссылки на маршрут
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["custom_links"] = [
            {
                "name": "Список звернень",
                "url": reverse("admin:ugc_backend_contactinquiry_changelist"),
            }
        ]
        return super().changelist_view(request, extra_context=extra_context)

    


