from django.db import models
from django.utils.translation import gettext_lazy as _
from ckeditor_uploader.fields import RichTextUploadingField

class HomePage(models.Model):
    """Контент главной страницы"""
    company_description=RichTextUploadingField(verbose_name=_("Короткий опис компанії"))
    mission_text=models.TextField(verbose_name=_("Місія"), blank=True)
    values_text=models.TextField(verbose_name=_("Цінності"), blank=True)
    
    hero_video = models.FileField(upload_to='videos/', blank=True, null=True)
    hero_image = models.ImageField(upload_to='hero/', blank=True, null=True)
    years_experience = models.PositiveIntegerField(default=0, verbose_name=_("Років досвіду"))
    employees_count = models.PositiveIntegerField(default=0, verbose_name=_("Кількість співробітників"))
    projects_completed = models.PositiveIntegerField(default=0, verbose_name=_("Виконано проєктів"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активна"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Оновлено"))

    class Meta:
        verbose_name = _("Головна сторінка")
        verbose_name_plural = _("Головна сторінка")


class AboutPage(models.Model):
    """Страница О нас"""
    history_text=RichTextUploadingField(verbose_name=_("Історія компанії"))
    mission_text=RichTextUploadingField(verbose_name=_("Місія"))
    values_text=RichTextUploadingField(verbose_name=_("Цінності"))
    social_responsibility=RichTextUploadingField(verbose_name=_("Соціальна відповідальність"), blank=True)
    
    is_active = models.BooleanField(default=True, verbose_name=_("Активна"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Оновлено"))

    class Meta:
        verbose_name = _("Сторінка 'Про нас'")
        verbose_name_plural = _("Сторінка 'Про нас'")


class TeamMember(models.Model):
    """Команда/Руководство"""
    name=models.CharField(max_length=100, verbose_name=_("Ім'я"))
    position=models.CharField(max_length=100, verbose_name=_("Посада"))
    bio=RichTextUploadingField(blank=True, verbose_name=_("Біографія"))
    
    photo = models.ImageField(upload_to='team/', verbose_name=_("Фото"))
    email = models.EmailField(blank=True, verbose_name=_("Електронна пошта"))
    linkedin = models.URLField(blank=True, verbose_name=_("LinkedIn"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_management = models.BooleanField(default=False, verbose_name=_("Керівництво"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Член команди")
        verbose_name_plural = _("Команда")


class Certificate(models.Model):
    """Сертификаты и награды"""
    title=models.CharField(max_length=200, verbose_name=_("Назва"))
    description=models.TextField(blank=True, verbose_name=_("Опис"))
    
    image = models.ImageField(upload_to='certificates/', verbose_name=_("Зображення"))
    issued_date = models.DateField(verbose_name=_("Дата видачі"))
    issuing_organization = models.CharField(max_length=200, blank=True, verbose_name=_("Організація"))
    certificate_url = models.URLField(blank=True, verbose_name=_("Посилання"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))

    class Meta:
        ordering = ['-issued_date']
        verbose_name = _("Сертифікат")
        verbose_name_plural = _("Сертифікати")


class ProductionPhoto(models.Model):
    """Фото с производства"""
    title=models.CharField(max_length=100, verbose_name=_("Назва"))
    description=models.TextField(blank=True, verbose_name=_("Опис"))
    
    image = models.ImageField(upload_to='production/', verbose_name=_("Зображення"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_featured = models.BooleanField(default=False, verbose_name=_("Рекомендоване"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Фото виробництва")
        verbose_name_plural = _("Фото виробництва")
