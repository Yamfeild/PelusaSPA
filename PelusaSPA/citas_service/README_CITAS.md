# Sistema de Gestión de Citas - citas_service

## Implementación Completa

Sistema completo de agendamiento de citas con gestión de horarios y permisos por rol según el diagrama de clases.

### Modelos Implementados

#### 1. Horario
Representa la disponibilidad laboral de un peluquero por día de la semana.

**Campos:**
- `peluquero_id`: ID del peluquero (desde usuario_service)
- `dia`: Día de la semana (Lunes, Martes, etc.)
- `hora_inicio`: Hora de inicio del turno
- `hora_fin`: Hora de fin del turno
- `activo`: Si el horario está activo

**Métodos:**
- `es_dia_laboral(dia_nombre)`: Verifica si trabaja ese día

#### 2. Cita
Representa una cita entre un cliente y un peluquero.

**Campos:**
- `cliente_id`: ID del cliente (desde usuario_service)
- `peluquero_id`: ID del peluquero (desde usuario_service)
- `fecha`: Fecha de la cita
- `hora_inicio`: Hora de inicio
- `hora_fin`: Hora de fin
- `estado`: PENDIENTE | CONFIRMADA | CANCELADA
- `notas`: Comentarios opcionales
- `creada_en`: Timestamp de creación
- `actualizada_en`: Timestamp de última actualización

**Métodos:**
- `agendar()`: Crear nueva cita
- `cancelar()`: Cancelar cita
- `confirmar()`: Confirmar cita (solo peluquero)

## Endpoints Disponibles

### Autenticación Requerida
Todos los endpoints requieren JWT token en el header:
```
Authorization: Bearer <access_token>
```

---

## HORARIOS (Gestión de Disponibilidad)

### 1. Listar Horarios
**GET** `/horarios/`

Muestra horarios activos. Si eres peluquero, solo ves los tuyos.

**Query params opcionales:**
- `peluquero_id`: Filtrar por ID de peluquero

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "peluquero_id": 2,
    "dia": "Lunes",
    "hora_inicio": "09:00:00",
    "hora_fin": "18:00:00",
    "activo": true
  }
]
```

### 2. Crear Horario (Solo PELUQUERO)
**POST** `/horarios/`

**Body:**
```json
{
  "dia": "Lunes",
  "hora_inicio": "09:00:00",
  "hora_fin": "18:00:00",
  "activo": true
}
```
*Nota: `peluquero_id` se asigna automáticamente del usuario autenticado*

**Respuesta (201 Created):**
```json
{
  "id": 1,
  "peluquero_id": 2,
  "dia": "Lunes",
  "hora_inicio": "09:00:00",
  "hora_fin": "18:00:00",
  "activo": true
}
```

### 3. Actualizar Horario (Solo PELUQUERO propietario)
**PUT/PATCH** `/horarios/{id}/`

**Body:**
```json
{
  "hora_inicio": "08:00:00",
  "hora_fin": "19:00:00"
}
```

### 4. Eliminar Horario (Solo PELUQUERO propietario)
**DELETE** `/horarios/{id}/`

---

## CITAS (Agendamiento)

### 1. Listar Citas
**GET** `/citas/`

Filtra automáticamente según tu rol:
- **CLIENTE**: Solo tus citas como cliente
- **PELUQUERO**: Solo citas asignadas a ti

**Query params opcionales:**
- `estado`: PENDIENTE | CONFIRMADA | CANCELADA
- `fecha`: Filtrar por fecha (YYYY-MM-DD)

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "cliente_id": 3,
    "peluquero_id": 2,
    "fecha": "2025-11-15",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "estado": "PENDIENTE",
    "estado_display": "Pendiente",
    "notas": "Corte y barba",
    "creada_en": "2025-11-12T10:30:00Z",
    "actualizada_en": "2025-11-12T10:30:00Z"
  }
]
```

