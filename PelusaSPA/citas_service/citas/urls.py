from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CitaViewSet, TarifaViewSet

router = DefaultRouter()
router.register(r'citas', CitaViewSet)
router.register(r'tarifas', TarifaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
