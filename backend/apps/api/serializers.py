from rest_framework import serializers
from apps.content.models import HomePage, AboutPage, TeamMember, Certificate, ProductionPhoto
from apps.services.models import Service, ServiceFeature
from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.jobs.models import JobPosition, JobApplication, WorkplacePhoto
from apps.partners.models import PartnershipInfo, WorkStage, PartnerInquiry
from apps.contacts.models import Office, ContactInquiry


class HomePageSerializer(serializers.ModelSerializer):
    """Сериализатор для главной страницы"""
    
    class Meta:
        model = HomePage
        fields = [
            'company_description',
            'mission_text', 
            'values_text',
            'hero_video',
            'hero_image',
            'years_experience',
            'employees_count',
            'projects_completed'
        ]


class TeamMemberSerializer(serializers.ModelSerializer):
    """Сериализатор для команды"""
    
    class Meta:
        model = TeamMember
        fields = [
            'id',
            'name',
            'position', 
            'bio',
            'photo',
            'email',
            'linkedin',
            'is_management',
            'order'
        ]


class CertificateSerializer(serializers.ModelSerializer):
    """Сериализатор для сертификатов"""
    
    class Meta:
        model = Certificate
        fields = [
            'id',
            'title',
            'description',
            'image',
            'issued_date',
            'issuing_organization',
            'certificate_url'
        ]


class ProductionPhotoSerializer(serializers.ModelSerializer):
    """Сериализатор для фото производства"""
    
    class Meta:
        model = ProductionPhoto
        fields = [
            'id',
            'title',
            'description', 
            'image',
            'is_featured',
            'order'
        ]


class AboutPageSerializer(serializers.ModelSerializer):
    """Сериализатор для страницы О нас"""
    team_members = TeamMemberSerializer(many=True, read_only=True, source='teammember_set')
    certificates = CertificateSerializer(many=True, read_only=True, source='certificate_set')
    production_photos = ProductionPhotoSerializer(many=True, read_only=True, source='productionphoto_set')
    
    class Meta:
        model = AboutPage
        fields = [
            'history_text',
            'mission_text',
            'values_text', 
            'social_responsibility',
            'team_members',
            'certificates',
            'production_photos'
        ]


class ServiceFeatureSerializer(serializers.ModelSerializer):
    """Сериализатор для особенностей услуг"""
    
    class Meta:
        model = ServiceFeature
        fields = [
            'id',
            'title',
            'description',
            'icon',
            'order'
        ]


class ServiceListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка услуг"""
    
    class Meta:
        model = Service
        fields = [
            'id',
            'name',
            'short_description',
            'slug',
            'icon',
            'main_image',
            'is_featured',
            'order'
        ]


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор для услуг"""
    features = ServiceFeatureSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id',
            'name',
            'short_description',
            'detailed_description',
            'benefits',
            'slug',
            'icon',
            'main_image',
            'min_order_quantity',
            'production_time',
            'is_featured',
            'features'
        ]


class ProjectCategorySerializer(serializers.ModelSerializer):
    """Сериализатор для категорий проектов"""
    projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectCategory
        fields = [
            'id',
            'name',
            'description',
            'slug',
            'image',
            'order',
            'projects_count'
        ]
    
    def get_projects_count(self, obj):
        return obj.projects.filter(is_active=True).count()


class ProjectImageSerializer(serializers.ModelSerializer):
    """Сериализатор для изображений проектов"""
    
    class Meta:
        model = ProjectImage
        fields = [
            'id',
            'image',
            'caption',
            'order'
        ]


class ProjectListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка проектов"""
    category = ProjectCategorySerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'short_description',
            'slug',
            'category',
            'client_name',
            'project_date',
            'main_image',
            'is_featured'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор для проектов"""
    category = ProjectCategorySerializer(read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'short_description',
            'detailed_description',
            'challenge',
            'solution',
            'result',
            'slug',
            'category',
            'client_name',
            'project_date',
            'quantity',
            'materials_used',
            'main_image',
            'meta_title',
            'meta_description',
            'is_featured',
            'images'
        ]


class JobPositionListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка вакансий"""
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosition
        fields = [
            'id',
            'title',
            'employment_type',
            'location',
            'salary_from',
            'salary_to',
            'salary_currency',
            'is_urgent',
            'created_at',
            'expires_at',
            'applications_count'
        ]
    
    def get_applications_count(self, obj):
        return obj.applications.count()


class JobPositionDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор для вакансий"""
    
    class Meta:
        model = JobPosition
        fields = [
            'id',
            'title',
            'description',
            'requirements',
            'responsibilities',
            'benefits',
            'slug',
            'employment_type',
            'experience_required',
            'salary_from',
            'salary_to',
            'salary_currency',
            'location',
            'is_urgent',
            'created_at',
            'expires_at'
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    """Сериализатор для заявок на вакансии"""
    
    class Meta:
        model = JobApplication
        fields = [
            'position',
            'first_name',
            'last_name',
            'email',
            'phone',
            'cover_letter',
            'resume'
        ]
    
    def create(self, validated_data):
        return JobApplication.objects.create(**validated_data)


class WorkplacePhotoSerializer(serializers.ModelSerializer):
    """Сериализатор для фото рабочих мест"""
    
    class Meta:
        model = WorkplacePhoto
        fields = [
            'id',
            'title',
            'description',
            'image',
            'order'
        ]


class OfficeSerializer(serializers.ModelSerializer):
    """Сериализатор для офисов"""
    
    class Meta:
        model = Office
        fields = [
            'id',
            'name',
            'address',
            'description',
            'office_type',
            'phone',
            'email',
            'working_hours',
            'latitude',
            'longitude',
            'is_main'
        ]


class ContactInquirySerializer(serializers.ModelSerializer):
    """Сериализатор для обращений"""
    
    class Meta:
        model = ContactInquiry
        fields = [
            'name',
            'email',
            'phone',
            'company',
            'inquiry_type',
            'subject',
            'message'
        ]
    
    def create(self, validated_data):
        return ContactInquiry.objects.create(**validated_data)


class WorkStageSerializer(serializers.ModelSerializer):
    """Сериализатор для этапов работы"""
    
    class Meta:
        model = WorkStage
        fields = [
            'id',
            'title',
            'description',
            'icon',
            'duration',
            'order'
        ]


class PartnershipInfoSerializer(serializers.ModelSerializer):
    """Сериализатор для информации о партнерстве"""
    work_stages = WorkStageSerializer(many=True, read_only=True, source='workstage_set')
    
    class Meta:
        model = PartnershipInfo
        fields = [
            'cooperation_terms',
            'work_stages_info',
            'faq_content',
            'benefits',
            'min_order_amount',
            'production_capacity',
            'work_stages'
        ]


class PartnerInquirySerializer(serializers.ModelSerializer):
    """Сериализатор для запросов партнеров"""
    
    class Meta:
        model = PartnerInquiry
        fields = [
            'company_name',
            'contact_person',
            'email',
            'phone',
            'inquiry_type',
            'message',
            'project_description',
            'estimated_quantity'
        ]
    
    def create(self, validated_data):
        return PartnerInquiry.objects.create(**validated_data)


class TranslationSerializer(serializers.Serializer):
    locale = serializers.CharField(max_length=5)
    translations = serializers.DictField()
    count = serializers.IntegerField()
    source = serializers.CharField(required=False)
    last_updated = serializers.DateTimeField(required=False)
