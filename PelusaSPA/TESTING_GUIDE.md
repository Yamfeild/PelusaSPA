# 🎯 Pasos para Probar el Sistema de Reserva de Citas

## Prerequisitos
- ✅ Servidor Vite ejecutándose en http://localhost:3001
- ✅ usuario_service ejecutándose en http://localhost:8001
- ✅ citas_service ejecutándose en http://localhost:8002
- ✅ Base de datos SQLite sincronizada

## Test Manual Completo

### Paso 1: Abrir el sitio web
1. Abre tu navegador en: http://localhost:3001
2. Deberías ver la página de inicio

### Paso 2: Crear una cuenta (Registro)
1. Click en "Registrarse" o ir a /register
2. Completa el formulario:
   - Username: `usuario_prueba_123`
   - Email: `prueba@example.com`
   - Contraseña: `Contraseña123!`
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - Fecha de nacimiento: `1995-05-15`
   - (Selecciona "Cliente" si hay opción de rol)
3. Haz click en "Registrarse"
4. ✅ Deberías ser redirigido a login

### Paso 3: Hacer Login
1. Ingresa tus credenciales:
   - Usuario: `usuario_prueba_123`
   - Contraseña: `Contraseña123!`
2. Haz click en "Iniciar Sesión"
3. ✅ Deberías ver el Dashboard con tu email

### Paso 4: Registrar una Mascota
1. En el Dashboard, haz click en "Mis Mascotas" o "Registrar Mascota"
2. Completa el formulario:
   - Nombre: `Firulais`
   - Especie: `Perro`
   - Raza: `Pastor Alemán`
   - Edad: `3`
3. Haz click en "Registrar"
4. ✅ La mascota debería aparecer en tu lista

### Paso 5: Agendar una Cita
1. Haz click en "Agendar Cita" o ir a /book
2. **Paso 1 - Seleccionar Servicio**:
   - Deberías ver servicios como:
     - Baño y Secado
     - Corte de Pelo
     - Limpieza de Oídos
     - etc.
   - Selecciona uno, por ejemplo "Baño y Secado"
   - Haz click "Siguiente"

3. **Paso 2 - Seleccionar Mascota**:
   - Deberías ver tu mascota "Firulais"
   - Selecciónala
   - Haz click "Siguiente"

4. **Paso 3 - Seleccionar Peluquero**:
   - Deberías ver peluqueros disponibles
   - Selecciona uno
   - Haz click "Siguiente"

5. **Paso 4 - Seleccionar Fecha y Hora**:
   - Selecciona una fecha futura (no hoy)
   - Selecciona una hora (ej: 14:00)
   - Haz click "Siguiente"

6. **Paso 5 - Confirmación**:
   - Revisa los detalles:
     - Servicio: Baño y Secado
     - Mascota: Firulais
     - Peluquero: [nombre]
     - Fecha y Hora: [fecha] [hora]
   - Haz click "Confirmar y Agendar"

7. ✅ ¡CITA AGENDADA!
   - Deberías ser redirigido al Dashboard
   - Tu cita debería aparecer en "Mis Citas"

### Paso 6: Verificar la Cita
1. En el Dashboard, ve a "Mis Citas"
2. Deberías ver la cita que acabas de crear con:
   - Estado: PENDIENTE
   - Mascota: Firulais
   - Servicio: Baño y Secado
   - Fecha y Hora
   - Peluquero

## Mensajes de Éxito Esperados

| Acción | Mensaje Esperado |
|--------|------------------|
| Registro exitoso | "Usuario registrado correctamente" o redirige a login |
| Login exitoso | Dashboard visible con email del usuario |
| Mascota registrada | "Mascota registrada exitosamente" |
| Cita agendada | "¡Cita agendada exitosamente!" + Redirige a Dashboard |

## Errores Comunes y Soluciones

### Error: "No tienes permiso para realizar esta acción"
- **Causa**: El servidor no reconoce el rol CLIENTE
- **Solución**: Verifica que el JWT contiene `"rol": "CLIENTE"`
- **Debug**: Abre DevTools → Console → ve localStorage y decodifica el token

### Error: "Usuario no autenticado"
- **Causa**: El token JWT expiró o no se envió
- **Solución**: Haz logout y login nuevamente

### Error: "Mascota no encontrada"
- **Causa**: No hay mascotas registradas
- **Solución**: Registra una mascota primero en "Mis Mascotas"

### Error: "Servicio no disponible"
- **Causa**: No hay servicios en la BD
- **Solución**: Admin debe crear servicios en Panel de Admin

### Error: "No hay peluqueros disponibles"
- **Causa**: No hay peluqueros registrados
- **Solución**: Admin debe crear peluqueros y asignarles horarios

## Verificación Técnica (Console DevTools)

1. Abre DevTools: F12
2. Ve a la tab "Console"
3. Debería ver logs como:
   ```
   Cargando datos de reserva...
   Mascotas: [Array]
   Servicios: [Array]
   Peluqueros: [Array]
   ```

4. Ve a "Storage" → "LocalStorage" → http://localhost:3001
5. Deberías ver:
   - `token`: JWT token (comienza con `eyJ...`)
   - `user`: JSON con user info

## Decodificar JWT para Verificar Rol

1. Copia el token de localStorage
2. Ve a https://jwt.io
3. Pega el token en "Encoded"
4. En "Decoded" → "Payload", deberías ver:
   ```json
   {
     "token_type": "access",
     "exp": 1767...,
     "iat": 1767...,
     "jti": "...",
     "user_id": 19,
     "username": "usuario_prueba_123",
     "email": "prueba@example.com",
     "rol": "CLIENTE"
   }
   ```

## ✅ Todo Funciona Si...

- ✅ Puedes registrarte como CLIENTE
- ✅ Puedes hacer login
- ✅ Puedes registrar mascotas
- ✅ Puedes ver servicios disponibles
- ✅ Puedes agendar citas
- ✅ Tus citas aparecen en el dashboard
- ✅ No hay errores en la consola del navegador
- ✅ El JWT contiene `"rol": "CLIENTE"`

---

**¡Si todos los pasos funcionan, el sistema está 100% operacional! 🎉**
