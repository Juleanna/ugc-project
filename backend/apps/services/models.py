from django.db import models
from parler.models import TranslatableModel, TranslatedFields
from ckeditor_uploader.fields import RichTextUploadingField
from django.utils.translation import gettext_lazy as _

class Service(TranslatableModel):
    """Услуги компании"""
    name=models.CharField(max_length=200, verbose_name=_("Назва"))
    short_description=RichTextUploadingField(verbose_name=_("Короткий опис"))
    detailed_description=RichTextUploadingField(verbose_name=_("Детальний опис"))
    benefits=RichTextUploadingField(blank=True, verbose_name=_("Переваги"))
    
    slug = models.SlugField(unique=True, verbose_name=_("Слаг"))
    icon = models.ImageField(upload_to='services/icons/', blank=True, verbose_name=_("Іконка"))
    main_image = models.ImageField(upload_to='services/', verbose_name=_("Головне зображення"))
    min_order_quantity = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Мін. партія"))
    production_time = models.CharField(max_length=100, blank=True, verbose_name=_("Термін виробництва"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_featured = models.BooleanField(default=False, verbose_name=_("Рекомендована"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активна"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Послуга")
        verbose_name_plural = _("Послуги")


class ServiceFeature(TranslatableModel):
    """Особенности услуги"""
    service = models.ForeignKey(Service, related_name='features', on_delete=models.CASCADE, verbose_name=_("Послуга"))
    title=models.CharField(max_length=100, verbose_name=_("Назва"))
    description=RichTextUploadingField(verbose_name=_("Опис"))
      
    icon = models.CharField(max_length=50, blank=True, help_text=_("CSS клас для іконки"), verbose_name=_("Іконка"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Особливість послуги")
        verbose_name_plural = _("Особливості послуг")
