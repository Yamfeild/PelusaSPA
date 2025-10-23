from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeluqueroViewSet

router = DefaultRouter()
router.register(r'peluqueros', PeluqueroViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
