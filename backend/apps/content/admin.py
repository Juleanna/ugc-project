from django.contrib import admin
from parler.admin import TranslatableAdmin
from .models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto

# Модель HomePage
@admin.register(HomePage)
class HomePageAdmin(TranslatableAdmin):
    list_display = ['years_experience', 'employees_count', 'projects_completed', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['translations__company_description']

# Модель AboutPage
@admin.register(AboutPage)
class AboutPageAdmin(TranslatableAdmin):
    list_display = ['is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['translations__history_text']

# Модель TeamMember
@admin.register(TeamMember)
class TeamMemberAdmin(TranslatableAdmin):
    list_display = ['name', 'position', 'is_management', 'is_active', 'order']
    list_filter = ['is_management', 'is_active']
    search_fields = ['translations__name', 'translations__position']

# Модель Certificate
@admin.register(Certificate)
class CertificateAdmin(TranslatableAdmin):
    list_display = ['title', 'issued_date', 'issuing_organization', 'is_active']
    list_filter = ['is_active']
    search_fields = ['translations__title', 'issuing_organization']

# Модель ProductionPhoto
@admin.register(ProductionPhoto)
class ProductionPhotoAdmin(TranslatableAdmin):
    list_display = ['title', 'is_featured', 'is_active', 'order']
    list_filter = ['is_featured', 'is_active']
    search_fields = ['translations__title']
