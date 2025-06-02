from django.contrib import admin
from parler.admin import TranslatableAdmin
from .models import ProjectCategory, Project, ProjectImage

# Модель ProjectCategory
@admin.register(ProjectCategory)
class ProjectCategoryAdmin(TranslatableAdmin):
    list_display = ['name', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['translations__name', 'translations__description']


# Модель Project
@admin.register(Project)
class ProjectAdmin(TranslatableAdmin):
    list_display = ['title', 'category', 'project_date', 'is_featured', 'is_active']
    list_filter = ['is_featured', 'is_active', 'category']
    search_fields = ['translations__title', 'translations__short_description', 'translations__detailed_description']
    autocomplete_fields = ['category']


# Модель ProjectImage
@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ['project', 'order', 'caption']
    list_filter = ['project']
    search_fields = ['caption']
