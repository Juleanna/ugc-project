from django.contrib import admin
from parler.admin import TranslatableAdmin
from .models import PartnershipInfo, WorkStage, PartnerInquiry

# Модель PartnershipInfo
@admin.register(PartnershipInfo)
class PartnershipInfoAdmin(TranslatableAdmin):
    list_display = ['min_order_amount', 'production_capacity', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['translations__cooperation_terms', 'translations__faq_content']


# Модель WorkStage
@admin.register(WorkStage)
class WorkStageAdmin(TranslatableAdmin):
    list_display = ['title', 'order', 'duration']
    list_filter = ['order']
    search_fields = ['translations__title', 'translations__description']


# Модель PartnerInquiry
@admin.register(PartnerInquiry)
class PartnerInquiryAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'contact_person', 'email', 'phone', 'inquiry_type', 'is_processed', 'created_at']
    list_filter = ['inquiry_type', 'is_processed']
    search_fields = ['company_name', 'contact_person', 'email', 'message']
