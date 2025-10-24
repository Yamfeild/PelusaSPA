from django.db import models
from django.contrib.auth.models import User
from datetime import date

class AbstractPersona(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=15, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['apellido', 'nombre']

    def __str__(self):
        return f"{self.nombre} {self.apellido}"
    
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"
    
    def edad(self):
        if self.fecha_nacimiento:
            today = date.today()
            return today.year - self.fecha_nacimiento.year - (
                (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
            )
        return None

class Correo(models.Model):
    correo = models.EmailField(unique=True)
    clave = models.CharField(max_length=128)



class Peluquero(AbstractPersona):
    especialidad = models.CharField(max_length=100, blank=True)
    disponible = models.BooleanField(default=True)
    experiencia_years = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Peluquero'
        verbose_name_plural = 'Peluqueros'

    def __str__(self):
        return f"{self.nombre_completo()} - {self.especialidad}"
    
class Cliente(AbstractPersona):
    preferencias = models.TextField(blank=True)
    ultima_visita = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self):
        return f"{self.nombre_completo()} - {self.telefono}"