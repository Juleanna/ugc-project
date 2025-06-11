from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RangeNumericFilter,
 )
from .models import PartnershipInfo, WorkStage, PartnerInquiry
from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RangeNumericFilter,
    
)
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.decorators import display
from apps.common.admin import UnfoldTabbedTranslationAdmin  


@admin.register(PartnershipInfo)
class PartnershipInfoAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для информации для партнеров"""
    list_display = [
        'min_order_amount_display',
        'production_capacity',
        'is_active_display',
        'updated_at'
    ]
    list_filter = [
        'is_active',
        ('updated_at', RangeDateFilter),
        ('min_order_amount', RangeNumericFilter),
    ]
    search_fields = [
        'cooperation_terms',
        'faq_content',
        'production_capacity'
    ]
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['cooperation_terms', 'work_stages', 'benefits'],
            'classes': ['tab'],
        }),
        (_("FAQ"), {
            'fields': ['faq_content'],
            'classes': ['tab'],
        }),
        (_("Виробничі характеристики"), {
            'fields': ['min_order_amount', 'production_capacity'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Мін. замовлення"))
    def min_order_amount_display(self, obj):
        if obj.min_order_amount:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{:,} грн</span>',
                obj.min_order_amount
            )
        return "Не вказано"
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активна</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивна</span>'
        )



@admin.register(WorkStage)
class WorkStageAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для этапов работы"""
    list_display = [
        'title',
        'icon_display',
        'duration',
        'order'
    ]
    search_fields = [
        'title',
        'description'
    ]
    list_editable = ['order']
    ordering = ['order']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['title', 'description'],
            'classes': ['tab'],
        }),
        (_("Візуальне оформлення"), {
            'fields': ['icon'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['order', 'duration'],
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



@admin.register(PartnerInquiry)
class PartnerInquiryAdmin(ModelAdmin):
    """Админка для запросов партнеров"""
    list_display = [
        'company_name',
        'contact_person',
        'email',
        'phone',
        'inquiry_type_display',
        'is_processed_display',
        'created_at',
        'is_processed'
    ]
    list_filter = [
        'inquiry_type',
        'is_processed',
        ('created_at', RangeDateFilter),
    ]
    search_fields = [
        'company_name',
        'contact_person',
        'email',
        'message',
        'project_description'
    ]
    list_editable = ['is_processed']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']
    
    fieldsets = [
        (_("Інформація про компанію"), {
            'fields': ['company_name', 'contact_person', 'email', 'phone'],
            'classes': ['tab'],
        }),
        (_("Запит"), {
            'fields': ['inquiry_type', 'message', 'project_description', 'estimated_quantity'],
            'classes': ['tab'],
        }),
        (_("Статус"), {
            'fields': ['is_processed', 'created_at'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Тип запиту"), ordering='inquiry_type')
    def inquiry_type_display(self, obj):
        colors = {
            'cooperation': 'blue',
            'quote': 'green',
            'samples': 'orange',
            'other': 'gray'
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
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Новий</span>'
        )

    actions = ['mark_processed', 'mark_unprocessed']
    
    @admin.action(description=_("Позначити як оброблені"))
    def mark_processed(self, request, queryset):
        count = queryset.update(is_processed=True)
        self.message_user(request, f"{count} запитів позначено як оброблені.")
    
    @admin.action(description=_("Позначити як необроблені"))
    def mark_unprocessed(self, request, queryset):
        count = queryset.update(is_processed=False)
        self.message_user(request, f"{count} запитів позначено як необроблені.")