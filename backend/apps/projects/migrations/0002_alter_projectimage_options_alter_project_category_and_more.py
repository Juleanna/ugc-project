# Generated by Django 5.2 on 2025-05-30 07:36

import ckeditor.fields
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='projectimage',
            options={'ordering': ['order'], 'verbose_name': 'Зображення проєкту', 'verbose_name_plural': 'Зображення проєктів'},
        ),
        migrations.AlterField(
            model_name='project',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='projects', to='projects.projectcategory', verbose_name='Категорія'),
        ),
        migrations.AlterField(
            model_name='project',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, verbose_name='Створено'),
        ),
        migrations.AlterField(
            model_name='project',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='Активний'),
        ),
        migrations.AlterField(
            model_name='project',
            name='main_image',
            field=models.ImageField(upload_to='projects/', verbose_name='Головне зображення'),
        ),
        migrations.AlterField(
            model_name='project',
            name='meta_description',
            field=models.TextField(blank=True, verbose_name='Мета-опис'),
        ),
        migrations.AlterField(
            model_name='project',
            name='meta_title',
            field=models.CharField(blank=True, max_length=200, verbose_name='Мета-заголовок'),
        ),
        migrations.AlterField(
            model_name='project',
            name='slug',
            field=models.SlugField(unique=True, verbose_name='Слаг'),
        ),
        migrations.AlterField(
            model_name='projectcategory',
            name='image',
            field=models.ImageField(blank=True, upload_to='project_categories/', verbose_name='Зображення'),
        ),
        migrations.AlterField(
            model_name='projectcategory',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='Активна'),
        ),
        migrations.AlterField(
            model_name='projectcategory',
            name='order',
            field=models.PositiveIntegerField(default=0, verbose_name='Порядок'),
        ),
        migrations.AlterField(
            model_name='projectcategory',
            name='slug',
            field=models.SlugField(unique=True, verbose_name='Слаг'),
        ),
        migrations.AlterField(
            model_name='projectcategorytranslation',
            name='description',
            field=models.TextField(blank=True, verbose_name='Опис'),
        ),
        migrations.AlterField(
            model_name='projectcategorytranslation',
            name='name',
            field=models.CharField(max_length=100, verbose_name='Назва'),
        ),
        migrations.AlterField(
            model_name='projectimage',
            name='caption',
            field=models.CharField(blank=True, max_length=200, verbose_name='Підпис'),
        ),
        migrations.AlterField(
            model_name='projectimage',
            name='image',
            field=models.ImageField(upload_to='projects/gallery/', verbose_name='Зображення'),
        ),
        migrations.AlterField(
            model_name='projectimage',
            name='order',
            field=models.PositiveIntegerField(default=0, verbose_name='Порядок'),
        ),
        migrations.AlterField(
            model_name='projectimage',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='projects.project', verbose_name='Проєкт'),
        ),
        migrations.AlterField(
            model_name='projecttranslation',
            name='detailed_description',
            field=ckeditor.fields.RichTextField(verbose_name='Детальний опис'),
        ),
        migrations.AlterField(
            model_name='projecttranslation',
            name='short_description',
            field=models.TextField(verbose_name='Короткий опис'),
        ),
        migrations.AlterField(
            model_name='projecttranslation',
            name='title',
            field=models.CharField(max_length=200, verbose_name='Назва'),
        ),
    ]
