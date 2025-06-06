# Generated by Django 5.2 on 2025-05-28 12:49

import django.db.models.deletion
import parler.fields
import parler.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ContactInquiry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name="Ім'я")),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('company', models.CharField(blank=True, max_length=200, verbose_name='Компанія')),
                ('inquiry_type', models.CharField(choices=[('general', 'Загальне запитання'), ('cooperation', 'Співпраця'), ('complaint', 'Скарга'), ('suggestion', 'Пропозиція'), ('quote', 'Запит вартості')], max_length=50, verbose_name='Тип запиту')),
                ('subject', models.CharField(max_length=200, verbose_name='Тема')),
                ('message', models.TextField(verbose_name='Повідомлення')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_processed', models.BooleanField(default=False)),
                ('response', models.TextField(blank=True, verbose_name='Відповідь')),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Звернення',
                'verbose_name_plural': 'Звернення',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Office',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('office_type', models.CharField(choices=[('office', 'Офіс'), ('factory', 'Фабрика'), ('warehouse', 'Склад')], max_length=50, verbose_name='Тип')),
                ('phone', models.CharField(blank=True, max_length=100)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('working_hours', models.CharField(blank=True, max_length=200, verbose_name='Години роботи')),
                ('latitude', models.DecimalField(blank=True, decimal_places=8, max_digits=10, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=8, max_digits=11, null=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_main', models.BooleanField(default=False, verbose_name='Головний офіс')),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Офіс/Фабрика',
                'verbose_name_plural': 'Офіси/Фабрики',
                'ordering': ['order'],
            },
            bases=(parler.models.TranslatableModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='OfficeTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_index=True, max_length=15, verbose_name='Language')),
                ('name', models.CharField(max_length=100)),
                ('address', models.TextField()),
                ('description', models.TextField(blank=True)),
                ('master', parler.fields.TranslationsForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='contacts.office')),
            ],
            options={
                'verbose_name': 'Офіс/Фабрика Translation',
                'db_table': 'contacts_office_translation',
                'db_tablespace': '',
                'managed': True,
                'default_permissions': (),
                'unique_together': {('language_code', 'master')},
            },
            bases=(parler.models.TranslatedFieldsModelMixin, models.Model),
        ),
    ]
