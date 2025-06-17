from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from .utils import TranslationManager
import json

@method_decorator(csrf_exempt, name='dispatch')
class TranslationWebhookView(View):
    """Webhook для оновлення перекладів після змін в Rosetta"""
    
    def post(self, request):
        try:
            # Очищаємо кеш
            TranslationManager.invalidate_translations_cache()
            
            # Експортуємо нові переклади
            output_path = '/path/to/frontend/public/backend-translations'
            TranslationManager.export_to_frontend(output_path)
            
            return JsonResponse({'status': 'success', 'message': 'Переклади оновлено'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)