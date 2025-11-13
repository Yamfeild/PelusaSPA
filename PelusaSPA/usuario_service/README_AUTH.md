# Sistema de Autenticación JWT - Usuario Service

## Implementación Completa

Se ha implementado un sistema completo de autenticación y registro con JWT que integra todos los modelos del diagrama:
- **User**: Usuario base de Django extendido
- **Cuenta**: Credenciales (correo/clave)
- **Persona**: Datos personales
- **Cliente**: Perfil de cliente
- **Peluquero**: Perfil de peluquero

## Endpoints Disponibles

### 1. Registro de Usuario
**POST** `/auth/registro/`

Crea un usuario completo con todos los perfiles asociados según el rol.

**Body (JSON):**
```json
{
  "username": "juan_perez",
  "correo": "juan@example.com",
  "clave": "Password123!",
  "clave_confirmacion": "Password123!",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fecha_nacimiento": "1990-05-15",
  "telefono": "0999123456",
  "identificacion": "1234567890",
  "rol": "CLIENTE",
  "direccion": "Av. Principal 123"
}
```

**Para Peluquero:**
```json
{
  "username": "maria_estilista",
  "correo": "maria@example.com",
  "clave": "Password123!",
  "clave_confirmacion": "Password123!",
  "nombre": "María",
  "apellido": "García",
  "telefono": "0999654321",
  "identificacion": "0987654321",
  "rol": "PELUQUERO",
  "especialidad": "Corte y Color",
  "experiencia": "5 años en estilismo profesional"
}
```

**Respuesta (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "juan_perez",
    "email": "juan@example.com",
    "rol": "CLIENTE"
  },
  "persona": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "fecha_nacimiento": "1990-05-15",
    "telefono": "0999123456"
  },
  "perfil": {
    "persona": {...},
    "direccion": "Av. Principal 123"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. Login
**POST** `/auth/login/`

Autentica con username o email.

**Body (JSON):**
```json
{
  "usuario": "juan_perez",
  "clave": "Password123!"
}
```

O con email:
```json
{
  "usuario": "juan@example.com",
  "clave": "Password123!"
}
```

**Respuesta (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "juan_perez",
    "email": "juan@example.com",
    "rol": "CLIENTE"
  },
  "persona": {...},
  "perfil": {...},
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 3. Refrescar Token
**POST** `/auth/token/refresh/`

Obtiene un nuevo access token usando el refresh token.

**Body (JSON):**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Respuesta (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 4. Ver Perfil (Requiere Autenticación)
**GET** `/auth/perfil/`

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Respuesta (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "juan_perez",
    "email": "juan@example.com",
    "rol": "CLIENTE"
  },
  "persona": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "fecha_nacimiento": "1990-05-15",
    "telefono": "0999123456"
  },
  "perfil": {
    "persona": {...},
    "direccion": "Av. Principal 123"
  }
}
```

### 5. Consultar Usuario por ID (Para otros microservicios)
**GET** `/usuarios/{id}/`

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "username": "juan_perez",
  "email": "juan@example.com",
  "rol": "CLIENTE",
  "persona": {...},
  "perfil": {...}
}
```

## Configuración JWT

En `settings.py`:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

## Roles Disponibles

- `ADMIN`: Administrador del sistema
- `PELUQUERO`: Profesional que ofrece servicios
- `CLIENTE`: Usuario que reserva servicios

## Seguridad

✅ Contraseñas hasheadas con Django's PBKDF2  
✅ Validación de contraseñas seguras  
✅ Tokens JWT con expiración  
✅ Blacklist de tokens rotados  
✅ CORS configurado  
✅ Validación de unicidad (username, email, identificación)

## Integración con citas_service

El servicio de citas puede:
1. Validar tokens JWT enviados por el cliente
2. Consultar `/usuarios/{id}/` para obtener datos del usuario
3. Verificar roles antes de permitir operaciones

**Ejemplo de validación en citas_service:**
```python
import requests

def verificar_usuario(user_id, token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(
        f'http://usuario_service:8001/usuarios/{user_id}/',
        headers=headers
    )
    if response.status_code == 200:
        return response.json()
    return None
```

## Pruebas con curl

### Registro de cliente:
```powershell
curl -X POST http://127.0.0.1:8001/auth/registro/ `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"juan_cliente\",\"correo\":\"juan@test.com\",\"clave\":\"Password123!\",\"clave_confirmacion\":\"Password123!\",\"nombre\":\"Juan\",\"apellido\":\"Pérez\",\"telefono\":\"0999123456\",\"identificacion\":\"1234567890\",\"rol\":\"CLIENTE\",\"direccion\":\"Av. Principal 123\"}'
```

### Login:
```powershell
curl -X POST http://127.0.0.1:8001/auth/login/ `
  -H "Content-Type: application/json" `
  -d '{\"usuario\":\"juan_cliente\",\"clave\":\"Password123!\"}'
```

### Ver perfil (reemplazar TOKEN):
```powershell
curl -X GET http://127.0.0.1:8001/auth/perfil/ `
  -H "Authorization: Bearer TOKEN_AQUI"
```

## Migraciones

Ya se aplicaron las migraciones para crear las tablas:
- `usuarios_user` (extendido de Django User)
- `usuarios_cuenta`
- `usuarios_persona`
- `usuarios_cliente`
- `usuarios_peluquero`

## Servidor de Desarrollo

Iniciar el servidor:
```powershell
cd d:\Plataformas\V1\PelusaSPA\usuario_service
D:/Plataformas/V1/PelusaSPA/venv/Scripts/python.exe manage.py runserver 8001
```

El servidor está corriendo en: **http://127.0.0.1:8001/**
