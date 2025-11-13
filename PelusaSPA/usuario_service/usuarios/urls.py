from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RegistroView, LoginView, PerfilView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'usuarios', UserViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),
    
    # Autenticación
    path('auth/registro/', RegistroView.as_view(), name='registro'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Perfil
    path('auth/perfil/', PerfilView.as_view(), name='perfil'),
]

