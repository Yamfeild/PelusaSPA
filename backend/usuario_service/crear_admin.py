"""
Script para crear un usuario administrador completo
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'usuario_service.settings')
django.setup()

from usuarios.models import User, Persona

# Eliminar admin existente si lo hay
User.objects.filter(username='admin').delete()

# Crear nuevo admin
admin = User.objects.create(
    username='admin',
    email='admin@example.com',
    rol='ADMIN'
)
admin.set_password('admin123')
admin.save()

# Crear Persona para el admin
persona = Persona.objects.create(
    user=admin,
    nombre='Administrador',
    apellido='Sistema',
    telefono='000-000-0000'
)

print('=== Admin creado correctamente ===')
print(f'Username: {admin.username}')
print(f'Email: {admin.email}')
print(f'Rol: {admin.rol}')
print(f'Contraseña: admin123')
print(f'Persona ID: {persona.id}')
print(f'Nombre completo: {persona.nombre} {persona.apellido}')
print('===================================')