### 2. Ver Detalle de Cita
**GET** `/citas/{id}/`

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "cliente_id": 3,
  "peluquero_id": 2,
  "fecha": "2025-11-15",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "estado": "PENDIENTE",
  "estado_display": "Pendiente",
  "notas": "Corte y barba",
  "creada_en": "2025-11-12T10:30:00Z",
  "actualizada_en": "2025-11-12T10:30:00Z",
  "cliente_info": {
    "id": 3,
    "nombre": "Cliente"
  },
  "peluquero_info": {
    "id": 2,
    "nombre": "Peluquero"
  }
}
```

### 3. Agendar Cita (Solo CLIENTE)
**POST** `/citas/`

**Body:**
```json
{
  "peluquero_id": 2,
  "fecha": "2025-11-15",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "notas": "Corte y barba"
}
```
*Nota: `cliente_id` se asigna automáticamente del usuario autenticado*

**Validaciones automáticas:**
- ✅ Fecha no puede ser pasada
- ✅ Hora fin > hora inicio
- ✅ Duración mínima: 30 minutos
- ✅ Peluquero debe tener horario laboral ese día
- ✅ Hora debe estar dentro del horario laboral
- ✅ No puede haber conflicto con otras citas

**Respuesta (201 Created):**
```json
{
  "id": 1,
  "cliente_id": 3,
  "peluquero_id": 2,
  "fecha": "2025-11-15",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "estado": "PENDIENTE",
  "estado_display": "Pendiente",
  "notas": "Corte y barba",
  "creada_en": "2025-11-12T10:30:00Z",
  "actualizada_en": "2025-11-12T10:30:00Z"
}
```

### 4. Cancelar Cita
**POST** `/citas/{id}/cancelar/`

Pueden cancelar:
- **CLIENTE**: Sus propias citas
- **PELUQUERO**: Citas asignadas a él

**Respuesta (200 OK):**
```json
{
  "message": "Cita cancelada exitosamente"
}
```

**Errores:**
- `403`: No tienes permiso para cancelar esta cita
- `400`: La cita ya está cancelada

### 5. Confirmar Cita (Solo PELUQUERO)
**POST** `/citas/{id}/confirmar/`

Solo el peluquero asignado puede confirmar.

**Respuesta (200 OK):**
```json
{
  "message": "Cita confirmada exitosamente"
}
```

**Errores:**
- `403`: No tienes permiso para confirmar esta cita
- `400`: La cita ya está confirmada / cancelada

### 6. Mis Citas
**GET** `/citas/mis_citas/`

Devuelve todas las citas del usuario autenticado:
- **CLIENTE**: Citas donde eres el cliente
- **PELUQUERO**: Citas donde eres el peluquero

**Respuesta:** Igual que listar citas

### 7. Consultar Disponibilidad
**GET** `/citas/disponibilidad/?peluquero_id=2&fecha=2025-11-15`

Muestra horarios laborales y citas ocupadas de un peluquero en una fecha.

**Query params (requeridos):**
- `peluquero_id`: ID del peluquero
- `fecha`: Fecha en formato YYYY-MM-DD

**Respuesta (200 OK):**
```json
{
  "peluquero_id": "2",
  "fecha": "2025-11-15",
  "dia": "Viernes",
  "horarios_laborales": [
    {
      "hora_inicio": "09:00:00",
      "hora_fin": "18:00:00"
    }
  ],
  "citas_ocupadas": [
    {
      "hora_inicio": "10:00:00",
      "hora_fin": "11:00:00"
    }
  ]
}
```

---

## Permisos por Rol

### CLIENTE
✅ Puede:
- Agendar citas (POST /citas/)
- Ver sus propias citas
- Cancelar sus propias citas
- Consultar disponibilidad de peluqueros
- Ver horarios de todos los peluqueros

❌ No puede:
- Ver citas de otros clientes
- Confirmar citas
- Gestionar horarios

### PELUQUERO
✅ Puede:
- Ver citas asignadas a él
- Confirmar citas asignadas
- Cancelar citas asignadas
- Crear/editar sus propios horarios
- Ver horarios de otros peluqueros

❌ No puede:
- Ver citas de otros peluqueros
- Agendar citas como cliente (debe usar cuenta de cliente)
- Editar horarios de otros peluqueros

---

## Flujos de Uso

### Flujo: Cliente Agenda una Cita

1. **Cliente consulta horarios del peluquero**
   ```bash
   GET /horarios/?peluquero_id=2
   ```

2. **Cliente consulta disponibilidad en una fecha**
   ```bash
   GET /citas/disponibilidad/?peluquero_id=2&fecha=2025-11-15
   ```

3. **Cliente agenda la cita**
   ```bash
   POST /citas/
   Body: {"peluquero_id": 2, "fecha": "2025-11-15", "hora_inicio": "10:00:00", "hora_fin": "11:00:00"}
   ```

4. **Sistema valida:**
   - Peluquero trabaja ese día
   - Hora dentro del horario laboral
   - No hay conflicto con otras citas
   - Duración mínima cumplida

5. **Cita creada con estado PENDIENTE**

### Flujo: Peluquero Confirma Cita

1. **Peluquero ve sus citas**
   ```bash
   GET /citas/mis_citas/
   ```

2. **Peluquero confirma una cita**
   ```bash
   POST /citas/1/confirmar/
   ```

3. **Estado cambia a CONFIRMADA**

### Flujo: Gestión de Horarios

1. **Peluquero define su horario semanal**
   ```bash
   POST /horarios/
   Body: {"dia": "Lunes", "hora_inicio": "09:00", "hora_fin": "18:00"}
   ```

2. **Repetir para cada día laborable**

3. **Cliente puede ver esos horarios**
   ```bash
   GET /horarios/?peluquero_id=2
   ```

---

## Configuración

### settings.py
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

### Servidor de Desarrollo
```powershell
cd d:\Plataformas\V1\PelusaSPA\citas_service
D:/Plataformas/V1/PelusaSPA/venv/Scripts/python.exe manage.py runserver 8002
```

Servidor: **http://127.0.0.1:8002/**

---

## Integración con usuario_service

### Validación de Usuarios
Los endpoints validan los IDs de cliente/peluquero contra `usuario_service:8001`.

**TODO en producción:**
Descomentar las validaciones en `serializers.py`:
```python
response = requests.get(
    f"{settings.USUARIO_SERVICE_URL}/usuarios/{value}/",
    headers={'Authorization': f'Bearer {token}'}
)
```

### Obtener Token JWT
1. Registrar usuario en usuario_service (puerto 8001)
2. Login para obtener access token
3. Usar ese token en citas_service (puerto 8002)

---

## Pruebas con curl

### 1. Peluquero crea horario
```powershell
curl -X POST http://127.0.0.1:8002/horarios/ `
  -H "Authorization: Bearer <PELUQUERO_TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{\"dia\":\"Lunes\",\"hora_inicio\":\"09:00:00\",\"hora_fin\":\"18:00:00\"}'
