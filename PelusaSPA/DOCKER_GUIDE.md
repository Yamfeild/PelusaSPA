# Guía de Despliegue con Docker

## 🐳 Sistema Completo con Docker Compose

Este proyecto incluye configuración completa de Docker Compose para levantar todos los microservicios.

## Servicios Incluidos

1. **usuario_service** (puerto 8001)
   - Autenticación JWT
   - Gestión de usuarios (Cliente, Peluquero, Admin)
   - Perfiles de persona

2. **citas_service** (puerto 8002)
   - Gestión de citas
   - Horarios de peluqueros
   - Validaciones de disponibilidad

3. **kong** (puerto 8000)
   - API Gateway
   - Enrutamiento unificado
   - Admin API (puerto 8443)

## 🚀 Inicio Rápido

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Iniciar todos los servicios
.\docker-start.ps1

# Ejecutar pruebas automáticas
.\docker-test.ps1
```

### Opción 2: Manual

```powershell
# Construir imágenes
docker-compose build

# Iniciar servicios en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f usuario_service
docker-compose logs -f citas_service
docker-compose logs -f kong

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (resetear BD)
docker-compose down -v
```

## 📡 URLs de Acceso

### Acceso Directo a Servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Usuario Service | http://localhost:8001 | Servicio directo |
| Citas Service | http://localhost:8002 | Servicio directo |
| Kong Gateway | http://localhost:8000 | API Gateway (recomendado) |
| Kong Admin | http://localhost:8443 | Admin de Kong |

### Endpoints via Kong Gateway (Recomendado)

**Autenticación:**
- POST `http://localhost:8000/api/auth/registro/` - Registrar usuario
- POST `http://localhost:8000/api/auth/login/` - Login
- POST `http://localhost:8000/api/auth/token/refresh/` - Refrescar token
- GET `http://localhost:8000/api/auth/perfil/` - Ver perfil

**Usuarios:**
- GET `http://localhost:8000/api/usuarios/{id}/` - Ver usuario
- GET `http://localhost:8000/api/usuarios/me/` - Mi perfil
- GET `http://localhost:8000/api/usuarios/?rol=PELUQUERO` - Listar peluqueros
- GET `http://localhost:8000/api/usuarios/peluqueros/` - Listar peluqueros (atajo)

**Mascotas:**
- GET `http://localhost:8000/api/mascotas/` - Listar mis mascotas
- POST `http://localhost:8000/api/mascotas/` - Registrar mascota
- GET `http://localhost:8000/api/mascotas/{id}/` - Ver detalle
- PUT `http://localhost:8000/api/mascotas/{id}/` - Actualizar
- DELETE `http://localhost:8000/api/mascotas/{id}/` - Eliminar

**Citas:**
- GET `http://localhost:8000/api/citas/` - Listar citas
- POST `http://localhost:8000/api/citas/` - Agendar cita
- GET `http://localhost:8000/api/citas/{id}/` - Ver detalle
- POST `http://localhost:8000/api/citas/{id}/cancelar/` - Cancelar
- POST `http://localhost:8000/api/citas/{id}/confirmar/` - Confirmar
- GET `http://localhost:8000/api/citas/mis_citas/` - Mis citas
- GET `http://localhost:8000/api/citas/disponibilidad/` - Consultar disponibilidad

**Horarios:**
- GET `http://localhost:8000/api/horarios/` - Listar horarios
- POST `http://localhost:8000/api/horarios/` - Crear horario
- PUT `http://localhost:8000/api/horarios/{id}/` - Actualizar
- DELETE `http://localhost:8000/api/horarios/{id}/` - Eliminar

> Nota importante sobre URLs: en Django REST Framework las rutas de detalle terminan con `/`.
> Para operaciones como PUT/DELETE usa siempre la barra final (ej. `/api/mascotas/2/`).

Ejemplos CRUD Horarios (ADMIN):

```powershell
# Actualizar horario (PUT)
curl -X PUT http://localhost:8000/api/horarios/1/ `
  -H "Authorization: Bearer TOKEN_ADMIN" `
  -H "Content-Type: application/json" `
  -d '{
    "peluquero_id": 2,
    "dia": "Lunes",
    "hora_inicio": "10:00:00",
    "hora_fin": "19:00:00",
    "activo": true
  }'

# Eliminación (DELETE)
curl -X DELETE http://localhost:8000/api/horarios/1/ `
  -H "Authorization: Bearer TOKEN_ADMIN"
