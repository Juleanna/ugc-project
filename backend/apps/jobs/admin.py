from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RangeNumericFilter,
    
)
from .models import JobPosition, JobApplication, WorkplacePhoto
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.decorators import display
from apps.common.admin import UnfoldTabbedTranslationAdmin  



@admin.register(JobPosition)
class JobPositionAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для вакансий"""
    list_display = [
        'title',
        'employment_type_display',
        'location',
        'salary_range_display',
        'is_active_display',
        'is_urgent_display',
        'applications_count',
        'created_at',
        'is_active',
        'is_urgent'
    ]
    list_filter = [
        'employment_type',
        'is_active',
        'is_urgent',
        ('created_at', RangeDateFilter),
        ('expires_at', RangeDateFilter),
        ('salary_from', RangeNumericFilter),
        'salary_currency',
        'location',
    ]
    search_fields = [
        'title',
        'description',
        'location',
        'experience_required'
    ]
    list_editable = ['is_active', 'is_urgent']
    ordering = ['-created_at', 'title']
    date_hierarchy = 'created_at'
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['title', 'slug', 'description'],
            'classes': ['tab'],
        }),
        (_("Вимоги та обов'язки"), {
            'fields': ['requirements', 'responsibilities', 'benefits'],
            'classes': ['tab'],
        }),
        (_("Умови роботи"), {
            'fields': ['employment_type', 'experience_required', 'location'],
            'classes': ['tab'],
        }),
        (_("Зарплата"), {
            'fields': ['salary_from', 'salary_to', 'salary_currency'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['is_active', 'is_urgent', 'expires_at'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Тип зайнятості"), ordering='employment_type')
    def employment_type_display(self, obj):
        colors = {
            'full_time': 'green',
            'part_time': 'blue',
            'contract': 'orange'
        }
        color = colors.get(obj.employment_type, 'gray')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-{}-100 text-{}-800">{}</span>',
            color, color, obj.get_employment_type_display()
        )
    
    @display(description=_("Зарплата"))
    def salary_range_display(self, obj):
        if obj.salary_from and obj.salary_to:
            return f"{obj.salary_from:,} - {obj.salary_to:,} {obj.salary_currency}"
        elif obj.salary_from:
            return f"від {obj.salary_from:,} {obj.salary_currency}"
        elif obj.salary_to:
            return f"до {obj.salary_to:,} {obj.salary_currency}"
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
    
    @display(description=_("Терміново"), ordering='is_urgent')
    def is_urgent_display(self, obj):
        if obj.is_urgent:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Терміново</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Звичайна</span>'
        )
    
    @display(description=_("Заявки"))
    def applications_count(self, obj):
        count = obj.applications.count()
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{} заявок</span>',
            count
        )

      
    actions = ['make_active', 'make_inactive', 'mark_as_urgent', 'unmark_as_urgent']
    
    @admin.action(description=_("Позначити як активні"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} вакансій позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивні"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} вакансій позначено як неактивні.")
    
    @admin.action(description=_("Позначити як термінові"))
    def mark_as_urgent(self, request, queryset):
        count = queryset.update(is_urgent=True)
        self.message_user(request, f"{count} вакансій позначено як термінові.")
    
    @admin.action(description=_("Зняти позначку 'Терміново'"))
    def unmark_as_urgent(self, request, queryset):
        count = queryset.update(is_urgent=False)
        self.message_user(request, f"З {count} вакансій знято позначку 'Терміново'.")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('applications')


@admin.register(JobApplication)
class JobApplicationAdmin(ModelAdmin):
    """Админка для заявок на вакансии"""
    list_display = [
        'full_name',
        'position',
        'email',
        'phone',
        'has_resume',
        'is_reviewed_display',
        'created_at',
        'is_reviewed'
    ]
    list_filter = [
        'is_reviewed',
        ('created_at', RangeDateFilter),
        'position__employment_type',
        'position',
    ]
    search_fields = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'position'
    ]
    list_editable = ['is_reviewed']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']
    
    fieldsets = [
        (_("Персональна інформація"), {
            'fields': ['first_name', 'last_name', 'email', 'phone'],
            'classes': ['tab'],
        }),
        (_("Вакансія"), {
            'fields': ['position'],
            'classes': ['tab'],
        }),
        (_("Додаткова інформація"), {
            'fields': ['cover_letter', 'resume'],
            'classes': ['tab'],
        }),
        (_("Статус"), {
            'fields': ['is_reviewed', 'created_at'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Ім'я"))
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    @display(description=_("Резюме"))
    def has_resume(self, obj):
        if obj.resume:
            return format_html(
                '<a href="{}" target="_blank" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Є резюме</a>',
                obj.resume.url
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Немає резюме</span>'
        )
    
    @display(description=_("Статус"), ordering='is_reviewed')
    def is_reviewed_display(self, obj):
        if obj.is_reviewed:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Переглянуто</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Нове</span>'
        )

    autocomplete_fields = ['position']
    
    actions = ['mark_reviewed', 'mark_unreviewed']
    
    @admin.action(description=_("Позначити як переглянуті"))
    def mark_reviewed(self, request, queryset):
        count = queryset.update(is_reviewed=True)
        self.message_user(request, f"{count} заявок позначено як переглянуті.")
    
    @admin.action(description=_("Позначити як непереглянуті"))
    def mark_unreviewed(self, request, queryset):
        count = queryset.update(is_reviewed=False)
        self.message_user(request, f"{count} заявок позначено як непереглянуті.")


@admin.register(WorkplacePhoto)
class WorkplacePhotoAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для фото рабочих мест"""
    list_display = [
        'title',
        'photo_preview',
        'is_active_display',
        'order',
        'is_active'
    ]
    list_filter = [
        'is_active',
    ]
    search_fields = [
        'title',
        'description'
    ]
    list_editable = ['order', 'is_active']
    ordering = ['order']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['title', 'description'],
            'classes': ['tab'],
        }),
        (_("Зображення"), {
            'fields': ['image'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['order', 'is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Фото"))
    def photo_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "Немає зображення"
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активне</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивне</span>'
        )

    actions = ['make_active', 'make_inactive']
    
    @admin.action(description=_("Позначити як активні"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} фото позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивні"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} фото позначено як неактивні.")