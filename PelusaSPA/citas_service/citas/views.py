from rest_framework import viewsets
from .models import Cita, Tarifa
from .serializers import CitaSerializer, TarifaSerializer
from rest_framework.permissions import AllowAny

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [AllowAny]


class TarifaViewSet(viewsets.ModelViewSet):
    queryset = Tarifa.objects.all()
    serializer_class = TarifaSerializer
    permission_classes = [AllowAny]
