#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "citas_service.settings")
sys.path.insert(0, "/app")
django.setup()

from citas.models import Horario

print("=" * 80)
print("HORARIOS GUARDADOS EN LA BASE DE DATOS")
print("=" * 80)

horarios = Horario.objects.all().order_by('peluquero_id', 'dia_semana')
dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

if not horarios.exists():
    print("NO HAY HORARIOS GUARDADOS")
else:
    print(f"Total de horarios: {horarios.count()}\n")
    for h in horarios:
        dia_nombre = dias[h.dia_semana] if 0 <= h.dia_semana < 7 else f"Día {h.dia_semana}"
        estado = "✓ ACTIVO" if h.activo else "✗ INACTIVO"
        print(f"ID: {h.id:3} | Peluquero: {h.peluquero_id:3} | Día: {h.dia_semana}({dia_nombre:10}) | {h.hora_inicio}-{h.hora_fin} | {estado}")

print("=" * 80)
