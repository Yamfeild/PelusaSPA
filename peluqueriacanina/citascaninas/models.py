from django.db import models
from django.contrib.auth.models import User

# ========= CLASE ABSTRACTA ==========
class Persona(models.Model):
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.EmailField(unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.email}"


# ========= CLASES HEREDADAS ==========
class Dueno(Persona):
    # Dueño puede tener varios perros
    direccion = models.CharField(max_length=100)
    numeroContactoEmergencia = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Dueño: {self.nombre} {self.apellido} - {self.email}"


class Peluquero(Persona):
    especialidad = models.CharField(max_length=50)

    def __str__(self):
        return f"Peluquero: {self.nombre} {self.apellido} - {self.email}"


# ========= ENUMS ==========
class TipoMascota(models.TextChoices):
    PEQUENO = 'PEQUEÑO', 'Pequeño'
    MEDIANO = 'MEDIANO', 'Mediano'
    GRANDE = 'GRANDE', 'Grande'


class EstadoCita(models.TextChoices):
    REGISTRADA = 'REGISTRADA', 'Registrada'
    CANCELADA = 'CANCELADA', 'Cancelada'
    NO_ASISTE = 'NO_ASISTE', 'No Asiste'
    ACEPTADA = 'ACEPTADA', 'Aceptada'


# ========= MODELOS ==========
class Mascota(models.Model):
    dueno = models.ForeignKey(Dueno, on_delete=models.CASCADE, related_name='mascotas')
    nombre = models.CharField(max_length=50)
    edad = models.IntegerField()
    raza = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.nombre} ({self.raza}) - Dueño: {self.dueno.nombre} {self.dueno.apellido}"


class Tarifa(models.Model):
    tipo_mascota = models.CharField(max_length=10, choices=TipoMascota.choices)
    costo = models.FloatField()
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tipo_mascota} - ${self.costo}"


class Cita(models.Model):
    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(max_length=15, choices=EstadoCita.choices, default=EstadoCita.REGISTRADA)
    dueno = models.ForeignKey(Dueno, on_delete=models.CASCADE, null=True, blank=True)
    peluquero = models.ForeignKey(Peluquero, on_delete=models.CASCADE, related_name='citas')
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='citas')
    tarifa = models.ForeignKey(Tarifa, on_delete=models.CASCADE, related_name='citas')

    def __str__(self):
        return f"Cita {self.fecha} - {self.mascota.nombre} a las {self.hora} con un costo de ${self.tarifa.costo}"
