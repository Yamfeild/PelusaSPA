from rest_framework import serializers
from .models import Dueno, Peluquero, Mascota, Tarifa, Cita
from django.contrib.auth.models import User
from rest_framework import serializers

class DuenoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dueno
        fields = '__all__'

class PeluqueroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Peluquero
        fields = '__all__'

class MascotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascota
        fields = '__all__'

class TarifaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarifa
        fields = '__all__'

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        # Crear usuario normal sin vincularlo a Dueno
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
