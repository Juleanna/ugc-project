from ckeditor_uploader.fields import RichTextUploadingField
from modeltranslation.translator import translator, TranslationOptions
from .models import Office

class YourModelTranslationOptions(TranslationOptions):
    fields = ('your_richtext_field',)  # Укажите поле для перевода

translator.register(Office, YourModelTranslationOptions)
