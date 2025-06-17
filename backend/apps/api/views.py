# backend/apps/api/views.py
from rest_framework import viewsets, status, filters, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.throttling import AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .serializers import *
from rest_framework.mixins import CreateModelMixin
from rest_framework.viewsets import GenericViewSet

# Rate throttle для перекладів
class TranslationsRateThrottle(AnonRateThrottle):
    """Спеціальний throttle для API перекладів"""
    scope = 'translations'
    rate = '30/min'  # 30 запитів за хвилину


class HomePageViewSet(viewsets.ReadOnlyModelViewSet):
    """API для головної сторінки"""
    queryset = HomePage.objects.filter(is_active=True)
    serializer_class = HomePageSerializer
    
    @method_decorator(cache_page(60 * 15))  # Кеш на 15 хвилин
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class AboutPageViewSet(viewsets.ReadOnlyModelViewSet):
    """API для сторінки Про нас"""
    queryset = AboutPage.objects.filter(is_active=True)
    serializer_class = AboutPageSerializer
    
    @method_decorator(cache_page(60 * 30))  # Кеш на 30 хвилин
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """API для послуг"""
    queryset = Service.objects.filter(is_active=True).order_by('order')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_featured']
    search_fields = ['name', 'short_description']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ServiceDetailSerializer
        return ServiceListSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Отримати рекомендовані послуги"""
        cache_key = 'featured_services'
        featured_services = cache.get(cache_key)
        
        if not featured_services:
            featured_services = self.queryset.filter(is_featured=True)[:6]
            cache.set(cache_key, featured_services, 60 * 30)  # 30 хвилин
        
        serializer = ServiceListSerializer(featured_services, many=True, context={'request': request})
        return Response(serializer.data)


class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API для категорій проектів"""
    queryset = ProjectCategory.objects.filter(is_active=True).order_by('order')
    serializer_class = ProjectCategorySerializer
    
    @method_decorator(cache_page(60 * 60))  # Кеш на 1 годину
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """API для проектів"""
    queryset = Project.objects.filter(is_active=True).order_by('-created_at')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['title', 'short_description']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Отримати рекомендовані проекти"""
        featured_projects = self.queryset.filter(is_featured=True)[:6]
        serializer = ProjectListSerializer(featured_projects, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Отримати проекти за категорією"""
        category_slug = request.GET.get('category')
        if not category_slug:
            return Response({'error': 'Category parameter required'}, status=400)
        
        try:
            category = ProjectCategory.objects.get(slug=category_slug, is_active=True)
            projects = self.queryset.filter(category=category)
            serializer = ProjectListSerializer(projects, many=True, context={'request': request})
            return Response(serializer.data)
        except ProjectCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=404)


class JobPositionViewSet(viewsets.ReadOnlyModelViewSet):
    """API для вакансій"""
    queryset = JobPosition.objects.filter(is_active=True).order_by('-created_at')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employment_type', 'is_urgent', 'location']
    search_fields = ['title', 'location']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobPositionDetailSerializer
        return JobPositionListSerializer
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Отримати термінові вакансії"""
        urgent_jobs = self.queryset.filter(is_urgent=True)
        serializer = JobPositionListSerializer(urgent_jobs, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Отримати активні вакансії"""
        active_jobs = self.queryset.filter(expires_at__isnull=True)
        serializer = JobPositionListSerializer(active_jobs, many=True, context={'request': request})
        return Response(serializer.data)


class JobApplicationViewSet(CreateModelMixin, GenericViewSet):
    """API для подачі заявок на вакансії"""
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Відправка повідомлення (якщо налаштовано)
        # send_job_application_notification.delay(serializer.instance.id)
        
        return Response(
            {'message': 'Заявка успішно відправлена'}, 
            status=status.HTTP_201_CREATED
        )


class OfficeViewSet(viewsets.ReadOnlyModelViewSet):
    """API для офісів"""
    queryset = Office.objects.filter(is_active=True).order_by('order')
    serializer_class = OfficeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['office_type', 'is_main']
    
    @action(detail=False, methods=['get'])
    def main(self, request):
        """Отримати головний офіс"""
        main_office = self.queryset.filter(is_main=True).first()
        if main_office:
            serializer = OfficeSerializer(main_office, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'Main office not found'}, status=404)


class ContactInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """API для звернень"""
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Відправка повідомлення (якщо налаштовано)
        # send_contact_inquiry_notification.delay(serializer.instance.id)

        return Response(
            {'message': 'Звернення успішно відправлено'},
            status=status.HTTP_201_CREATED
        )


class PartnershipInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """API для інформації про партнерство"""
    queryset = PartnershipInfo.objects.filter(is_active=True)
    serializer_class = PartnershipInfoSerializer
    
    @method_decorator(cache_page(60 * 60))  # Кеш на 1 годину
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class PartnerInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """API для запитів партнерів"""
    queryset = PartnerInquiry.objects.all()
    serializer_class = PartnerInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Відправка повідомлення (якщо налаштовано)
        # send_partner_inquiry_notification.delay(serializer.instance.id)

        return Response(
            {'message': 'Запит успішно відправлений'}, 
            status=status.HTTP_201_CREATED
        )


class WorkplacePhotoViewSet(viewsets.ReadOnlyModelViewSet):
    """API для фото робочих місць"""
    queryset = WorkplacePhoto.objects.filter(is_active=True).order_by('order')
    serializer_class = WorkplacePhotoSerializer
    
    @method_decorator(cache_page(60 * 30))  # Кеш на 30 хвилин
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)