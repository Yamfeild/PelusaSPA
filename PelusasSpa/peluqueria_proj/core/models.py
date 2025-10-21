from django.db import models
from django.contrib.auth.models import User

# -----------------------------
# MODELOS BASE
# -----------------------------
class Persona(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    apellido = models.CharField(max_length=100)
    fechaNacimiento = models.DateField(null=True, blank=True)

    class Meta:
        abstract = True  # nadie crea una "Persona" directa

    def __str__(self):
        return f"{self.user.username} {self.apellido}"


# -----------------------------
# CLIENTE Y PELUQUERO HEREDAN DE PERSONA
# -----------------------------
class Cliente(Persona):
    numeroContacto = models.CharField(max_length=20)

    def save(self, *args, **kwargs):
        # Evitar que exista un peluquero con el mismo user
        if Peluquero.objects.filter(user=self.user).exists():
            raise ValueError("Esta persona ya es un Peluquero")
        super().save(*args, **kwargs)


class Peluquero(Persona):
    especialidad = models.CharField(max_length=100, blank=True)
    disponible = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        # Evitar que exista un cliente con el mismo user
        if Cliente.objects.filter(user=self.user).exists():
            raise ValueError("Esta persona ya es un Cliente")
        super().save(*args, **kwargs)


# -----------------------------
# MODELOS DE NEGOCIO
# -----------------------------
class Mascota(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="mascotas")
    nombre = models.CharField(max_length=100)
    edad = models.IntegerField()
    raza = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nombre} ({self.raza})"


class TipoMascota(models.TextChoices):
    PEQUEÑO = 'PEQUEÑO', 'Pequeño'
    MEDIANO = 'MEDIANO', 'Mediano'
    GRANDE = 'GRANDE', 'Grande'


class Tarifa(models.Model):
    tipoMascota = models.CharField(max_length=20, choices=TipoMascota.choices)
    costo = models.DecimalField(max_digits=6, decimal_places=2)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return f"{self.tipoMascota} - ${self.costo}"


class EstadoCita(models.TextChoices):
    REGISTRADA = 'REGISTRADA', 'Registrada' 
    CANCELADA = 'CANCELADA', 'Cancelada'
    TERMINADA = 'TERMINADA', 'Terminada'


class Cita(models.Model):
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE)
    peluquero = models.ForeignKey(Peluquero, on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(max_length=20, choices=EstadoCita.choices, default=EstadoCita.REGISTRADA)
    tarifa = models.ForeignKey(Tarifa, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Cita: {self.mascota.nombre} - {self.fecha} {self.hora} ({self.estado})"
