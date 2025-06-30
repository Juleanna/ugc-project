# backend/apps/api/urls.py - ВИПРАВЛЕНИЙ БЕЗ КОНФЛІКТІВ
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.api.webhooks import TranslationWebhookView
from . import views

# ============================= ІМПОРТ ТІЛЬКИ НОВИХ VIEW =============================
from .translations_views import UnifiedTranslationsAPIView

# ============================= РОУТЕР =============================
router = DefaultRouter()

# Контент
router.register(r'homepage', views.HomePageViewSet, basename='homepage')
router.register(r'about', views.AboutPageViewSet, basename='about')

# Послуги
router.register(r'services', views.ServiceViewSet, basename='services')

# Проекти
router.register(r'project-categories', views.ProjectCategoryViewSet, basename='projectcategory')
router.register(r'projects', views.ProjectViewSet, basename='projects')

# Вакансії
router.register(r'jobs', views.JobPositionViewSet, basename='jobs')
router.register(r'job-applications', views.JobApplicationViewSet, basename='jobapplications')

# Офіси та контакти
router.register(r'offices', views.OfficeViewSet, basename='offices')
router.register(r'contact-inquiries', views.ContactInquiryViewSet, basename='contactinquiries')

# Партнерство
router.register(r'partnership-info', views.PartnershipInfoViewSet, basename='partnershipinfo')
router.register(r'partner-inquiries', views.PartnerInquiryViewSet, basename='partnerinquiries')

# Фото
router.register(r'workplace-photos', views.WorkplacePhotoViewSet, basename='workplacephotos')

# ============================= URL PATTERNS =============================
urlpatterns = [
    # API роутер
    path('', include(router.urls)),
    
    # =============== ЄДИНИЙ ЕНДПОІНТ ДЛЯ ВСІХ ПЕРЕКЛАДІВ ===============
    # Основний ендпоінт для перекладів
    path('translations/', UnifiedTranslationsAPIView.as_view(), name='translations-default'),
    path('translations/<str:locale>/', UnifiedTranslationsAPIView.as_view(), name='translations-locale'),
    
    # =============== WEBHOOKS ===============
    path('webhooks/translations/', TranslationWebhookView.as_view(), name='translation-webhook'),
]