```

Ejemplos CRUD Citas:

```powershell
# Listar mis citas (cliente/peluquero)
curl -X GET http://localhost:8000/api/citas/ `
  -H "Authorization: Bearer TOKEN"

# Ver detalle
curl -X GET http://localhost:8000/api/citas/1/ `
  -H "Authorization: Bearer TOKEN"

# Actualizar cita (solo ADMIN)
curl -X PATCH http://localhost:8000/api/citas/1/ `
  -H "Authorization: Bearer TOKEN_ADMIN" `
  -H "Content-Type: application/json" `
  -d '{ "notas": "Cambio de observación" }'

# Eliminar cita (solo ADMIN)
curl -X DELETE http://localhost:8000/api/citas/1/ `
  -H "Authorization: Bearer TOKEN_ADMIN"
```

## 🧪 Pruebas Manuales con curl

### 0. Credenciales de Administrador

```
Username: admin
Password: admin123
Email: admin@peluqueria.com
Rol: ADMIN
```

### 1. Login como Administrador

```powershell
curl -X POST http://localhost:8000/api/auth/login/ `
  -H "Content-Type: application/json" `
  -d '{
    "usuario": "admin",
    "clave": "admin123"
  }'
```

Guarda el `access` token de la respuesta.

### 2. Registrar Peluquero (requiere token de ADMIN)

```powershell
curl -X POST http://localhost:8000/api/auth/registro/ `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer TOKEN_ADMIN_AQUI" `
  -d '{
    "username": "carlos_peluquero",
    "correo": "carlos@peluqueria.com",
    "clave": "Password123!",
    "rol": "PELUQUERO",
    "nombre": "Carlos",
    "apellido": "Martínez",
    "fecha_nacimiento": "1985-03-20",
    "telefono": "3009876543",
    "especialidad": "Corte y Barba",
    "experiencia": "5 años"
  }'
```

### 3. Registrar Cliente (sin autenticación)

```powershell
curl -X POST http://localhost:8000/api/auth/registro/ `
  -H "Content-Type: application/json" `
  -d '{
    "username": "cliente1",
    "correo": "cliente1@test.com",
    "clave": "Password123!",
    "clave_confirmacion": "Password123!",
    "nombre": "Juan",
    "apellido": "Pérez",
    "fecha_nacimiento": "1990-05-15",
    "telefono": "0999123456",
    "identificacion": "1234567890",
    "rol": "CLIENTE",
    "direccion": "Av. Principal 123"
  }'
```

### 4. Admin Crea Horario para Peluquero

```powershell
# Login como admin y obtener token
curl -X POST http://localhost:8000/api/horarios/ `
  -H "Authorization: Bearer TOKEN_ADMIN" `
  -H "Content-Type: application/json" `
  -d '{
    "peluquero_id": 2,
    "dia": "Lunes",
    "hora_inicio": "09:00:00",
    "hora_fin": "18:00:00",
    "activo": true
  }'
```

### 5. Cliente Registra Mascota

```powershell
# Login como cliente y obtener token
curl -X POST http://localhost:8000/api/mascotas/ `
  -H "Authorization: Bearer TOKEN_CLIENTE" `
  -H "Content-Type: application/json" `
  -d '{
    "nombre": "Bobby",
    "raza": "Golden Retriever",
    "edad": 3
  }'
```

Guarda el `id` de la mascota de la respuesta.

### 6. Cliente Agenda Cita para su Mascota

```powershell
curl -X POST http://localhost:8000/api/citas/ `
  -H "Authorization: Bearer TOKEN_CLIENTE" `
  -H "Content-Type: application/json" `
  -d '{
    "mascota": 1,
    "peluquero_id": 2,
    "fecha": "2025-11-18",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "notas": "Baño y corte de pelo"
  }'
```

### 7. Consultas rápidas (Listados)

```powershell
# Listar peluqueros (requiere cualquier token válido)
curl -X GET http://localhost:8000/api/usuarios/peluqueros/ `
  -H "Authorization: Bearer TU_TOKEN"

# Alternativa por query param
curl -X GET "http://localhost:8000/api/usuarios/?rol=PELUQUERO" `
  -H "Authorization: Bearer TU_TOKEN"

# Listar horarios del peluquero con ID=2
curl -X GET "http://localhost:8000/api/horarios/?peluquero_id=2" `
  -H "Authorization: Bearer TU_TOKEN"

