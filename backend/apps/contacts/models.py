from django.db import models
from django.utils.translation import gettext_lazy as _
from ckeditor_uploader.fields import RichTextUploadingField

class Office(models.Model):
    """Офіси та фабрики"""
    name=models.CharField(max_length=100, verbose_name=_("Назва"))
    address=RichTextUploadingField(verbose_name=_("Адреса"))
    description=RichTextUploadingField(blank=True, verbose_name=_("Опис"))
    
    office_type = models.CharField(
        max_length=50,
        choices=[
            ('office', _('Офіс')),
            ('factory', _('Фабрика')),
            ('warehouse', _('Склад')),
        ],
        verbose_name=_("Тип")
    )
    
    phone = models.CharField(max_length=100, blank=True, verbose_name=_("Телефон"))
    email = models.EmailField(blank=True, verbose_name=_("Електронна пошта"))
    working_hours = models.CharField(max_length=200, blank=True, verbose_name=_("Години роботи"))
    
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name=_("Широта"))
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True, verbose_name=_("Довгота"))
    
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_main = models.BooleanField(default=False, verbose_name=_("Головний офіс"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Офіс/Фабрика")
        verbose_name_plural = _("Офіси/Фабрики")


class ContactInquiry(models.Model):
    """Звернення через форму зворотного зв'язку"""
    INQUIRY_TYPES = [
        ('general', _('Загальне запитання')),
        ('cooperation', _('Співпраця')),
        ('complaint', _('Скарга')),
        ('suggestion', _('Пропозиція')),
        ('quote', _('Запит вартості')),
    ]
    
    name = models.CharField(max_length=100, verbose_name=_("Ім'я"))
    email = models.EmailField(verbose_name=_("Електронна пошта"))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_("Телефон"))
    company = models.CharField(max_length=200, blank=True, verbose_name=_("Компанія"))
    
    inquiry_type = models.CharField(max_length=50, choices=INQUIRY_TYPES, verbose_name=_("Тип запиту"))
    subject = models.CharField(max_length=200, verbose_name=_("Тема"))
    message = RichTextUploadingField(verbose_name=_("Повідомлення"))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Дата створення"))
    is_processed = models.BooleanField(default=False, verbose_name=_("Оброблено"))
    response = RichTextUploadingField(blank=True, verbose_name=_("Відповідь"))
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Дата обробки"))

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Звернення")
        verbose_name_plural = _("Звернення")
