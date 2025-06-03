from django.urls import path
from .admin import project_image_admin

urlpatterns = [
    path('admin/projects/projectimage/', project_image_admin.urls),
]
