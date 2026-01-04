#!/usr/bin/env python
"""
Test para simular exactamente lo que hace el frontend al agendar cita
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL_AUTH = 'http://localhost:8001/api'
BASE_URL_CITAS = 'http://localhost:8002/api'

print("=" * 60)
print("TEST: Simular agendamiento desde Frontend")
print("=" * 60)

# 1. Login como usuario CLIENTE
print("\n1. Login como CLIENTE...")
login_response = requests.post(
    f'{BASE_URL_AUTH}/auth/login/',
    json={'usuario': 'testclient', 'clave': 'testpass123'}
)

if login_response.status_code != 200:
    print(f"✗ Error en login: {login_response.status_code}")
    print(json.dumps(login_response.json(), indent=2))
    exit(1)

login_data = login_response.json()
access_token = login_data['tokens']['access']
user = login_data['user']

print(f"✓ Login exitoso")
print(f"  User: {user['username']}")
print(f"  Rol: {user['rol']}")
print(f"  Token: {access_token[:50]}...")

# 2. Crear una mascota
print("\n2. Creando mascota...")
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

mascota_response = requests.post(
    f'{BASE_URL_CITAS}/mascotas/',
    headers=headers,
    json={
        'nombre': 'TestPet',
        'especie': 'Perro',
        'raza': 'Poodle',
        'edad': 2
    }
)

if mascota_response.status_code != 201:
    print(f"✗ Error al crear mascota: {mascota_response.status_code}")
    print(json.dumps(mascota_response.json(), indent=2))
    exit(1)

mascota = mascota_response.json()
print(f"✓ Mascota creada: ID={mascota['id']}")

# 3. Obtener servicios
print("\n3. Obteniendo servicios...")
servicios_response = requests.get(f'{BASE_URL_CITAS}/servicios/')

if servicios_response.status_code != 200:
    print(f"✗ Error al obtener servicios: {servicios_response.status_code}")
    exit(1)

servicios = servicios_response.json()
if not servicios or len(servicios) == 0:
    print("✗ No hay servicios disponibles")
    exit(1)

servicio = servicios[0]
print(f"✓ Servicio obtenido: ID={servicio['id']}, Nombre={servicio['nombre']}")

# 4. Intentar crear cita
print("\n4. Creando cita...")
tomorrow = datetime.now() + timedelta(days=1)
cita_data = {
    'mascota': mascota['id'],
    'servicio': servicio['id'],
    'peluquero_id': 1,
    'fecha': tomorrow.strftime('%Y-%m-%d'),
    'hora_inicio': '14:00',
    'hora_fin': '15:00'
}

print("📋 Datos de la cita:")
print(json.dumps(cita_data, indent=2))

print("\n🔑 Enviando request con header:")
print(f"  Authorization: Bearer {access_token[:50]}...")

cita_response = requests.post(
    f'{BASE_URL_CITAS}/citas/',
    headers=headers,
    json=cita_data
)

print(f"\n📥 Respuesta del servidor: {cita_response.status_code}")

if cita_response.status_code == 201:
    cita = cita_response.json()
    print("✓ ¡CITA CREADA EXITOSAMENTE!")
    print(json.dumps(cita, indent=2))
else:
    print(f"✗ Error al crear cita")
    try:
        error_data = cita_response.json()
        print("Error response:")
        print(json.dumps(error_data, indent=2))
    except:
        print(f"Error text: {cita_response.text}")
    
    # Verificar qué headers se enviaron
    print("\n📧 Headers enviados:")
    print(f"  Authorization: {headers.get('Authorization', 'NO EXISTE')[:70]}...")
    print(f"  Content-Type: {headers.get('Content-Type')}")
