from django.db import models
from django.utils.translation import gettext_lazy as _
from ckeditor_uploader.fields import RichTextUploadingField

class JobPosition(models.Model):
    """Вакансии"""
    title=models.CharField(max_length=200, verbose_name=_("Назва вакансії"))
    description=RichTextUploadingField(verbose_name=_("Опис"))
    requirements=RichTextUploadingField(verbose_name=_("Вимоги"))
    responsibilities=RichTextUploadingField(verbose_name=_("Обов'язки"))
    benefits=RichTextUploadingField(blank=True, verbose_name=_("Переваги"))
        
    slug = models.SlugField(unique=True, verbose_name=_("URL"))
    
    employment_type = models.CharField(max_length=50, choices=[
        ('full_time', _("Повна зайнятість")),
        ('part_time', _("Часткова зайнятість")),
        ('contract', _("Контракт")),
    ], default='full_time', verbose_name=_("Тип зайнятості"))
    
    experience_required = models.CharField(max_length=100, blank=True, verbose_name=_("Досвід роботи"))
    salary_from = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Зарплата від"))
    salary_to = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Зарплата до"))
    salary_currency = models.CharField(max_length=10, default='UAH', verbose_name=_("Валюта"))
    location = models.CharField(max_length=200, verbose_name=_("Місце роботи"))
    
    is_active = models.BooleanField(default=True, verbose_name=_("Активна"))
    is_urgent = models.BooleanField(default=False, verbose_name=_("Терміново"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Термін дії"))

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Вакансія")
        verbose_name_plural = _("Вакансії")


class JobApplication(models.Model):
    """Заявки на вакансии"""
    position = models.ForeignKey(JobPosition, on_delete=models.CASCADE, related_name='applications', verbose_name=_("Вакансія"))
    first_name = models.CharField(max_length=100, verbose_name=_("Ім'я"))
    last_name = models.CharField(max_length=100, verbose_name=_("Прізвище"))
    email = models.EmailField(verbose_name=_("Електронна пошта"))
    phone = models.CharField(max_length=20, verbose_name=_("Телефон"))
    cover_letter = models.TextField(blank=True, verbose_name=_("Супровідний лист"))
    resume = models.FileField(upload_to='resumes/', verbose_name=_("Резюме"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))
    is_reviewed = models.BooleanField(default=False, verbose_name=_("Переглянуто"))

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Заявка на вакансію")
        verbose_name_plural = _("Заявки на вакансії")


class WorkplacePhoto(models.Model):
    """Фото с рабочих мест"""
    title=models.CharField(max_length=100, verbose_name=_("Назва"))
    description=models.TextField(blank=True, verbose_name=_("Опис"))
       
    image = models.ImageField(upload_to='workplace/', verbose_name=_("Зображення"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Фото робочого місця")
        verbose_name_plural = _("Фото робочих місць")
