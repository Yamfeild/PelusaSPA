# ✅ Checklist de Verificación de Integración

## Pre-requisitos
- [ ] Node.js 18+ instalado
- [ ] Docker Desktop instalado y corriendo
- [ ] Git instalado (opcional)

## Verificación de Backend

### 1. Microservicios Corriendo
```powershell
cd d:\Plataformas\V1\PelusaSPA
docker-compose up -d
```

Verificar que los contenedores estén corriendo:
```powershell
docker ps
```

Debe mostrar:
- [ ] usuario_service (puerto 8001)
- [ ] citas_service (puerto 8002)

### 2. APIs Respondiendo
Verificar en navegador o con curl:
- [ ] http://localhost:8001/api/ (debe responder)
- [ ] http://localhost:8002/api/ (debe responder)

### 3. Crear Usuario Admin (Opcional)
```powershell
docker exec -it usuario_service python manage.py crear_admin
```

## Verificación de Frontend

### 1. Dependencias Instaladas
```powershell
cd d:\Plataformas\V1\PelusaSPA\peluquería-canina
npm install
```

Verificar que se instaló axios:
- [ ] Revisar node_modules/axios existe
- [ ] No hay errores de instalación

### 2. Configuración de Entorno
Verificar archivo `.env.local`:
```env
VITE_API_USUARIOS_URL=http://localhost:8001/api
VITE_API_CITAS_URL=http://localhost:8002/api
```
- [ ] Archivo existe
- [ ] URLs correctas

### 3. Sin Errores de TypeScript
```powershell
npx tsc --noEmit
```
- [ ] Sin errores de compilación

### 4. Servidor de Desarrollo
```powershell
npm run dev
```
- [ ] Servidor inicia en http://localhost:5173
- [ ] Sin errores en consola

## Pruebas Funcionales

### Test 1: Registro de Usuario
1. [ ] Ir a http://localhost:5173/#/login
2. [ ] Click en pestaña "Registrarse"
3. [ ] Completar formulario:
   - Nombre: Juan
   - Apellidos: Pérez
   - Username: juanperez
   - Email: juan@test.com
   - Teléfono: +34123456789
   - Contraseña: test1234
4. [ ] Click en "Registrarse"
5. [ ] Debe redirigir a /dashboard
6. [ ] Se muestra el nombre del usuario

**Resultado esperado**: Usuario registrado y sesión iniciada ✅

### Test 2: Login
1. [ ] Cerrar sesión (botón en dashboard)
2. [ ] Ir a /login
3. [ ] Completar:
   - Email: juan@test.com
   - Contraseña: test1234
4. [ ] Click en "Iniciar Sesión"
5. [ ] Debe redirigir a /dashboard

**Resultado esperado**: Sesión iniciada correctamente ✅

### Test 3: Persistencia de Sesión
1. [ ] Con sesión iniciada, recargar página (F5)
2. [ ] Debe mantener la sesión
3. [ ] Cerrar pestaña y volver a abrir http://localhost:5173
4. [ ] Debe mantener la sesión

**Resultado esperado**: Sesión persiste en localStorage ✅

### Test 4: Rutas Protegidas
1. [ ] Cerrar sesión
2. [ ] Intentar acceder a http://localhost:5173/#/dashboard
3. [ ] Debe redirigir a /login

**Resultado esperado**: Rutas protegidas funcionan ✅

### Test 5: Registro de Mascota
1. [ ] Iniciar sesión
2. [ ] En Dashboard, click en "Añadir" (sección Mascotas)
3. [ ] Completar formulario:
   - Nombre: Rocky
   - Tipo: Perro
   - Raza: Golden Retriever
   - Edad: 5
   - Peso: 30
   - Observaciones: Muy juguetón
4. [ ] Click en "Guardar Mascota"
5. [ ] Debe volver al dashboard
6. [ ] La mascota debe aparecer en la lista

**Resultado esperado**: Mascota creada y visible ✅

### Test 6: Listado de Mascotas
1. [ ] En Dashboard, verificar sección "Mis Mascotas"
2. [ ] Debe mostrar "Rocky" con su información
3. [ ] Debe tener botón de editar

**Resultado esperado**: Mascotas se listan correctamente ✅

