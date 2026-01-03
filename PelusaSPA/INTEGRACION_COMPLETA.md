# 🐕 Sistema Completo de Peluquería Canina

## Resumen de la Integración

Se ha implementado completamente la integración entre el frontend y los microservicios backend. El sistema ahora está funcional y listo para usar.

## 📁 Estructura del Proyecto

```
PelusaSPA/
├── peluquería-canina/        # 🎨 Frontend (React + TypeScript)
│   ├── services/             # Servicios API integrados
│   ├── context/              # AuthContext con JWT
│   ├── pages/                # Páginas actualizadas con API
│   └── .env.local            # Configuración de URLs de API
├── usuario_service/          # 🔐 Backend - Autenticación
├── citas_service/            # 📅 Backend - Citas y Mascotas
└── docker-compose.yml        # Orquestación de servicios
```

## ✅ Funcionalidades Implementadas

### 🔐 Autenticación
- Login con email y contraseña
- Registro de nuevos clientes
- Tokens JWT (access + refresh)
- Auto-renovación de tokens
- Persistencia de sesión
- Rutas protegidas

### 👤 Gestión de Perfil
- Visualización de datos del usuario
- Información de persona asociada
- Edición de perfil (próximamente)

### 🐾 Gestión de Mascotas
- Listar mascotas del cliente
- Registrar nueva mascota (nombre, especie, raza, edad, peso, observaciones)
- Editar información de mascota
- Eliminar mascota
- Validaciones de formulario

### 📅 Gestión de Citas
- Visualizar citas próximas
- Ver historial de citas
- Estados: Pendiente, Confirmada, Finalizada, Cancelada
- Cancelar cita
- Reagendar cita
- Información detallada de cada cita

## 🚀 Cómo Iniciar el Sistema Completo

### Opción 1: Inicio Rápido (Recomendado)

#### Paso 1: Iniciar los Microservicios Backend
```powershell
cd d:\Plataformas\V1\PelusaSPA
docker-compose up -d
```

Espera a que los contenedores estén listos (30-60 segundos).

#### Paso 2: Iniciar el Frontend
```powershell
cd peluquería-canina
.\start-frontend.ps1
```

El script automáticamente:
- Instalará dependencias si es necesario
- Verificará que los microservicios estén corriendo
- Iniciará el servidor de desarrollo

#### Paso 3: Acceder a la Aplicación
Abre tu navegador en: **http://localhost:5173**

### Opción 2: Inicio Manual

#### Backend:
```powershell
cd d:\Plataformas\V1\PelusaSPA
docker-compose up -d
```

#### Frontend:
```powershell
cd peluquería-canina
npm install
npm run dev
```

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:5173
- **Usuario Service API**: http://localhost:8001/api/
- **Citas Service API**: http://localhost:8002/api/
- **Usuario Service Admin**: http://localhost:8001/admin/
- **Citas Service Admin**: http://localhost:8002/admin/

## 👥 Usuarios de Prueba

### Para crear un usuario administrador:
```powershell
docker exec -it usuario_service python manage.py crear_admin
```

### Para registrar un cliente:
- Ve a http://localhost:5173/#/login
- Haz clic en la pestaña "Registrarse"
- Completa el formulario

## 📖 Guía de Uso para Clientes

### 1. Registro e Inicio de Sesión
1. Accede a la aplicación
2. Haz clic en "Iniciar Sesión"
3. Si no tienes cuenta, selecciona "Registrarse"
4. Completa el formulario con tus datos:
   - Nombre y apellidos
   - Nombre de usuario
   - Email
   - Teléfono (opcional)
   - Contraseña

### 2. Registrar tu Primera Mascota
1. Desde el Dashboard, haz clic en "Añadir" en la sección "Mis Mascotas"
2. Completa los datos:
   - Nombre de la mascota (obligatorio)
   - Tipo de animal (Perro, Gato, Otro)
   - Raza (opcional)
   - Edad y peso (opcional)
   - Consideraciones especiales (alergias, comportamiento, etc.)
3. Haz clic en "Guardar Mascota"

