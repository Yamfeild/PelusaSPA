from django.db import models
from django.core.exceptions import ValidationError
from datetime import datetime, time


class EstadoCita(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    CONFIRMADA = 'CONFIRMADA', 'Confirmada'
    CANCELADA = 'CANCELADA', 'Cancelada'
    FINALIZADA = 'FINALIZADA', 'Finalizada'
    NO_ASISTIO = 'NO_ASISTIO', 'No Asistió'


class Servicio(models.Model):
    """
    Servicio de peluquería disponible.
    Define los servicios que ofrece la peluquería con duración y precio.
    """
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    duracion_minutos = models.IntegerField(help_text="Duración en minutos")
    precio = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio en EUR")
    imagen_url = models.URLField(blank=True, null=True, help_text="URL de la imagen del servicio (puede ser URL de nube como Google Drive, Cloudinary, etc.)")
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Servicio"
        verbose_name_plural = "Servicios"
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} ({self.duracion_minutos} min - ${self.precio})"


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
    dia_semana = models.IntegerField(
        help_text="Día de la semana: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo",
        choices=[
            (0, 'Lunes'),
            (1, 'Martes'),
            (2, 'Miércoles'),
            (3, 'Jueves'),
            (4, 'Viernes'),
            (5, 'Sábado'),
            (6, 'Domingo'),
        ]
    )
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Horario"
        verbose_name_plural = "Horarios"
        ordering = ['peluquero_id', 'dia_semana', 'hora_inicio']
    
    def __str__(self):
        dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        dia_nombre = dias[self.dia_semana] if 0 <= self.dia_semana < 7 else f"Día {self.dia_semana}"
        return f"Peluquero {self.peluquero_id} - {dia_nombre}: {self.hora_inicio}-{self.hora_fin}"
    
    def clean(self):
        """Validar que hora_fin sea mayor que hora_inicio."""
        if self.hora_inicio >= self.hora_fin:
            raise ValidationError("La hora de fin debe ser posterior a la hora de inicio")
        if not (0 <= self.dia_semana <= 6):
            raise ValidationError("El día de la semana debe estar entre 0 (Lunes) y 6 (Domingo)")


class Cita(models.Model):
    """
    Cita entre la mascota de un cliente y un peluquero.
    Se valida contra la disponibilidad del Horario del peluquero.
    """
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='citas')
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name='citas', null=True, blank=True)
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
    
    def marcar_no_asistio(self):
        """Marca que el cliente no asistió a la cita."""
        if self.estado in [EstadoCita.CANCELADA, EstadoCita.NO_ASISTIO]:
            raise ValidationError(f"La cita ya está en estado {self.estado}")
        if self.estado == EstadoCita.FINALIZADA:
            raise ValidationError("No se puede marcar como no asistió una cita finalizada")
        self.estado = EstadoCita.NO_ASISTIO
        self.save(update_fields=['estado', 'actualizada_en'])
    
    def crear_notificacion(self, tipo: str, mensaje: str = None):
        """Crea una notificación para el peluquero asignado a la cita.
        
        Args:
            tipo: Tipo de notificación (del enum TipoNotificacion)
            mensaje: Mensaje personalizado (si es None, se genera automáticamente)
        """
        if mensaje is None:
            # Generar mensaje automático según el tipo
            mensajes_por_tipo = {
                TipoNotificacion.NUEVA_CITA: f"Nueva cita agendada: {self.mascota.nombre} el {self.fecha} a las {self.hora_inicio}",
                TipoNotificacion.CITA_CONFIRMADA: f"Cita confirmada: {self.mascota.nombre} el {self.fecha}",
                TipoNotificacion.CITA_CANCELADA: f"Cita cancelada: {self.mascota.nombre} del {self.fecha}",
                TipoNotificacion.CITA_REPROGRAMADA: f"Cita reprogramada: {self.mascota.nombre} para el {self.fecha}",
                TipoNotificacion.RECORDATORIO: f"Recordatorio: Cita con {self.mascota.nombre} hoy a las {self.hora_inicio}",
            }
            mensaje = mensajes_por_tipo.get(tipo, f"Notificación sobre cita #{self.id}")
        
        notificacion = NotificacionPeluquero.objects.create(
            peluquero_id=self.peluquero_id,
            cita=self,
            tipo=tipo,
            mensaje=mensaje
        )
        return notificacion


class TipoNotificacion(models.TextChoices):
    NUEVA_CITA = 'NUEVA_CITA', 'Nueva Cita'
    CITA_CONFIRMADA = 'CITA_CONFIRMADA', 'Cita Confirmada'
    CITA_CANCELADA = 'CITA_CANCELADA', 'Cita Cancelada'
    CITA_REPROGRAMADA = 'CITA_REPROGRAMADA', 'Cita Reprogramada'
    RECORDATORIO = 'RECORDATORIO', 'Recordatorio de Cita'


class NotificacionPeluquero(models.Model):
    """
    Notificaciones para peluqueros sobre eventos de citas.
    Se crea automáticamente cuando:
    - Se agenda una nueva cita
    - Se confirma una cita
    - Se cancela una cita
    - Se aproxima la cita (recordatorio)
    """
    peluquero_id = models.IntegerField(help_text="ID del peluquero (User) desde usuario_service")
    cita = models.ForeignKey(Cita, on_delete=models.CASCADE, related_name='notificaciones')
    tipo = models.CharField(max_length=20, choices=TipoNotificacion.choices)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    creada_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Notificación Peluquero"
        verbose_name_plural = "Notificaciones Peluqueros"
        ordering = ['-creada_en']
        indexes = [
            models.Index(fields=['peluquero_id', '-creada_en']),
            models.Index(fields=['peluquero_id', 'leida']),
        ]
    
    def __str__(self):
        return f"Notificación para peluquero {self.peluquero_id}: {self.get_tipo_display()}"
