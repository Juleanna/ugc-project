from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.contrib.filters.admin import (
    RangeDateFilter,
)
from unfold.decorators import display
from apps.common.admin import UnfoldTabbedTranslationAdmin  
from .models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto

@admin.register(HomePage)
class HomePageAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для главной страницы"""
    list_display = [
        'years_experience', 
        'employees_count', 
        'projects_completed', 
        'is_active_display',
        'updated_at'
    ]
    list_filter = [
        'is_active',
        ('updated_at', RangeDateFilter),
    ]
    search_fields = ['company_description']
    
    fieldsets = [
        (_("Контент"), {
            'fields': ['company_description', 'mission_text', 'values_text'],
            'classes': ['tab'],
        }),
        (_("Медіа"), {
            'fields': ['hero_video', 'hero_image'],
            'classes': ['tab'],
        }),
        (_("Статистика"), {
            'fields': ['years_experience', 'employees_count', 'projects_completed'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активна</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивна</span>'
        )

   

@admin.register(AboutPage)
class AboutPageAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для страницы О нас"""
    list_display = ['is_active_display', 'updated_at']
    list_filter = [
        'is_active',
        ('updated_at', RangeDateFilter),
    ]
    search_fields = ['history_text']
    
    fieldsets = [
        (_("Основний контент"), {
            'fields': ['history_text', 'mission_text', 'values_text'],
            'classes': ['tab'],
        }),
        (_("Додатковий контент"), {
            'fields': ['social_responsibility'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активна</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивна</span>'
        )


@admin.register(TeamMember)
class TeamMemberAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для команды"""
    list_display = [
        'name', 
        'position', 
        'photo_preview',
        'is_management_display',
        'is_active_display',
        'order',
        'is_active'
    ]
    list_filter = [
        'is_management', 
        'is_active',
    ]
    search_fields = ['name', 'position']
    list_editable = ['order', 'is_active']
    ordering = ['order', 'name']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['name', 'position', 'bio'],
            'classes': ['tab'],
        }),
        (_("Фото"), {
            'fields': ['photo'],
            'classes': ['tab'],
        }),
        (_("Контакти"), {
            'fields': ['email', 'linkedin'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['order', 'is_management', 'is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Фото"))
    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" width="40" height="40" style="border-radius: 50%; object-fit: cover;" />',
                obj.photo.url
            )
        return "Немає фото"
    
    @display(description=_("Керівництво"), ordering='is_management')
    def is_management_display(self, obj):
        if obj.is_management:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Керівництво</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Співробітник</span>'
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

    actions = ['make_active', 'make_inactive', 'mark_as_management']
    
    @admin.action(description=_("Позначити як активних"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} членів команди позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивних"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} членів команди позначено як неактивні.")
    
    @admin.action(description=_("Позначити як керівництво"))
    def mark_as_management(self, request, queryset):
        count = queryset.update(is_management=True)
        self.message_user(request, f"{count} членів команди позначено як керівництво.")


@admin.register(Certificate)
class CertificateAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для сертификатов"""
    list_display = [
        'title', 
        'issued_date', 
        'issuing_organization',
        'certificate_preview',
        'is_active_display'
    ]
    list_filter = [
        'is_active',
        ('issued_date', RangeDateFilter),
        'issuing_organization',
    ]
    search_fields = ['title', 'issuing_organization']
    date_hierarchy = 'issued_date'
    ordering = ['-issued_date']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['title', 'description'],
            'classes': ['tab'],
        }),
        (_("Деталі сертифікату"), {
            'fields': ['issued_date', 'issuing_organization', 'certificate_url'],
            'classes': ['tab'],
        }),
        (_("Зображення"), {
            'fields': ['image'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Зображення"))
    def certificate_preview(self, obj):
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
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активний</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивний</span>'
        )


@admin.register(ProductionPhoto)
class ProductionPhotoAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для фото производства"""
    list_display = [
        'title',
        'photo_preview',
        'is_featured_display',
        'is_active_display',
        'order',
        'is_active',
        'is_featured'
    ]
    list_filter = [
        'is_featured',
        'is_active',
    ]
    search_fields = ['title']
    list_editable = ['order', 'is_active', 'is_featured']
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
            'fields': ['order', 'is_featured', 'is_active'],
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
    
    @display(description=_("Рекомендоване"), ordering='is_featured')
    def is_featured_display(self, obj):
        if obj.is_featured:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Рекомендоване</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Звичайне</span>'
        )
    
    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активне</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивне</span>'
        )

    actions = ['make_active', 'make_inactive', 'mark_as_featured']
    
    @admin.action(description=_("Позначити як активні"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} фото позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивні"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} фото позначено як неактивні.")
    
    @admin.action(description=_("Позначити як рекомендовані"))
    def mark_as_featured(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f"{count} фото позначено як рекомендовані.")