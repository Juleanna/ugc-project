from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

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
]