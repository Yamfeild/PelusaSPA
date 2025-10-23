from rest_framework import serializers
from .models import Cita, Tarifa

class TarifaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarifa
        fields = ['id', 'tipoMascota', 'costo', 'descripcion']


class CitaSerializer(serializers.ModelSerializer):
    tarifa = TarifaSerializer(read_only=True)

    class Meta:
        model = Cita
        fields = ['id', 'mascota_id', 'peluquero_id', 'fecha', 'hora', 'estado', 'tarifa']
