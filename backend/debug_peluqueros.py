#!/usr/bin/env python
import os
import sys
import django
import json
import requests

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "citas_service.settings")
sys.path.insert(0, "/app")
django.setup()

print("=" * 80)
print("VERIFICAR PELUQUEROS")
print("=" * 80)

# Hacer request al servicio de usuarios para obtener los peluqueros
try:
    response = requests.get("http://usuario_service:8001/api/usuarios/?rol=PELUQUERO", timeout=5)
    print(f"\nRespuesta del servicio de usuarios:\n")
    print(json.dumps(response.json(), indent=2, default=str))
except Exception as e:
    print(f"Error al conectar con usuario_service: {e}")

print("\n" + "=" * 80)
