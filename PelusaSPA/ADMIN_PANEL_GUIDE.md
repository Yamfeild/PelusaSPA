# Admin Panel - Guía de Implementación

## Resumen de cambios completados

### 1. **Panel de Administración (AdminPanel.tsx)**
   - Ubicación: `pages/AdminPanel.tsx`
   - Protección: Solo accesible para usuarios con `rol='ADMIN'`
   - Funcionalidades:
     - ✅ Formulario para registrar nuevos peluqueros
     - ✅ Lista de peluqueros registrados con información completa
     - ✅ Campos del formulario: username, email, contraseña, nombre, apellido, teléfono, especialidad, experiencia
     - ✅ Validación de campos requeridos
     - ✅ Mensajes de éxito y error

### 2. **Servicio de Administración (adminService.ts)**
   - Ubicación: `services/adminService.ts`
   - Métodos:
     - `registrarPeluquero(data)`: POST `/registro/` con `rol='PELUQUERO'`
     - `getPeluqueros()`: GET `/usuarios/peluqueros/`
     - `getPeluquero(id)`: GET `/usuarios/{id}/`
   - Interfaces TypeScript para type-safety

### 3. **Enrutamiento (App.tsx)**
   - Ruta: `/admin` (protegida)
   - Componente: `AdminPanel`
   - Protección: Requiere autenticación

### 4. **Navegación (Header.tsx)**
   - Link "Panel Admin" visible solo para usuarios con `rol='ADMIN'`
   - Desktop: Visible en menú de navegación principal
   - Mobile: Visible en menú desplegable

### 5. **Carga Dinámica de Servicios (BookAppointment.tsx)**
   - Cambios:
     - Eliminado mock data hardcodeado de servicios
     - Servicios ahora cargados dinámicamente desde API: `/api/servicios/`
     - Uso correcto de campos: `nombre`, `duracion_minutos`, `precio`
     - Icono spa reemplazando imágenes
     - Integración con citasService.getServicios()

### 6. **Modelo Servicio (Backend)**
   - Archivo: `citas_service/citas/models.py`
   - Campos: nombre, descripcion, duracion_minutos, precio, activo, timestamps
   - Serializer: ServicioSerializer (read_only timestamps)
   - ViewSet: ServicioViewSet (ReadOnly, AllowAny, filter activo=True)
   - Migración: Aplicada exitosamente

### 7. **Servicios Iniciales Creados**
   Cinco servicios predefinidos en base de datos:
   - Baño y Secado (60 min - €25.00)
   - Corte de Pelo (90 min - €35.00)
   - Combo Completo (120 min - €50.00)
   - Deslanado (45 min - €20.00)
   - Limpieza de Oídos (20 min - €10.00)

## Flujo de uso

### Para Administrador:
1. Iniciar sesión con cuenta ADMIN
2. En Header, hacer clic en "Panel Admin"
3. Ver lista de peluqueros registrados
4. Hacer clic en "+ Registrar Nuevo Peluquero"
5. Completar formulario con datos del peluquero
6. Hacer clic en "Registrar Peluquero"
7. Confirmación de éxito
8. Lista se actualiza automáticamente

### Para Cliente:
1. Al reservar cita, paso 1 muestra servicios reales desde API
2. Seleccionar servicio
3. Precio y duración se muestran dinámicamente
4. Proceder con reserva normal

## Validaciones Backend

El endpoint `/registro/` en usuario_service valida:
- Solo ADMIN puede registrar PELUQUERO o ADMIN
- Campo `rol='PELUQUERO'` obligatorio
- Crear automáticamente Persona y Perfil de Peluquero
- Devolver datos completos con persona y perfil anidados

## Puntos de integración

- **Kong Gateway**: Enruta `/registro/` y `/usuarios/` al usuario_service:8001
- **Kong Gateway**: Enruta `/servicios/` al citas_service:8002
- **JWT Auth**: adminService usa authApi que incluye token automáticamente
- **Database**: SQLite con modelos Servicio, User, Persona, Peluquero

## Archivos modificados

1. ✅ `pages/AdminPanel.tsx` (NUEVO)
2. ✅ `services/adminService.ts` (NUEVO)
3. ✅ `App.tsx` - Agregada ruta /admin
4. ✅ `components/Header.tsx` - Agregado link Panel Admin
5. ✅ `pages/BookAppointment.tsx` - Integración servicios reales
6. ✅ `services/citasService.ts` - Agregado Servicio interface + getServicios()
7. ✅ `services/index.ts` - Exportado adminService
8. ✅ Backend: Migración Servicio aplicada
9. ✅ Backend: Servicios iniciales creados

## Pruebas recomendadas

1. Crear usuario ADMIN
2. Hacer login como ADMIN
3. Acceder a `/admin`
4. Registrar nuevo peluquero
5. Verificar en `/usuarios/peluqueros/` que aparece el nuevo peluquero
6. Hacer login como cliente
7. Ir a reservar cita
8. Verificar que servicios se cargan dinámicamente
9. Seleccionar servicio y completar reserva

## Notas técnicas

- AdminPanel verifica `user.rol === 'ADMIN'` en useEffect
- Si no es admin, redirige a `/dashboard`
- Formulario tiene campos opcionales (teléfono, especialidad, experiencia)
- Estado de éxito/error se muestra en alertas visibles
- Servicios filtran solo activos (`activo=True`)
- Validación de duración mínima: 30 minutos
