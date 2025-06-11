from .models import Office, ContactInquiry
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.contrib.filters.admin import (
    RangeDateFilter,
)
from unfold.decorators import display
from apps.common.admin import UnfoldTabbedTranslationAdmin  


@admin.register(Office)
class OfficeAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для офисов и фабрик"""
    list_display = [
        'name', 
        'office_type_display', 
        'phone', 
        'email', 
        'is_main_display',
        'is_active_display',
        'order',
        'is_active'
    ]
    list_display_links = ['name']
    list_filter = [
        'office_type',
        'is_main',
        'is_active',
    ]
    list_editable = ['order', 'is_active']
    search_fields = ['name', 'address', 'phone', 'email']
    ordering = ['order', 'name']
    
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
    
    @display(description=_("Головний"), ordering='is_main')
    def is_main_display(self, obj):
        if obj.is_main:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Головний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Звичайний</span>'
        )
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивний</span>'
        )
    
  
    
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
        # Сначала убираем отметку "главный" со всех офисов
        Office.objects.update(is_main=False)
        # Затем отмечаем выбранный офис как главный
        if queryset.exists():
            queryset.first().is_main = True
            queryset.first().save()
            self.message_user(request, "Головний офіс змінено.")


@admin.register(ContactInquiry)
class ContactInquiryAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для обращений через форму обратной связи"""
    list_display = [
        'name',
        'email', 
        'inquiry_type_display',
        'subject',
        'company',
        'created_at',
        'is_processed_display',
        'is_processed'
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
    
    readonly_fields = ['created_at', 'processed_at']
    
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
    
    @display(description=_("Тип запиту"), ordering='inquiry_type')
    def inquiry_type_display(self, obj):
        colors = {
            'general': 'blue',
            'cooperation': 'green',
            'complaint': 'red',
            'suggestion': 'yellow',
            'quote': 'purple'
        }
        color = colors.get(obj.inquiry_type, 'gray')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{}-100 text-{}-800">{}</span>',
            color, color, obj.get_inquiry_type_display()
        )
    
    @display(description=_("Статус"), ordering='is_processed')
    def is_processed_display(self, obj):
        if obj.is_processed:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Оброблено</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Нове</span>'
        )
    
   
    
    actions = ['mark_processed', 'mark_unprocessed']
    
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
        """Автоматически устанавливаем дату обработки"""
        if 'is_processed' in form.changed_data and obj.is_processed:
            from django.utils import timezone
            obj.processed_at = timezone.now()
        elif 'is_processed' in form.changed_data and not obj.is_processed:
            obj.processed_at = None
        super().save_model(request, obj, form, change)