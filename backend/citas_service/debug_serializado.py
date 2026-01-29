#!/usr/bin/env python
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "citas_service.settings")
sys.path.insert(0, "/app")
django.setup()

from citas.models import Horario
from citas.serializers import HorarioSerializer

print("=" * 80)
print("VERIFICAR SERIALIZACIÓN DE HORARIOS")
print("=" * 80)

horarios = Horario.objects.filter(activo=True).order_by('peluquero_id', 'dia_semana')
serializer = HorarioSerializer(horarios, many=True)

print(f"\nTotal de horarios activos: {horarios.count()}\n")
print("JSON que se devuelve al frontend:")
print(json.dumps(serializer.data, indent=2, default=str))
print("\n" + "=" * 80)
