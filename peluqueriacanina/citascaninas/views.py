from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Dueno, Peluquero, Mascota, Tarifa, Cita
from django.contrib.auth.models import User
from .serializers import UserSerializer
from .serializers import DuenoSerializer, PeluqueroSerializer, MascotaSerializer, TarifaSerializer, CitaSerializer

class DuenoViewSet(viewsets.ModelViewSet):
    queryset = Dueno.objects.all()
    serializer_class = DuenoSerializer

class PeluqueroViewSet(viewsets.ModelViewSet):
    queryset = Peluquero.objects.all()
    serializer_class = PeluqueroSerializer

class MascotaViewSet(viewsets.ModelViewSet):
    queryset = Mascota.objects.all()
    serializer_class = MascotaSerializer

class TarifaViewSet(viewsets.ModelViewSet):
    queryset = Tarifa.objects.all()
    serializer_class = TarifaSerializer

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
