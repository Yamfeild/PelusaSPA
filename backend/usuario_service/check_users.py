from usuarios.models import User, Persona

users = User.objects.all()
print(f"\nTotal usuarios: {users.count()}\n")

for u in users:
    print(f"ID={u.id}, username={u.username}, rol={u.rol}")
    try:
        if hasattr(u, 'persona') and u.persona:
            print(f"  Persona: {u.persona.nombre} {u.persona.apellido}")
        else:
            print("  SIN PERSONA")
    except:
        print("  SIN PERSONA (error)")
    print()
