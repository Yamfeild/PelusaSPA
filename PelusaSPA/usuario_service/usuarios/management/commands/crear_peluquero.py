from django.core.management.base import BaseCommand
from django.db import transaction
from usuarios.models import User, Cuenta, Persona, Peluquero


class Command(BaseCommand):
    help = 'Crea un peluquero de prueba para el sistema'

    def handle(self, *args, **options):
        # Verificar si ya existe
        if User.objects.filter(username='peluquero1').exists():
            self.stdout.write(self.style.WARNING('El peluquero ya existe'))
            return
        
        try:
            with transaction.atomic():
                # Crear User
                user = User.objects.create_user(
                    username='peluquero1',
                    email='peluquero@peluqueria.com',
                    password='peluquero123',
                    rol=User.Rol.PELUQUERO
                )
                
                # Crear Cuenta
                Cuenta.objects.create(
                    user=user,
                    correo='peluquero@peluqueria.com',
                    clave=user.password
                )
                
                # Crear Persona
                persona = Persona.objects.create(
                    user=user,
                    nombre='Carlos',
                    apellido='Pérez',
                    telefono='0999999999'
                )
                
                # Crear Peluquero
                Peluquero.objects.create(
                    persona=persona,
                    especialidad='Corte y baño para todas las razas',
                    experiencia='5 años de experiencia'
                )
                
                self.stdout.write(self.style.SUCCESS(f'Peluquero creado exitosamente (ID: {user.id})'))
                self.stdout.write(f'  Username: peluquero1')
                self.stdout.write(f'  Password: peluquero123')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al crear peluquero: {str(e)}'))