### 3. Agendar una Cita
1. Desde el Dashboard, haz clic en "Agendar cita"
2. Selecciona:
   - La mascota
   - El servicio
   - El peluquero
   - Fecha y hora
3. Confirma la cita

### 4. Gestionar tus Citas
- **Ver próximas citas**: En el Dashboard, pestaña "Próximas Citas"
- **Ver historial**: Pestaña "Historial de Citas"
- **Cancelar cita**: Botón "Cancelar" en cada cita próxima
- **Reagendar**: Botón "Reprogramar" para cambiar fecha/hora

## 🔧 Configuración Técnica

### Variables de Entorno (.env.local)
```env
VITE_API_USUARIOS_URL=http://localhost:8001/api
VITE_API_CITAS_URL=http://localhost:8002/api
```

### Servicios API Implementados

#### `authService.ts`
- `login(credentials)` - Iniciar sesión
- `register(data)` - Registrar usuario
- `getProfile()` - Obtener perfil
- `refreshToken(token)` - Refrescar token
- `logout()` - Cerrar sesión

#### `mascotasService.ts`
- `getMascotas()` - Listar mascotas
- `getMascota(id)` - Obtener una mascota
- `createMascota(data)` - Crear mascota
- `updateMascota(id, data)` - Actualizar mascota
- `deleteMascota(id)` - Eliminar mascota

#### `citasService.ts`
- `getCitas()` - Listar citas
- `getCita(id)` - Obtener una cita
- `createCita(data)` - Crear cita
- `cancelarCita(id)` - Cancelar cita
- `reagendarCita(id, data)` - Reagendar cita
- `getHorarios()` - Obtener horarios disponibles

## 🛠️ Solución de Problemas

### El frontend no se conecta al backend
1. Verifica que los contenedores estén corriendo:
   ```powershell
   docker ps
   ```
2. Verifica los logs:
   ```powershell
   docker-compose logs usuario_service
   docker-compose logs citas_service
   ```
3. Verifica las URLs en `.env.local`

### Error de CORS
- Los backends ya están configurados con `CORS_ALLOW_ALL_ORIGINS = True` para desarrollo
- Si persiste, verifica que las URLs en `.env.local` sean correctas

### Error 401 (No autorizado)
- El token puede haber expirado
- Cierra sesión y vuelve a iniciar sesión
- El sistema intenta auto-renovar tokens automáticamente

### No se instalan las dependencias
```powershell
cd peluquería-canina
rm -r node_modules
rm package-lock.json
npm install
```

## 📊 Arquitectura del Sistema

```
┌─────────────────┐
│   Frontend      │
│  (React + TS)   │
│  Puerto: 5173   │
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
         v              v              v
┌────────────────┐ ┌──────────────┐ ┌────────────┐
│ Usuario Service│ │Citas Service │ │   Kong     │
│   Django REST  │ │ Django REST  │ │  Gateway   │
│  Puerto: 8001  │ │Puerto: 8002  │ │Puerto: 8000│
└────────┬───────┘ └──────┬───────┘ └────────────┘
         │                │
         v                v
    ┌────────┐      ┌─────────┐
    │SQLite  │      │ SQLite  │
    │usuarios│      │  citas  │
    └────────┘      └─────────┘
```

## 📝 Próximas Funcionalidades

- [ ] Agendar citas desde el frontend
- [ ] Editar perfil de usuario
- [ ] Subir fotos de mascotas
- [ ] Notificaciones de citas
- [ ] Historial de servicios
- [ ] Valoraciones y reseñas

## 📄 Documentación Adicional

- [README_FRONTEND.md](peluquería-canina/README_FRONTEND.md) - Documentación detallada del frontend
- [README_AUTH.md](usuario_service/README_AUTH.md) - Documentación del servicio de usuarios
- [README_CITAS.md](citas_service/README_CITAS.md) - Documentación del servicio de citas
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Guía de Docker

## 🎉 ¡Listo para Usar!

El sistema está completamente integrado y funcional. Puedes:
1. Registrar usuarios
2. Iniciar sesión
3. Gestionar mascotas
4. Ver y gestionar citas
5. Todo con autenticación JWT segura

---

**Desarrollado con ❤️ para Peluquería Canina**