```

### 2. Cliente consulta disponibilidad
```powershell
curl -X GET "http://127.0.0.1:8002/citas/disponibilidad/?peluquero_id=2&fecha=2025-11-15" `
  -H "Authorization: Bearer <CLIENTE_TOKEN>"
```

### 3. Cliente agenda cita
```powershell
curl -X POST http://127.0.0.1:8002/citas/ `
  -H "Authorization: Bearer <CLIENTE_TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{\"peluquero_id\":2,\"fecha\":\"2025-11-15\",\"hora_inicio\":\"10:00:00\",\"hora_fin\":\"11:00:00\",\"notas\":\"Corte\"}'
```

### 4. Peluquero confirma
```powershell
curl -X POST http://127.0.0.1:8002/citas/1/confirmar/ `
  -H "Authorization: Bearer <PELUQUERO_TOKEN>"
```

### 5. Cliente cancela
```powershell
curl -X POST http://127.0.0.1:8002/citas/1/cancelar/ `
  -H "Authorization: Bearer <CLIENTE_TOKEN>"
```

---

## Migraciones

Ya aplicadas. Para resetear:
```powershell
cd d:\Plataformas\V1\PelusaSPA\citas_service
Remove-Item .\db.sqlite3
Remove-Item .\citas\migrations\0*.py
D:/Plataformas/V1/PelusaSPA/venv/Scripts/python.exe manage.py makemigrations
D:/Plataformas/V1/PelusaSPA/venv/Scripts/python.exe manage.py migrate
```

---

## Estados de Cita

| Estado | Descripción |
|--------|-------------|
| **PENDIENTE** | Cita creada por el cliente, esperando confirmación |
| **CONFIRMADA** | Peluquero ha confirmado la cita |
| **CANCELADA** | Cliente o peluquero han cancelado |

---

## Arquitectura de Microservicios

```
┌─────────────────┐         ┌─────────────────┐
│ usuario_service │         │  citas_service  │
│   (Puerto 8001) │         │  (Puerto 8002)  │
├─────────────────┤         ├─────────────────┤
│ - User          │         │ - Cita          │
│ - Cuenta        │◄────────│ - Horario       │
│ - Persona       │  valida │                 │
│ - Cliente       │  tokens │                 │
│ - Peluquero     │         │                 │
└─────────────────┘         └─────────────────┘
```

**Comunicación:**
- `citas_service` valida JWT emitidos por `usuario_service`
- `citas_service` consulta datos de usuarios vía HTTP (en producción)
- Ambos servicios son independientes pero comparten autenticación JWT

---

## Próximos Pasos

1. ✅ Sistema de autenticación JWT (usuario_service) - COMPLETO
2. ✅ Gestión de horarios (citas_service) - COMPLETO
3. ✅ Agendamiento de citas (citas_service) - COMPLETO
4. ✅ Permisos por rol - COMPLETO
5. 🔲 Frontend para consumir APIs
6. 🔲 Notificaciones por email/SMS
7. 🔲 Integración con Kong API Gateway
8. 🔲 Docker Compose para orquestar servicios
