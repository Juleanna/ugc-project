# backend/apps/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.api.webhooks import TranslationWebhookView
from . import views

# Імпортуємо views для перекладів (створіть цей файл)
from .translations_views import (
    TranslationsAPIView, 
    DynamicTranslationsAPIView, 
    StaticTranslationsAPIView
)

router = DefaultRouter()
router.register(r'homepage', views.HomePageViewSet)
router.register(r'about', views.AboutPageViewSet)
router.register(r'services', views.ServiceViewSet)
router.register(r'project-categories', views.ProjectCategoryViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'jobs', views.JobPositionViewSet)
router.register(r'job-applications', views.JobApplicationViewSet)
router.register(r'offices', views.OfficeViewSet)
router.register(r'contact-inquiries', views.ContactInquiryViewSet)
router.register(r'partnership-info', views.PartnershipInfoViewSet)
router.register(r'partner-inquiries', views.PartnerInquiryViewSet)
router.register(r'workplace-photos', views.WorkplacePhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # ==================== НОВІ ЕНДПОІНТИ ДЛЯ ПЕРЕКЛАДІВ ====================
    
    # Статичні переклади (JSON файли)
    path('translations/', StaticTranslationsAPIView.as_view(), name='static-translations'),
    path('translations/<str:locale>/', StaticTranslationsAPIView.as_view(), name='static-translations-locale'),
    
    # Переклади з .po файлів Django
    path('po-translations/', TranslationsAPIView.as_view(), name='po-translations'),
    path('po-translations/<str:locale>/', TranslationsAPIView.as_view(), name='po-translations-locale'),
    
    # Динамічні переклади з моделей
    path('dynamic-translations/', DynamicTranslationsAPIView.as_view(), name='dynamic-translations'),
    path('dynamic-translations/<str:locale>/', DynamicTranslationsAPIView.as_view(), name='dynamic-translations-locale'),
    path('webhooks/translations/', TranslationWebhookView.as_view(), name='translation-webhook'),
]