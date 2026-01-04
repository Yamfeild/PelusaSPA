import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'usuario_service.settings')
django.setup()

from usuarios.models import User, Persona, Cuenta

print("\n" + "="*60)
print("VERIFICACIÓN DE USUARIOS ADMINISTRADORES")
print("="*60 + "\n")

admins = User.objects.filter(rol='ADMIN')
print(f"Total de administradores: {admins.count()}\n")

if admins.count() == 0:
    print("❌ NO HAY USUARIOS ADMINISTRADORES")
    print("\nCreando usuario admin...")
    
    # Crear admin
    admin = User.objects.create(
        username='admin',
        email='admin@example.com',
        rol='ADMIN',
        identificacion='ADMIN001',
        is_staff=True,
        is_superuser=True
    )
    admin.set_password('admin123')
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
    
    print("✅ Admin creado exitosamente!\n")
    admins = User.objects.filter(rol='ADMIN')

for admin in admins:
    print(f"👤 Usuario: {admin.username}")
    print(f"   ID: {admin.id}")
    print(f"   Email: {admin.email}")
    print(f"   Rol: {admin.rol}")
    print(f"   Activo: {'✅ Sí' if admin.is_active else '❌ No'}")
    print(f"   Staff: {'✅ Sí' if admin.is_staff else '❌ No'}")
    
    # Verificar Cuenta
    try:
        cuenta = Cuenta.objects.get(user=admin)
        print(f"   Cuenta: ✅ Existe (correo: {cuenta.correo})")
    except Cuenta.DoesNotExist:
        print(f"   Cuenta: ❌ NO EXISTE")
    
    # Verificar Persona
    if hasattr(admin, 'persona'):
        persona = admin.persona
        print(f"   Persona: ✅ Existe ({persona.nombre} {persona.apellido})")
    else:
        print(f"   Persona: ❌ NO EXISTE")
    
    # Probar contraseña
    if admin.check_password('admin123'):
        print(f"   Contraseña 'admin123': ✅ CORRECTA")
    else:
        print(f"   Contraseña 'admin123': ❌ INCORRECTA")
    
    print()

print("="*60)
print("\n📋 CREDENCIALES DE ACCESO:")
print("   Email o Usuario: admin@example.com  o  admin")
print("   Contraseña: admin123")
print("\n" + "="*60 + "\n")
