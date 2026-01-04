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
        # Eliminar admin existente si hay alguno
        if User.objects.filter(username='admin').exists():
            self.stdout.write(
                self.style.WARNING('Eliminando usuario admin existente...')
            )
            User.objects.filter(username='admin').delete()

        # Crear admin por defecto
        try:
            with transaction.atomic():
                # Crear User
                admin = User.objects.create_user(
                    username='admin',
                    email='admin@example.com',
                    password='admin123',
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
                    correo='admin@example.com',
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