### Test 7: Manejo de Errores - Login Incorrecto
1. [ ] Cerrar sesión
2. [ ] Intentar login con credenciales incorrectas
3. [ ] Debe mostrar mensaje de error en rojo
4. [ ] No debe iniciar sesión

**Resultado esperado**: Errores se manejan correctamente ✅

### Test 8: Manejo de Errores - Backend Caído
1. [ ] Detener los contenedores: `docker-compose stop`
2. [ ] Intentar hacer login
3. [ ] Debe mostrar error de conexión
4. [ ] Reiniciar contenedores: `docker-compose start`

**Resultado esperado**: Errores de red se manejan ✅

### Test 9: Refresh de Token
1. [ ] Iniciar sesión
2. [ ] Esperar 5 minutos (o modificar tiempo de expiración del token)
3. [ ] Intentar realizar una acción (ej: recargar dashboard)
4. [ ] Debe refrescar token automáticamente
5. [ ] No debe cerrar sesión

**Resultado esperado**: Tokens se renuevan automáticamente ✅

### Test 10: Navegación
1. [ ] Con sesión iniciada, probar navegación:
   - [ ] Home → Login → Dashboard
   - [ ] Dashboard → Registrar Mascota → Dashboard
   - [ ] Dashboard → Servicios → Dashboard
2. [ ] Botones "Atrás" del navegador deben funcionar

**Resultado esperado**: Navegación fluida ✅

## Verificación de Consola

### En Navegador (F12 → Console)
- [ ] Sin errores en rojo
- [ ] Solo warnings normales de React (si hay)
- [ ] Peticiones API visibles en Network tab

### En Terminal del Frontend
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```
- [ ] Sin errores
- [ ] URL accesible

### En Logs de Docker
```powershell
docker-compose logs -f usuario_service
docker-compose logs -f citas_service
```
- [ ] Sin errores críticos
- [ ] Peticiones HTTP visibles
- [ ] Códigos de respuesta 200, 201, etc.

## Checklist de Archivos

### Nuevos Archivos Creados
- [ ] `services/api.ts`
- [ ] `services/authService.ts`
- [ ] `services/mascotasService.ts`
- [ ] `services/citasService.ts`
- [ ] `services/index.ts`
- [ ] `vite-env.d.ts`
- [ ] `start-frontend.ps1`
- [ ] `README_FRONTEND.md`
- [ ] `../INTEGRACION_COMPLETA.md`
- [ ] `../RESUMEN_INTEGRACION.md`

### Archivos Modificados
- [ ] `context/AuthContext.tsx`
- [ ] `pages/Login.tsx`
- [ ] `pages/Dashboard.tsx`
- [ ] `pages/RegisterPet.tsx`
- [ ] `App.tsx`
- [ ] `.env.local`
- [ ] `package.json`

## Resultado Final

### ✅ TODO CORRECTO
Si todos los checkboxes están marcados:
- Sistema completamente integrado
- Frontend y backend comunicándose
- Autenticación funcionando
- CRUD de mascotas funcional
- **¡LISTO PARA USAR!** 🎉

### ⚠️ HAY PROBLEMAS
Si algún checkbox no está marcado:
1. Revisar logs de errores
2. Verificar configuración
3. Consultar documentación en `INTEGRACION_COMPLETA.md`
4. Verificar que Docker esté corriendo
5. Verificar puertos no estén ocupados

## Comandos Útiles

### Reiniciar Todo
```powershell
# Detener todo
docker-compose down
# Iniciar de nuevo
docker-compose up -d
cd peluquería-canina
npm run dev
```

### Ver Logs
```powershell
# Backend
docker-compose logs -f usuario_service
docker-compose logs -f citas_service

# Frontend
# Ver en la terminal donde corre npm run dev
```

### Limpiar y Reinstalar
```powershell
cd peluquería-canina
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Verificar Base de Datos
```powershell
# Entrar al contenedor
docker exec -it usuario_service python manage.py shell

# Verificar usuarios
from usuarios.models import User
User.objects.all()
```

---

**Fecha de Verificación**: __________________

**Verificado por**: __________________

**Estado**: [ ] ✅ TODO OK  [ ] ⚠️ PROBLEMAS  [ ] ❌ NO FUNCIONA

**Notas adicionales**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
