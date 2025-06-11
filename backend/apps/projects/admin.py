from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RangeNumericFilter,
)
from parler.admin import TranslatableAdmin
from .models import ProjectCategory, Project, ProjectImage
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from unfold.decorators import display
from apps.common.admin import UnfoldTabbedTranslationAdmin  

class ProjectImageInline(TabularInline):
    model = ProjectImage
    extra = 1
    fields = ['image', 'caption', 'order', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return "Немає зображення"
    image_preview.short_description = "Попередній перегляд"

@admin.register(ProjectCategory)
class ProjectCategoryAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для категорий проектов"""
    list_display = [
        'name',
        'category_preview',
        'projects_count',
        'order',
        'is_active_display',
        'is_active'
    ]
    list_filter = [
        'is_active',
    ]
    search_fields = [
        'name',
        'description'
    ]
    list_editable = ['order', 'is_active']
    ordering = ['order', 'name']
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['name', 'slug', 'description'],
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

    @display(description=_("Статус"), ordering='is_active')
    def is_active_display(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Активна</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Неактивна</span>'
        )
    
    @display(description=_("Зображення"))
    def category_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "Немає зображення"
    
    @display(description=_("Проєкти"))
    def projects_count(self, obj):
        count = obj.projects.filter(is_active=True).count()
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{} проєктів</span>',
            count
        )
    
      
    actions = ['make_active', 'make_inactive']
    
    @admin.action(description=_("Позначити як активні"))
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} категорій позначено як активні.")
    
    @admin.action(description=_("Позначити як неактивні"))
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} категорій позначено як неактивні.")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('projects')


@admin.register(Project)
class ProjectAdmin(UnfoldTabbedTranslationAdmin):
    """Админка для проектов"""
    list_display = [
        'title',
        'project_preview',
        'category',
        'client_name',
        'project_date',
        'is_featured_display',
        'is_active_display',
        'images_count',
        'is_featured', 
        'is_active'
    ]
    list_filter = [
        'is_featured',
        'is_active',
        'category',
        ('project_date', RangeDateFilter),
        ('created_at', RangeDateFilter),
        ('quantity', RangeNumericFilter),
    ]
    search_fields = [
        'title',
        'short_description',
        'detailed_description',
        'client_name',
        'materials_used'
    ]
    list_editable = ['is_featured', 'is_active']
    ordering = ['-project_date', 'title']
    date_hierarchy = 'project_date'
    
    inlines = [ProjectImageInline]
    
    fieldsets = [
        (_("Основна інформація"), {
            'fields': ['title', 'category', 'slug', 'short_description', 'detailed_description'],
            'classes': ['tab'],
        }),
        (_("Додаткові деталі"), {
            'fields': ['challenge', 'solution', 'result'],
            'classes': ['tab'],
        }),
        (_("Клієнт та проєкт"), {
            'fields': ['client_name', 'project_date', 'quantity', 'materials_used'],
            'classes': ['tab'],
        }),
        (_("Медіа"), {
            'fields': ['main_image'],
            'classes': ['tab'],
        }),
        (_("SEO"), {
            'fields': ['meta_title', 'meta_description'],
            'classes': ['tab'],
        }),
        (_("Налаштування"), {
            'fields': ['is_featured', 'is_active'],
            'classes': ['tab'],
        }),
    ]
    
    @display(description=_("Зображення"))
    def project_preview(self, obj):
        if obj.main_image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.main_image.url
            )
        return "Немає зображення"
    
    @display(description=_("Рекомендований"), ordering='is_featured')
    def is_featured_display(self, obj):
        if obj.is_featured:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Рекомендований</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Звичайний</span>'
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

    @display(description=_("Количество изображений"))
    def images_count(self, obj):
        return obj.images.count()  # Предполагается, что существует связь `images` в модели `Project`


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    pass
