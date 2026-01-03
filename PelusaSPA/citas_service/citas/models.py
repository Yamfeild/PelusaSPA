from django.db import models
from django.core.exceptions import ValidationError
from datetime import datetime, time


class EstadoCita(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    CONFIRMADA = 'CONFIRMADA', 'Confirmada'
    CANCELADA = 'CANCELADA', 'Cancelada'
    FINALIZADA = 'FINALIZADA', 'Finalizada'


class Servicio(models.Model):
    """
    Servicio de peluquería disponible.
    Define los servicios que ofrece la peluquería con duración y precio.
    """
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    duracion_minutos = models.IntegerField(help_text="Duración en minutos")
    precio = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio en EUR")
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} ({self.duracion_minutos} min - €{self.precio})"


class Mascota(models.Model):
    """
    Mascota de un cliente.
    El cliente registra sus mascotas y luego agenda citas para ellas.
    Relación con el CLIENTE (usuario_service):
    - No usamos ForeignKey directa porque el cliente vive en otro microservicio.
    - Guardamos el identificador entero "dueno_id" que corresponde al ID del User con rol CLIENTE.
    - Esto permite validar pertenencia y filtrar citas/mascotas sin acoplar bases de datos.
    """
    dueno_id = models.IntegerField(help_text="ID del cliente (User) dueño desde usuario_service. Se almacena como entero para mantener microservicios desacoplados.")
    nombre = models.CharField(max_length=100)
    raza = models.CharField(max_length=100)
    edad = models.IntegerField(help_text="Edad en años")
    creada_en = models.DateTimeField(auto_now_add=True)
    actualizada_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Mascota"
        verbose_name_plural = "Mascotas"
        ordering = ['dueno_id', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} ({self.raza}) - Dueño: {self.dueno_id}"


class Horario(models.Model):
    """
    Horario de disponibilidad de un peluquero.
    Un peluquero puede tener múltiples horarios (días de la semana).
    """
    peluquero_id = models.IntegerField(help_text="ID del peluquero desde usuario_service")
    dia = models.CharField(max_length=20, help_text="Día de la semana (ej: Lunes, Martes)")
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Horario"
        verbose_name_plural = "Horarios"
        ordering = ['peluquero_id', 'dia', 'hora_inicio']
    
    def __str__(self):
        return f"Peluquero {self.peluquero_id} - {self.dia}: {self.hora_inicio}-{self.hora_fin}"
    
    def clean(self):
        """Validar que hora_fin sea mayor que hora_inicio."""
        if self.hora_inicio >= self.hora_fin:
            raise ValidationError("La hora de fin debe ser posterior a la hora de inicio")
    
    def es_dia_laboral(self, dia_nombre: str) -> bool:
        """Verifica si el día corresponde a este horario."""
        return self.dia.lower() == dia_nombre.lower() and self.activo


class Cita(models.Model):
    """
    Cita entre la mascota de un cliente y un peluquero.
    Se valida contra la disponibilidad del Horario del peluquero.
    """
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='citas')
    peluquero_id = models.IntegerField(help_text="ID del peluquero desde usuario_service")
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(
        max_length=20, 
        choices=EstadoCita.choices, 
        default=EstadoCita.PENDIENTE
    )
    
    # Campos adicionales opcionales
    notas = models.TextField(blank=True, help_text="Notas o comentarios del cliente")
    creada_en = models.DateTimeField(auto_now_add=True)
    actualizada_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ['-fecha', '-hora_inicio']
    
    def __str__(self):
        return f"Cita #{self.id} - Mascota {self.mascota.nombre} con Peluquero {self.peluquero_id} el {self.fecha}"
    
    @property
    def cliente_id(self):
        """Retorna el ID del cliente asociado a la mascota.
        Nota: cliente_id no es un campo físico; deriva de Mascota.dueno_id.
        Esto evita una ForeignKey cruzada entre microservicios y mantiene el modelo simple.
        """
        return self.mascota.dueno_id if self.mascota else None
    
    def clean(self):
        """Validaciones de negocio."""
        # Validar que hora_fin sea mayor que hora_inicio
        if self.hora_inicio >= self.hora_fin:
            raise ValidationError("La hora de fin debe ser posterior a la hora de inicio")
        
        # No permitir citas en fechas pasadas (solo al crear)
        if not self.pk:  # Solo al crear
            from django.utils import timezone
            if self.fecha < timezone.now().date():
                raise ValidationError("No se pueden crear citas en fechas pasadas")
    
    def agendar(self, mascota, peluquero_id: int, fecha, hora_inicio: time, hora_fin: time):
        """Método para agendar una cita (usado desde serializer/view)."""
        self.mascota = mascota
        self.peluquero_id = peluquero_id
        self.fecha = fecha
        self.hora_inicio = hora_inicio
        self.hora_fin = hora_fin
        self.estado = EstadoCita.PENDIENTE
        self.full_clean()
        self.save()
    
    def cancelar(self):
        """Cancela la cita."""
        if self.estado == EstadoCita.CANCELADA:
            raise ValidationError("La cita ya está cancelada")
        self.estado = EstadoCita.CANCELADA
        self.save(update_fields=['estado', 'actualizada_en'])
    
    def confirmar(self):
        """Confirma la cita (solo peluquero)."""
        if self.estado == EstadoCita.CONFIRMADA:
            raise ValidationError("La cita ya está confirmada")
        if self.estado == EstadoCita.CANCELADA:
            raise ValidationError("No se puede confirmar una cita cancelada")
        self.estado = EstadoCita.CONFIRMADA
        self.save(update_fields=['estado', 'actualizada_en'])

    def finalizar(self):
        """Finaliza la cita (cuando ya ocurrió)."""
        if self.estado == EstadoCita.CANCELADA:
            raise ValidationError("No se puede finalizar una cita cancelada")
        if self.estado == EstadoCita.FINALIZADA:
            raise ValidationError("La cita ya está finalizada")
        # Solo se puede finalizar si está confirmada o pendiente y ya pasó su hora_fin
        from django.utils import timezone
        ahora = timezone.now()
        fecha_hora_fin = datetime.combine(self.fecha, self.hora_fin)
        if fecha_hora_fin > ahora:
            raise ValidationError("La cita aún no ha concluido, no se puede finalizar")
        if self.estado not in [EstadoCita.CONFIRMADA, EstadoCita.PENDIENTE]:
            raise ValidationError("Estado inválido para finalizar")
        self.estado = EstadoCita.FINALIZADA
        self.save(update_fields=['estado', 'actualizada_en'])

