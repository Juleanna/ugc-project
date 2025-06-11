from modeltranslation.translator import translator, TranslationOptions
from .models import ProjectCategory, Project, ProjectImage

class ProjectCategoryTranslationOptions(TranslationOptions):
    fields = ('name', 'description')

class ProjectTranslationOptions(TranslationOptions):
    fields = ('title', 'short_description', 'detailed_description', 'challenge', 'solution', 'result')


translator.register(ProjectCategory, ProjectCategoryTranslationOptions)
translator.register(Project, ProjectTranslationOptions)


