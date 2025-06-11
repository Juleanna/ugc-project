from modeltranslation.translator import translator, TranslationOptions
from .models import JobPosition, JobApplication, WorkplacePhoto

class JobPositionTranslationOptions(TranslationOptions):
    fields = ('title', 'description', 'requirements', 'responsibilities', 'benefits', 'experience_required', 'location')

class WorkplacePhotoTranslationOptions(TranslationOptions):
    fields = ('title', 'description')

translator.register(JobPosition, JobPositionTranslationOptions)
translator.register(WorkplacePhoto, WorkplacePhotoTranslationOptions)
