from modeltranslation.translator import translator, TranslationOptions
from .models import ProjectCategory, Project, ProjectImage

class ProjectCategoryTranslationOptions(TranslationOptions):
    fields = ('name', 'description')

class ProjectTranslationOptions(TranslationOptions):
    fields = ('title', 'short_description', 'detailed_description', 'challenge', 'solution', 'result')

class ProjectImageTranslationOptions(TranslationOptions):
    fields = ('caption')

translator.register(ProjectCategory, ProjectCategoryTranslationOptions)
translator.register(Project, ProjectTranslationOptions)
translator.register(ProjectImage, ProjectImageTranslationOptions)

