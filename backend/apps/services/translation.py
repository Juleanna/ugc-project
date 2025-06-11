from modeltranslation.translator import translator, TranslationOptions
from .models import Service, ServiceFeature

class ServiceTranslationOptions(TranslationOptions):
    fields = ('name', 'short_description', 'detailed_description', 'benefits')

class ServiceFeatureTranslationOptions(TranslationOptions):
    fields = ('title', 'description')


translator.register(Service, ServiceTranslationOptions)
translator.register(ServiceFeature, ServiceFeatureTranslationOptions)


