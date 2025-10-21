from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from .models import Cliente, Peluquero, Mascota, Tarifa, Cita
from .serializers import (
    ClienteRegisterSerializer, ClienteSerializer, PeluqueroRegisterSerializer, PeluqueroSerializer,
    MascotaSerializer, TarifaSerializer, CitaSerializer
)
from .permissions import IsPeluquero

# -----------------------------
# Registro público de clientes
# -----------------------------
class ClienteRegisterView(CreateAPIView):
    serializer_class = ClienteRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "message": "Cliente registrado correctamente",
            "cliente": response.data
        }
        return response


# -----------------------------
# Clientes protegidos
# -----------------------------
class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    queryset = Cliente.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='peluqueros').exists():
            return Cliente.objects.all()
        return Cliente.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "message": "Cliente creado correctamente",
            "cliente": response.data
        }
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data = {
            "message": "Cliente actualizado correctamente",
            "cliente": response.data
        }
        return response


# -----------------------------
# Peluqueros (solo admin)
# -----------------------------
class PeluqueroViewSet(viewsets.ModelViewSet):
    serializer_class = PeluqueroRegisterSerializer
    permission_classes = [IsAdminUser]
    queryset = Peluquero.objects.all()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "message": "Peluquero creado correctamente",
            "peluquero": response.data
        }
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data = {
            "message": "Peluquero actualizado correctamente",
            "peluquero": response.data
        }
        return response


# -----------------------------
# Mascotas
# -----------------------------
class MascotaViewSet(viewsets.ModelViewSet):
    serializer_class = MascotaSerializer
    permission_classes = [IsAuthenticated]
    queryset = Mascota.objects.all()

    def get_queryset(self):
        user = self.request.user

        # Peluqueros ven todas las mascotas
        if user.groups.filter(name='peluqueros').exists():
            return Mascota.objects.all()

        # Clientes solo ven sus propias mascotas
        queryset = Mascota.objects.filter(cliente__user=user)
        if not queryset.exists():
            # No hay mascotas visibles para este cliente
            raise PermissionDenied("No puedes ver mascotas que no son tuyas.")
        return queryset

    def perform_create(self, serializer):
        cliente = Cliente.objects.get(user=self.request.user)
        serializer.save(cliente=cliente)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "message": "Mascota registrada correctamente",
            "mascota": response.data
        }
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data = {
            "message": "Mascota actualizada correctamente",
            "mascota": response.data
        }
        return response


# -----------------------------
# Tarifas
# -----------------------------
class TarifaViewSet(viewsets.ModelViewSet):
    serializer_class = TarifaSerializer
    permission_classes = [IsAuthenticated]
    queryset = Tarifa.objects.all()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "message": "Tarifa creada correctamente",
            "tarifa": response.data
        }
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data = {
            "message": "Tarifa actualizada correctamente",
            "tarifa": response.data
        }
        return response


# -----------------------------
# Citas
# -----------------------------
class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]
    queryset = Cita.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='peluqueros').exists():
            return Cita.objects.all()
        return Cita.objects.filter(mascota__cliente__user=user)

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        # Si es cliente, verifica que la cita pertenezca a una de sus mascotas
        if not user.groups.filter(name='peluqueros').exists():
            if obj.mascota.cliente.user != user:
                raise PermissionDenied("No tienes permiso para acceder a esta cita.")
        return obj

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "message": "Cita registrada correctamente",
            "cita": response.data
        }
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data = {
            "message": "Cita actualizada correctamente",
            "cita": response.data
        }
        return response

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.delete()
        return Response({"message": "Cita eliminada correctamente"})


# -----------------------------
# Actualizar citas (solo peluqueros)
# -----------------------------
class CitaUpdateView(UpdateAPIView):
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated, IsPeluquero]
    queryset = Cita.objects.all()

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data = {
            "message": "Cita actualizada correctamente",
            "cita": response.data
        }
        return response
