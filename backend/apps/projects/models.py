from django.db import models
from django.utils.translation import gettext_lazy as _
from ckeditor_uploader.fields import RichTextUploadingField

class ProjectCategory(models.Model):
    """Категории проектов"""
    name=models.CharField(max_length=100, verbose_name=_("Назва"))
    description=RichTextUploadingField(blank=True, verbose_name=_("Опис"))
    
    slug = models.SlugField(unique=True, verbose_name=_("Слаг"))
    image = models.ImageField(upload_to='project_categories/', blank=True, verbose_name=_("Зображення"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активна"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Категорія проєктів")
        verbose_name_plural = _("Категорії проєктів")


class Project(models.Model):
    """Проекты/Портфолио"""
    title=models.CharField(max_length=200, verbose_name=_("Назва"))
    short_description=RichTextUploadingField(verbose_name=_("Короткий опис"))
    detailed_description=RichTextUploadingField(verbose_name=_("Детальний опис"))
    challenge=RichTextUploadingField(blank=True, verbose_name=_("Завдання"))
    solution=RichTextUploadingField(blank=True, verbose_name=_("Рішення"))
    result=RichTextUploadingField(blank=True, verbose_name=_("Результат"))
    
    category = models.ForeignKey(ProjectCategory, on_delete=models.CASCADE, related_name='projects', verbose_name=_("Категорія"))
    slug = models.SlugField(unique=True, verbose_name=_("Слаг"))
    client_name = models.CharField(max_length=200, blank=True, verbose_name=_("Клієнт"))
    project_date = models.DateField(verbose_name=_("Дата проєкту"))
    quantity = models.PositiveIntegerField(null=True, blank=True, verbose_name=_("Кількість виробів"))
    materials_used = models.CharField(max_length=500, blank=True, verbose_name=_("Використані матеріали"))
    main_image = models.ImageField(upload_to='projects/', verbose_name=_("Головне зображення"))
    meta_title = models.CharField(max_length=200, blank=True, verbose_name=_("Мета-заголовок"))
    meta_description = models.TextField(blank=True, verbose_name=_("Мета-опис"))
    is_featured = models.BooleanField(default=False, verbose_name=_("Рекомендований"))
    is_active = models.BooleanField(default=True, verbose_name=_("Активний"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Створено"))

    class Meta:
        ordering = ['-project_date']
        verbose_name = _("Проєкт")
        verbose_name_plural = _("Проєкти")


class ProjectImage(models.Model):
    """Изображения проекта"""
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE, verbose_name=_("Проєкт"))
    image = models.ImageField(upload_to='projects/gallery/', verbose_name=_("Зображення"))
    caption = models.CharField(max_length=200, blank=True, verbose_name=_("Підпис"))
    order = models.PositiveIntegerField(default=0, verbose_name=_("Порядок"))

    class Meta:
        ordering = ['order']
        verbose_name = _("Зображення проєкту")
        verbose_name_plural = _("Зображення проєктів")
