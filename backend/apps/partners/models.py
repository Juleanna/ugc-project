from django.db import models
from django.utils.translation import gettext_lazy as _
from ckeditor_uploader.fields import RichTextUploadingField

class PartnershipInfo(models.Model):
    """Информация для партнеров"""
    cooperation_terms=RichTextUploadingField(verbose_name=_("Умови співпраці"))
    work_stages=RichTextUploadingField(verbose_name=_("Етапи роботи"))
    faq_content=RichTextUploadingField(verbose_name=_("FAQ для замовників"))
    benefits=RichTextUploadingField(verbose_name=_("Переваги співпраці"), blank=True)
    
    min_order_amount = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Мін. сума замовлення"))
    production_capacity = models.CharField(max_length=200, blank=True, verbose_name=_("Виробнича потужність"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активна"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Оновлено"))
    work_stages_info = models.TextField()

    class Meta:
        verbose_name = _("Інформація для партнерів")
        verbose_name_plural = _("Інформація для партнерів")


class WorkStage(models.Model):
    """Этапы работы с клиентами"""
    title=models.CharField(max_length=100, verbose_name=_("Назва"))
    description=models.TextField(verbose_name=_("Опис"))
   
    icon = models.CharField(max_length=50, blank=True, verbose_name=_("Іконка"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    duration = models.CharField(max_length=50, blank=True, verbose_name=_("Тривалість"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Етап роботи")
        verbose_name_plural = _("Етапи роботи")


class PartnerInquiry(models.Model):
    """Запросы от партнеров"""
    company_name = models.CharField(max_length=200, verbose_name=_("Назва компанії"))
    contact_person = models.CharField(max_length=100, verbose_name=_("Контактна особа"))
    email = models.EmailField(verbose_name=_("Електронна пошта"))
    phone = models.CharField(max_length=20, verbose_name=_("Телефон"))
    inquiry_type = models.CharField(max_length=50, choices=[
        ('cooperation', _("Співпраця")),
        ('quote', _("Запит на розрахунок")),
        ('samples', _("Зразки продукції")),
        ('other', _("Інше")),
    ], verbose_name=_("Тип запиту"))
    message = models.TextField(verbose_name=_("Повідомлення"))
    project_description = models.TextField(blank=True, verbose_name=_("Опис проєкту"))
    estimated_quantity = models.CharField(max_length=100, blank=True, verbose_name=_("Орієнтовна кількість"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))
    is_processed = models.BooleanField(default=False, verbose_name=_("Оброблено"))

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Запит партнера")
        verbose_name_plural = _("Запити партнерів")
