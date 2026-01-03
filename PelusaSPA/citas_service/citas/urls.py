from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CitaViewSet, HorarioViewSet, MascotaViewSet, ServicioViewSet

router = DefaultRouter()
router.register(r'citas', CitaViewSet, basename='cita')
router.register(r'horarios', HorarioViewSet, basename='horario')
router.register(r'mascotas', MascotaViewSet, basename='mascota')
router.register(r'servicios', ServicioViewSet, basename='servicio')

urlpatterns = [
    path('', include(router.urls)),
]