# Listar citas asignadas al peluquero autenticado (usar token de PELUQUERO)
curl -X GET http://localhost:8000/api/citas/ `
  -H "Authorization: Bearer TOKEN_PELUQUERO"

# (Opcional) Mis citas, también funciona para CLIENTE/PELUQUERO
curl -X GET http://localhost:8000/api/citas/mis_citas/ `
  -H "Authorization: Bearer TOKEN"
```

## 📊 Monitoreo

### Ver Estado de Contenedores

```powershell
docker-compose ps
```

### Ver Logs en Tiempo Real

```powershell
# Todos los servicios
docker-compose logs -f

# Solo un servicio
docker-compose logs -f usuario_service
docker-compose logs -f citas_service
docker-compose logs -f kong
```

### Entrar a un Contenedor

```powershell
# Usuario service
docker exec -it usuario_service sh

# Citas service
docker exec -it citas_service sh

# Dentro del contenedor puedes ejecutar:
python manage.py shell
python manage.py createsuperuser
```

## 🔧 Troubleshooting

### Los servicios no inician

```powershell
# Ver logs detallados
docker-compose logs

# Verificar que no haya conflictos de puertos
netstat -ano | findstr :8001
netstat -ano | findstr :8002
netstat -ano | findstr :8000
```

### Resetear todo

```powershell
# Detener y eliminar todo (incluyendo volúmenes)
docker-compose down -v

# Limpiar imágenes
docker-compose down --rmi all

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up -d
```

### Problemas con migraciones

```powershell
# Entrar al contenedor
docker exec -it usuario_service sh

# Ejecutar migraciones manualmente
python manage.py makemigrations
python manage.py migrate

# Salir
exit
```

### Kong no enruta correctamente

```powershell
# Verificar configuración de Kong
curl http://localhost:8443/services

# Reiniciar Kong
docker-compose restart kong
```

## 🗂️ Persistencia de Datos

Los datos se almacenan en volúmenes de Docker:
- `usuario_db` - Base de datos de usuarios
- `citas_db` - Base de datos de citas

Para eliminar datos:
```powershell
docker-compose down -v
```

Para hacer backup:
```powershell
# Backup de usuario_service
docker cp usuario_service:/app/db_data/db.sqlite3 ./backup_usuarios.db

# Backup de citas_service
docker cp citas_service:/app/db_data/db.sqlite3 ./backup_citas.db
```

## 🌐 Arquitectura de Red

Los servicios se comunican a través de la red `peluqueria_network`:

```
┌────────────────────────────────────┐
│         Kong Gateway               │
│         (puerto 8000)              │
└────────┬──────────────┬────────────┘
         │              │
    ┌────▼─────┐   ┌────▼─────┐
    │ usuario  │   │  citas   │
    │ service  │   │ service  │
    │  :8001   │   │  :8002   │
    └──────────┘   └──────────┘
```

## 📝 Variables de Entorno

Puedes personalizar el comportamiento creando un archivo `.env`:

```env
# .env
DEBUG=True
SECRET_KEY=tu-clave-secreta
ALLOWED_HOSTS=*
DATABASE_URL=sqlite:///db.sqlite3
```

## 🚀 Producción

Para producción, considera:

1. **Usar PostgreSQL en lugar de SQLite**
2. **Configurar HTTPS en Kong**
3. **Usar Gunicorn/uWSGI en lugar de runserver**
4. **Configurar variables de entorno seguras**
5. **Implementar rate limiting en Kong**
6. **Configurar logs centralizados**

Ejemplo de producción:

```yaml
# docker-compose.prod.yml
services:
  usuario_service:
    command: gunicorn usuario_service.wsgi:application --bind 0.0.0.0:8001
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://user:pass@db:5432/usuarios
```

## 📚 Recursos Adicionales

- [Documentación Django](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Kong Gateway](https://docs.konghq.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## ⚡ Comandos Útiles

```powershell
# Reconstruir un servicio específico
docker-compose build usuario_service

# Escalar un servicio (múltiples instancias)
docker-compose up -d --scale usuario_service=2

# Ver uso de recursos
docker stats

# Limpiar recursos no usados
docker system prune -a
```

## 🎯 Próximos Pasos

1. ✅ Servicios funcionando con Docker
2. 🔲 Implementar frontend (React/Vue)
3. 🔲 Agregar PostgreSQL para producción
4. 🔲 Configurar CI/CD
5. 🔲 Implementar monitoreo (Prometheus/Grafana)
6. 🔲 Agregar tests automatizados
