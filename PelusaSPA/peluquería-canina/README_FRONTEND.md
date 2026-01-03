# Frontend - Peluquería Canina

Aplicación web del cliente para el sistema de gestión de peluquería canina.

## 🚀 Integración con Microservicios

Esta aplicación frontend está completamente integrada con los microservicios backend:
- **Usuario Service** (puerto 8001): Autenticación, registro y gestión de usuarios
- **Citas Service** (puerto 8002): Gestión de mascotas, citas y horarios

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Los microservicios backend deben estar corriendo

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (ya configurado en `.env.local`):
```env
VITE_API_USUARIOS_URL=http://localhost:8001/api
VITE_API_CITAS_URL=http://localhost:8002/api
```

## 🏃 Ejecución

### Modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Build para producción
```bash
npm run build
```

### Preview de producción
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
peluquería-canina/
├── components/          # Componentes reutilizables
│   ├── Header.tsx      # Navegación principal
│   ├── Footer.tsx      # Pie de página
│   └── Layout.tsx      # Layout principal
├── context/            # Context API de React
│   └── AuthContext.tsx # Contexto de autenticación
├── pages/              # Páginas de la aplicación
│   ├── Home.tsx        # Página de inicio
│   ├── Login.tsx       # Login y registro
│   ├── Dashboard.tsx   # Panel del cliente
│   ├── RegisterPet.tsx # Registro de mascotas
│   ├── EditPet.tsx     # Edición de mascotas
│   └── ...
├── services/           # Servicios API
│   ├── api.ts          # Configuración de Axios
│   ├── authService.ts  # Servicio de autenticación
│   ├── mascotasService.ts  # Servicio de mascotas
│   ├── citasService.ts # Servicio de citas
│   └── index.ts        # Re-exportaciones
└── types.ts            # Tipos TypeScript
```

## 🔐 Funcionalidades Implementadas

### Autenticación
- ✅ Login con email y contraseña
- ✅ Registro de nuevos clientes
- ✅ Gestión de tokens JWT (access y refresh)
- ✅ Auto-refresh de tokens expirados
- ✅ Rutas protegidas
- ✅ Persistencia de sesión

### Dashboard del Cliente
- ✅ Visualización de perfil
- ✅ Lista de mascotas registradas
- ✅ Citas próximas y historial
- ✅ Estados de citas (Pendiente, Confirmada, Finalizada, Cancelada)

### Gestión de Mascotas
- ✅ Registro de nuevas mascotas
- ✅ Edición de mascotas existentes
- ✅ Eliminación de mascotas
- ✅ Información detallada (nombre, especie, raza, edad, peso, observaciones)

### Gestión de Citas
- ✅ Visualización de citas
- ✅ Cancelación de citas
- ✅ Reagendamiento de citas
- ✅ Filtrado por estado (próximas/historial)

## 🔌 APIs Utilizadas

### Usuario Service (8001)
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/registro/` - Registrar nuevo usuario
- `GET /api/auth/perfil/` - Obtener perfil del usuario
- `POST /api/auth/token/refresh/` - Refrescar token

### Citas Service (8002)
- `GET /api/mascotas/` - Listar mascotas del usuario
- `POST /api/mascotas/` - Crear nueva mascota
- `PUT /api/mascotas/{id}/` - Actualizar mascota
- `DELETE /api/mascotas/{id}/` - Eliminar mascota
- `GET /api/citas/` - Listar citas del usuario
- `POST /api/citas/` - Crear nueva cita
- `POST /api/citas/{id}/cancelar/` - Cancelar cita
- `POST /api/citas/{id}/reagendar/` - Reagendar cita

## 🎨 Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **React Router** - Navegación
- **Tailwind CSS** - Estilos (configurado en el HTML)

## 📝 Notas de Desarrollo

### Manejo de Errores
- Los errores de autenticación (401) activan automáticamente el refresh de tokens
- Si el refresh falla, redirige al login
- Los errores se muestran en alertas visuales en cada página

### Estado de Carga
- Indicadores de carga en formularios
- Estados de carga en listados
- Prevención de múltiples envíos

### Seguridad
- Tokens almacenados en localStorage
- Headers de autorización automáticos
- Validación de sesión al cargar la app

## 🚀 Siguiente Pasos

Para iniciar todo el sistema completo:

1. Iniciar los microservicios backend:
```bash
cd ../..
docker-compose up -d
```

2. Iniciar el frontend:
```bash
npm run dev
```

3. Acceder a la aplicación en: `http://localhost:5173`

## 📞 Endpoints de Desarrollo

- Frontend: http://localhost:5173
- Usuario Service: http://localhost:8001
- Citas Service: http://localhost:8002
- Kong Gateway (si está configurado): http://localhost:8000
