from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Cliente, Peluquero, Mascota, Tarifa, Cita

# -----------------------------
# REGISTRO DE CLIENTE (público)
# -----------------------------
class ClienteRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Cliente
        fields = ['username', 'password', 'apellido', 'fechaNacimiento', 'numeroContacto']

    def create(self, validated_data):
        # Extraer datos de usuario
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        # Crear User activo
        user = User.objects.create_user(
            username=username,
            password=password,
            is_active=True
        )

        # Asignar al grupo "clientes"
        group, _ = Group.objects.get_or_create(name='clientes')
        user.groups.add(group)

        # Crear Cliente asociado
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente


# -----------------------------
# REGISTRO DE PELUQUERO (admin)
# -----------------------------
class PeluqueroRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Peluquero
        fields = ['username', 'password', 'apellido', 'fechaNacimiento', 'especialidad', 'disponible']

    def create(self, validated_data):
        # Extraer datos de usuario
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        # Crear User activo
        user = User.objects.create_user(
            username=username,
            password=password,
            is_active=True
        )

        # Asignar al grupo "peluqueros"
        group, _ = Group.objects.get_or_create(name='peluqueros')
        user.groups.add(group)

        # Crear Peluquero asociado
        peluquero = Peluquero.objects.create(user=user, **validated_data)
        return peluquero


# -----------------------------
# SERIALIZERS GENERALES
# -----------------------------
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'user', 'apellido', 'fechaNacimiento', 'numeroContacto']


class PeluqueroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Peluquero
        fields = ['id', 'user', 'apellido', 'fechaNacimiento', 'especialidad', 'disponible']


class MascotaSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Mascota
        fields = ['id', 'nombre', 'edad', 'raza', 'cliente']


class TarifaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarifa
        fields = ['id', 'tipoMascota', 'costo', 'descripcion']


class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = ['id', 'mascota', 'peluquero', 'fecha', 'hora', 'estado', 'tarifa']
