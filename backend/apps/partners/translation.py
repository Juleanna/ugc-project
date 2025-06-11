from modeltranslation.translator import translator, TranslationOptions
from .models import PartnershipInfo, WorkStage, PartnerInquiry

class PartnershipInfoTranslationOptions(TranslationOptions):
    fields = ('cooperation_terms', 'work_stages', 'faq_content', 'benefits')

class WorkStageTranslationOptions(TranslationOptions):
    fields = ('title', 'description')

translator.register(PartnershipInfo, PartnershipInfoTranslationOptions)
translator.register(WorkStage, WorkStageTranslationOptions)

