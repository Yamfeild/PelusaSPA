"""
Comando para crear un usuario administrador inicial.
Uso: python manage.py crear_admin
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from usuarios.models import User, Cuenta, Persona


class Command(BaseCommand):
    help = 'Crea un usuario administrador inicial si no existe'

    def handle(self, *args, **options):
        # Verificar si ya existe un admin
        if User.objects.filter(rol=User.Rol.ADMIN).exists():
            self.stdout.write(
                self.style.WARNING('Ya existe un usuario administrador en el sistema')
            )
            admin = User.objects.filter(rol=User.Rol.ADMIN).first()
            self.stdout.write(
                self.style.SUCCESS(f'Usuario admin existente: {admin.username}')
            )
            return

        # Crear admin por defecto
        try:
            with transaction.atomic():
                # Crear User
                admin = User.objects.create_user(
                    username='admin',
                    email='admin@peluqueria.com',
                    password='admin123',  # Cambiar en producción
                    rol=User.Rol.ADMIN,
                    identificacion='ADMIN001'
                )
                # Permisos para acceder al admin de Django
                admin.is_staff = True
                admin.is_superuser = True
                admin.save()
                
                # Crear Cuenta
                Cuenta.objects.create(
                    user=admin,
                    correo='admin@peluqueria.com',
                    clave=admin.password
                )
                
                # Crear Persona
                Persona.objects.create(
                    user=admin,
                    nombre='Administrador',
                    apellido='Sistema',
                    fecha_nacimiento='1990-01-01',
                    telefono='0000000000'
                )
                
                self.stdout.write(
                    self.style.SUCCESS('✅ Usuario administrador creado exitosamente')
                )
                self.stdout.write(self.style.SUCCESS('   Username: admin'))
                self.stdout.write(self.style.SUCCESS('   Password: admin123'))
                self.stdout.write(
                    self.style.WARNING('   ⚠️  IMPORTANTE: Cambiar la contraseña en producción')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error al crear administrador: {str(e)}')
            )
