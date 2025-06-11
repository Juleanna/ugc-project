from django.contrib import admin
from modeltranslation.admin import TabbedTranslationAdmin
from unfold.admin import ModelAdmin
from unfold.contrib.forms.widgets import WysiwygWidget
from django.db import models
from ckeditor_uploader.widgets import CKEditorUploadingWidget

class UnfoldTabbedTranslationAdmin(TabbedTranslationAdmin, ModelAdmin):
    """
    Базовий клас для адмін панелі з табами для перекладів
    """
    class Media:
        css = {
            'all': (
                'modeltranslation/css/tabbed_translation_fields.css',
            ),
        }
        js = (
            'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
            'modeltranslation/js/tabbed_translation_fields.js',
        )
    
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        """Переконуємося, що CKEditor працює з табами"""
        if db_field.name in self.get_translation_fields():
            # Якщо це RichTextUploadingField
            if hasattr(db_field, 'formfield'):
                kwargs['widget'] = CKEditorUploadingWidget()
        
        return super().formfield_for_dbfield(db_field, request, **kwargs)
    
    def get_translation_fields(self):
        """Отримуємо список полів для перекладу"""
        from modeltranslation.translator import translator
        opts = self.model._meta
        if opts in translator._registry:
            return translator._registry[opts].fields
        return []