from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, MascotaViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'mascotas', MascotaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
