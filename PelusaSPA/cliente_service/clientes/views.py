from rest_framework import viewsets
from .models import Cliente, Mascota
from .serializers import ClienteSerializer, MascotaSerializer
from rest_framework.permissions import AllowAny

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]

class MascotaViewSet(viewsets.ModelViewSet):
    queryset = Mascota.objects.all()
    serializer_class = MascotaSerializer
    permission_classes = [AllowAny]
