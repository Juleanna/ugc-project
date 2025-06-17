from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .utils import TranslationManager

# Підключаємо сигнали для автоматичного очищення кешу при зміні контенту
@receiver([post_save, post_delete])
def invalidate_translations_cache(sender, **kwargs):
    """Очищає кеш перекладів при зміні моделей з перекладами"""
    
    # Список моделей, зміна яких має призводити до очищення кешу
    translatable_models = [
        'Service', 'Project', 'ProjectCategory', 'JobPosition',
        'HomePage', 'AboutPage', 'TeamMember'
    ]
    
    if sender.__name__ in translatable_models:
        TranslationManager.invalidate_translations_cache()
        print(f"Очищено кеш перекладів через зміну {sender.__name__}")