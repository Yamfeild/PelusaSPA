from rest_framework import serializers
from .models import Cliente, Mascota

class MascotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascota
        fields = ['id', 'nombre', 'edad', 'raza', 'tipo', 'cliente']

class ClienteSerializer(serializers.ModelSerializer):
    mascotas = MascotaSerializer(many=True, read_only=True)

    class Meta:
        model = Cliente
        fields = ['id', 'user_id', 'nombre', 'apellido', 'numeroContacto', 'direccion', 'mascotas']
