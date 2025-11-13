from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password


class User(AbstractUser):
    """
    Usuario del microservicio.
    - Se basa en AbstractUser.
    - Incluye un rol simple por elección y datos adicionales.
    """

    class Rol(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        PELUQUERO = 'PELUQUERO', 'Peluquero'
        CLIENTE = 'CLIENTE', 'Cliente'

    # Campos adicionales al usuario base
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.CLIENTE)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    identificacion = models.CharField(max_length=20, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"


class Cuenta(models.Model):
    """
    Representa la cuenta de acceso según el diagrama.
    - correo: email único de la cuenta.
    - clave: hash de la contraseña (mismo esquema que Django).
    - user: relación 1:1 con el usuario del sistema.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cuenta'
    )
    correo = models.EmailField(unique=True)
    clave = models.CharField(max_length=128)

    def set_clave(self, raw_password: str):
        """Define la clave hasheada y sincroniza con el User asociado."""
        hashed = make_password(raw_password)
        self.clave = hashed
        if self.user_id:
            self.user.password = hashed
            # No guardamos aquí al user para permitir transacciones atómicas desde fuera

    def save(self, *args, **kwargs):
        # Sincronizar correo con el email del User
        if self.user_id and self.correo and self.user.email != self.correo:
            self.user.email = self.correo
            self.user.save(update_fields=['email'])
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Cuenta({self.correo})"


class Persona(models.Model):
    """
    Perfil base de usuario (del diagrama Persona).
    Se asocia 1:1 con User.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='persona'
    )
    nombre = models.CharField(max_length=120)
    apellido = models.CharField(max_length=120)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.nombre} {self.apellido}".strip()


class Cliente(models.Model):
    """Extiende Persona con datos de cliente."""

    persona = models.OneToOneField(
        Persona,
        on_delete=models.CASCADE,
        related_name='cliente'
    )
    direccion = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self) -> str:
        return f"Cliente({self.persona})"


class Peluquero(models.Model):
    """Extiende Persona con datos de peluquero."""

    persona = models.OneToOneField(
        Persona,
        on_delete=models.CASCADE,
        related_name='peluquero'
    )
    especialidad = models.CharField(max_length=120, blank=True, null=True)
    experiencia = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return f"Peluquero({self.persona})"
    
        