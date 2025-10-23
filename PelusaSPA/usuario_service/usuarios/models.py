from django.db import models
from django.contrib.auth.models import User

class Peluquero(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    especialidad = models.CharField(max_length=100, blank=True)
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.especialidad}"
    