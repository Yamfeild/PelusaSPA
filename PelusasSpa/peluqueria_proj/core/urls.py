from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    ClienteRegisterView, ClienteViewSet, PeluqueroViewSet,
    MascotaViewSet, TarifaViewSet, CitaViewSet, CitaUpdateView
)

router = DefaultRouter()
router.register('clientes', ClienteViewSet) 
router.register('peluqueros', PeluqueroViewSet)
router.register('mascotas', MascotaViewSet)
router.register('tarifas', TarifaViewSet)
router.register('citas', CitaViewSet)

urlpatterns = [
    # Registro de cliente (no requiere token)
    path('register/', ClienteRegisterView.as_view(), name='cliente-register'),

    # Actualización de citas por peluquero
    path('cita/update/<int:pk>/', CitaUpdateView.as_view(), name='cita-update'),

    # JWT Authentication
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # obtiene access + refresh
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # refresca token


    # Resto de endpoints CRUD
    path('', include(router.urls)),
]
