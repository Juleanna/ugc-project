from rest_framework import viewsets, status, filters,mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .serializers import *
from rest_framework.mixins import CreateModelMixin
from rest_framework.viewsets import GenericViewSet



class HomePageViewSet(viewsets.ReadOnlyModelViewSet):
    """API для главной страницы"""
    queryset = HomePage.objects.filter(is_active=True)
    serializer_class = HomePageSerializer
    
    @method_decorator(cache_page(60 * 15))  # Кеш на 15 минут
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class AboutPageViewSet(viewsets.ReadOnlyModelViewSet):
    """API для страницы О нас"""
    queryset = AboutPage.objects.filter(is_active=True)
    serializer_class = AboutPageSerializer
    
    @method_decorator(cache_page(60 * 30))  # Кеш на 30 минут
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """API для услуг"""
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
        """Получить рекомендуемые услуги"""
        cache_key = 'featured_services'
        featured_services = cache.get(cache_key)
        
        if not featured_services:
            featured_services = self.queryset.filter(is_featured=True)[:6]
            cache.set(cache_key, featured_services, 60 * 30)  # 30 минут
        
        serializer = ServiceListSerializer(featured_services, many=True, context={'request': request})
        return Response(serializer.data)


class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API для категорий проектов"""
    queryset = ProjectCategory.objects.filter(is_active=True).order_by('order')
    serializer_class = ProjectCategorySerializer
    
    @method_decorator(cache_page(60 * 60))  # Кеш на 1 час
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """API для проектов"""
    queryset = Project.objects.filter(is_active=True).order_by('-project_date')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['title', 'client_name', 'materials_used']
    ordering_fields = ['project_date', 'created_at']
    ordering = ['-project_date']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer
    
    def get_queryset(self):
        return super().get_queryset().select_related('category').prefetch_related('images')
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Получить рекомендуемые проекты"""
        cache_key = 'featured_projects'
        featured_projects = cache.get(cache_key)
        
        if not featured_projects:
            featured_projects = self.queryset.filter(is_featured=True)[:6]
            cache.set(cache_key, featured_projects, 60 * 30)  # 30 минут
        
        serializer = ProjectListSerializer(featured_projects, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Получить проекты по категориям"""
        category_slug = request.query_params.get('category')
        if category_slug:
            projects = self.queryset.filter(category__slug=category_slug)
            serializer = ProjectListSerializer(projects, many=True, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'Category parameter required'}, status=400)


class JobPositionViewSet(viewsets.ReadOnlyModelViewSet):
    """API для вакансий"""
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
        """Получить срочные вакансии"""
        urgent_jobs = self.queryset.filter(is_urgent=True)
        serializer = JobPositionListSerializer(urgent_jobs, many=True, context={'request': request})
        return Response(serializer.data)


class JobApplicationViewSet(CreateModelMixin, GenericViewSet):
    """API для подачи заявок на вакансии"""
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Отправка уведомления (если настроено)
        # send_job_application_notification.delay(serializer.instance.id)
        
        return Response(
            {'message': 'Заявка успешно отправлена'}, 
            status=status.HTTP_201_CREATED
        )


class OfficeViewSet(viewsets.ReadOnlyModelViewSet):
    """API для офисов"""
    queryset = Office.objects.filter(is_active=True).order_by('order')
    serializer_class = OfficeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['office_type', 'is_main']
    
    @action(detail=False, methods=['get'])
    def main(self, request):
        """Получить главный офис"""
        main_office = self.queryset.filter(is_main=True).first()
        if main_office:
            serializer = OfficeSerializer(main_office, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'Main office not found'}, status=404)


class ContactInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """API для обращений"""
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Отправка уведомления (если настроено)
        # send_contact_inquiry_notification.delay(serializer.instance.id)

        return Response(
            {'message': 'Обращение успешно отправлено'},
            status=status.HTTP_201_CREATED
        )

class PartnershipInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """API для информации о партнерстве"""
    queryset = PartnershipInfo.objects.filter(is_active=True)
    serializer_class = PartnershipInfoSerializer
    
    @method_decorator(cache_page(60 * 60))  # Кеш на 1 час
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class PartnerInquiryViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """API для запросов партнеров"""
    queryset = PartnerInquiry.objects.all()
    serializer_class = PartnerInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Отправка уведомления (если настроено)
        # send_partner_inquiry_notification.delay(serializer.instance.id)

        return Response(
            {'message': 'Запрос успешно отправлен'}, 
            status=status.HTTP_201_CREATED
        )

class WorkplacePhotoViewSet(viewsets.ReadOnlyModelViewSet):
    """API для фото рабочих мест"""
    queryset = WorkplacePhoto.objects.filter(is_active=True).order_by('order')
    serializer_class = WorkplacePhotoSerializer
    
    @method_decorator(cache_page(60 * 30))  # Кеш на 30 минут
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)