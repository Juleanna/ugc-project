from django.contrib import admin
from parler.admin import TranslatableAdmin
from .models import JobPosition, JobApplication, WorkplacePhoto

# Модель JobPosition
@admin.register(JobPosition)
class JobPositionAdmin(TranslatableAdmin):
    list_display = ['title', 'employment_type', 'location', 'is_active', 'is_urgent', 'created_at']
    list_filter = ['employment_type', 'is_active', 'is_urgent']
    search_fields = ['translations__title', 'translations__description']


# Модель JobApplication
@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['position', 'first_name', 'last_name', 'email', 'phone', 'is_reviewed', 'created_at']
    list_filter = ['is_reviewed']
    search_fields = ['first_name', 'last_name', 'email']


# Модель WorkplacePhoto
@admin.register(WorkplacePhoto)
class WorkplacePhotoAdmin(TranslatableAdmin):
    list_display = ['title', 'is_active', 'order']
    list_filter = ['is_active']
    search_fields = ['translations__title']
