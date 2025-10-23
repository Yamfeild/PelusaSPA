from django.db import models

class EstadoCita(models.TextChoices):
    REGISTRADA = 'REGISTRADA', 'Registrada'
    CANCELADA = 'CANCELADA', 'Cancelada'
    TERMINADA = 'TERMINADA', 'Terminada'


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


class Cita(models.Model):
    # IDs referenciados de los otros microservicios
    mascota_id = models.IntegerField()      # ID de mascota desde cliente_service
    peluquero_id = models.IntegerField()    # ID de peluquero desde usuario_service
    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(max_length=20, choices=EstadoCita.choices, default=EstadoCita.REGISTRADA)
    tarifa = models.ForeignKey(Tarifa, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Cita: Mascota {self.mascota_id} con Peluquero {self.peluquero_id} - {self.fecha} {self.hora}"
