from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Peluquero

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email']

class PeluqueroSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Peluquero
        fields = ['id','user','especialidad','disponible']
