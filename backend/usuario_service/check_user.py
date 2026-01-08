import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'usuario_service.settings')
django.setup()

from usuarios.models import User

# Check if user exists
user = User.objects.filter(email='joeldjc@gmail.com').first()
if user:
    print(f"✓ User found: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Rol: {user.rol}")
    print(f"  Is active: {user.is_active}")
else:
    print("✗ User NOT found")

# List all users
print("\nAll users in database:")
for u in User.objects.all():
    print(f"  - {u.username} ({u.email}) - Rol: {u.rol}")
