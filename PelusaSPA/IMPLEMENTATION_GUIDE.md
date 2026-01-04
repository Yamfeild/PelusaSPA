# 📦 Guía de Implementación - Sistema de Reserva de Citas

## 🎯 Objetivo
Permitir que clientes autenticados agenden citas para sus mascotas con peluqueros disponibles.

## ✅ Estado Actual
**¡YA ESTÁ IMPLEMENTADO Y FUNCIONANDO!**

Solo si necesitas reproducir o replicar este cambio, sigue los pasos a continuación.

---

## 🔧 Cambios Técnicos - Resumen Ejecutivo

### El Problema Original
- Clientes no podían agendar citas
- Error: "no tiene permiso para realizar esta acción"
- El modelo Cita no tenía campo `servicio`
- El frontend enviaba datos en formato incorrecto

### La Solución
Implementamos campo `servicio` en el modelo Cita y aseguramos que:
1. El JWT contiene el rol del usuario
2. El backend valida que solo CLIENTE puede agendar
3. El frontend envía los datos correctamente

---

## 📋 Cambios Implementados (6 archivos modificados)

### 1. Backend Model - `citas_service/citas/models.py`

**Cambio:** Agregar campo `servicio` al modelo Cita

```python
from django.db import models

class Cita(models.Model):
    # ... campos existentes ...
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='citas')
    
    # ➕ NUEVO CAMPO
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE, related_name='citas', null=True, blank=True)
    
    peluquero_id = models.IntegerField(help_text="ID del peluquero desde usuario_service")
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    # ... resto de campos ...
```

**Ejecutar migración:**
```bash
docker exec citas_service python manage.py makemigrations
docker exec citas_service python manage.py migrate
```

### 2. Backend Serializers - `citas_service/citas/serializers.py`

**Cambio 1:** Actualizar `CitaSerializer`

```python
class CitaSerializer(serializers.ModelSerializer):
    # ... campos existentes ...
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True, allow_null=True)
    
    class Meta:
        model = Cita
        fields = [
            'id', 'mascota', 'mascota_nombre', 
            'servicio', 'servicio_nombre',  # ➕ NUEVOS
            'cliente_id', 'peluquero_id', 'fecha', 
            'hora_inicio', 'hora_fin', 'estado', 'estado_display',
            'notas', 'creada_en', 'actualizada_en'
        ]
```

**Cambio 2:** Actualizar `CitaCreateSerializer`

```python
class CitaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = [
            'mascota', 'servicio', 'peluquero_id', 'fecha',  # ➕ servicio
            'hora_inicio', 'hora_fin', 'notas'
        ]
    
    def validate_servicio(self, value):  # ➕ NUEVA VALIDACIÓN
        """Validar que el servicio existe y está activo."""
        if value and not value.activo:
            raise serializers.ValidationError("El servicio no está disponible")
        return value
```

**Cambio 3:** Actualizar `CitaDetailSerializer`

```python
class CitaDetailSerializer(serializers.ModelSerializer):
    # ... campos existentes ...
    servicio_info = ServicioSerializer(source='servicio', read_only=True, allow_null=True)
    
    class Meta:
        model = Cita
        fields = [
            'id', 'mascota', 'mascota_info', 
            'servicio', 'servicio_info',  # ➕ NUEVOS
            'cliente_id', 'peluquero_id', 'fecha', 
            'hora_inicio', 'hora_fin', 'estado', 'estado_display',
            'notas', 'creada_en', 'actualizada_en', 'peluquero_info'
        ]
```

### 3. Frontend Interfaces - `peluquería-canina/services/citasService.ts`

**Cambio 1:** Actualizar interfaz `CitaCreate`

```typescript
// ANTES
export interface CitaCreate {
  mascota_id: number;
  servicio: string;  // ❌ INCORRECTO
  peluquero_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  notas?: string;
}

// DESPUÉS
export interface CitaCreate {
  mascota_id: number;
  servicio: number;  // ✅ CORRECTO: Es el ID del servicio
  peluquero_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  notas?: string;
}
```

**Cambio 2:** Actualizar interfaz `Cita`

```typescript
export interface Cita {
  id: number;
  mascota: number;
  mascota_nombre?: string;
  servicio?: number;          // ➕ NUEVO
  servicio_nombre?: string;   // ➕ NUEVO
  cliente_id?: number;
  peluquero_id: number;
  peluquero_nombre?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA';
  estado_display?: string;
  notas?: string;
  creada_en?: string;
  actualizada_en?: string;
}
```

### 4. Frontend Service - `peluquería-canina/services/citasService.ts`

**Cambio:** Actualizar método `createCita`

```typescript
// ANTES
async createCita(data: CitaCreate): Promise<Cita> {
  const { mascota_id, servicio, ...rest } = data;
  const payload = {
    mascota: mascota_id,
    ...rest,
    notas: data.notas || `Servicio: ${servicio}`  // ❌ Convertía a string
  };
  const response = await citasApi.post('/citas/', payload);
  return response.data;
}

// DESPUÉS
async createCita(data: CitaCreate): Promise<Cita> {
  const { mascota_id, servicio, ...rest } = data;
  const payload = {
    mascota: mascota_id,
    servicio: servicio,  // ✅ Envía el ID tal cual
    ...rest
  };
  const response = await citasApi.post('/citas/', payload);
  return response.data;
}
```

### 5. Frontend Component - `peluquería-canina/pages/BookAppointment.tsx`

**Cambio:** Actualizar envío de datos en `handleSubmitCita`

```typescript
// ANTES
await citasService.createCita({
  mascota_id: parseInt(selectedPet),
  servicio: selectedService.nombre,  // ❌ Enviaba nombre como string
  peluquero_id: parseInt(selectedPeluquero),
  fecha: fecha,
  hora_inicio: horaInicio,
  hora_fin: horaFin
});

// DESPUÉS
await citasService.createCita({
  mascota_id: parseInt(selectedPet),
  servicio: selectedService.id,  // ✅ Envía el ID del servicio
  peluquero_id: parseInt(selectedPeluquero),
  fecha: fecha,
  hora_inicio: horaInicio,
  hora_fin: horaFin
});
```

---

## 🧪 Verificación de la Implementación

### Test 1: Verificar JWT
```bash
# Hacer login y verificar que JWT contiene rol
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"usuario":"testuser","clave":"password"}'

# Respuesta debe incluir:
# {
#   "user": {"id": 1, "username": "testuser", "rol": "CLIENTE", ...},
#   "tokens": {"access": "eyJ...", "refresh": "eyJ..."}
# }
```

### Test 2: Crear Cita
```bash
# Con token JWT válido
TOKEN=$(curl ... # obtener token del test anterior)

curl -X POST http://localhost:8002/api/citas/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mascota": 1,
    "servicio": 1,
    "peluquero_id": 16,
    "fecha": "2026-01-10",
    "hora_inicio": "14:00",
    "hora_fin": "15:00"
  }'

# Respuesta esperada: 201 CREATED
# {
#   "id": 42,
#   "mascota": 1,
#   "servicio": 1,
#   "peluquero_id": 16,
#   "fecha": "2026-01-10",
#   "hora_inicio": "14:00",
#   "hora_fin": "15:00",
#   "estado": "PENDIENTE"
# }
```

### Test 3: Verificar Rol Bloqueado
```bash
# Intentar crear cita con usuario que no es CLIENTE
# (ej: con token de PELUQUERO o ADMIN)

# Respuesta esperada: 403 FORBIDDEN
# {"detail": "Solo los clientes pueden agendar citas"}
```

---

## 🚀 Deploying a Producción

### 1. Rebuild Docker Images
```bash
cd PelusaSPA
docker-compose build --no-cache
```

### 2. Reiniciar Servicios
```bash
docker-compose restart usuario_service citas_service
```

### 3. Verificar Health
```bash
docker-compose ps
# Todos los servicios deberían estar "Up"
```

### 4. Verificar Logs
```bash
docker-compose logs -f usuario_service
docker-compose logs -f citas_service
```

---

## 📝 Rollback (Si es necesario)

Si necesitas revertir estos cambios:

### 1. Revertir Migración
```bash
docker exec citas_service python manage.py migrate citas 0006
```

### 2. Revertir Archivos
- Revertir cambios en `models.py`
- Revertir cambios en `serializers.py`
- Revertir cambios en TypeScript files
- Revertir cambios en componentes

### 3. Reiniciar Servicios
```bash
docker-compose restart citas_service
cd peluquería-canina && npm run dev
```

---

## 🔍 Troubleshooting

### Problema: "Field 'servicio' does not exist"
**Causa:** La migración no se aplicó
**Solución:**
```bash
docker exec citas_service python manage.py makemigrations
docker exec citas_service python manage.py migrate
```

### Problema: TypeError "servicio is not a number"
**Causa:** El frontend envía `servicio` como string en lugar de number
**Solución:** Revisar que `selectedService.id` se envía, no `selectedService.nombre`

### Problema: 403 "no tiene permiso"
**Causa:** El JWT no contiene el rol correcto
**Solución:**
1. Verificar que el usuario tiene rol CLIENTE en la BD
2. Verificar que `tokens.py` incluye el rol en el JWT
3. Decodificar el JWT en https://jwt.io y verificar payload

### Problema: ValidationError "mascota no pertenece"
**Causa:** El usuario está intentando agendar con mascota de otro usuario
**Solución:** Asegurar que `mascota.dueno_id` coincide con `request.user.id`

---

## 📚 Referencias

### Archivos Clave
1. `citas_service/citas/models.py` - Definición de modelo
2. `citas_service/citas/serializers.py` - Validaciones
3. `citas_service/citas/views.py` - Lógica de negocio
4. `citas_service/citas/authentication.py` - Extracción de rol del JWT
5. `peluquería-canina/services/citasService.ts` - Consumidor de API
6. `peluquería-canina/pages/BookAppointment.tsx` - UI

### Variables de Entorno
```
# .env (frontend)
VITE_API_USUARIOS_URL=http://localhost:8001/api
VITE_API_CITAS_URL=http://localhost:8002/api
```

### Dependencias Clave
- **Backend:** Django 5.2, djangorestframework, djangorestframework-simplejwt
- **Frontend:** React 19, TypeScript 5.3, Axios

---

## ✅ Checklist Final

- [ ] Migración de BD aplicada
- [ ] Serializers actualizados
- [ ] Interfaz TypeScript actualizada
- [ ] Componente BookAppointment actualizado
- [ ] Frontend compilado sin errores
- [ ] Tests ejecutados exitosamente
- [ ] JWT contiene rol en payload
- [ ] Backend rechaza usuarios que no son CLIENTE
- [ ] Citas se crean con todos los campos
- [ ] Documentación actualizada

---

## 📞 Soporte

Si tienes preguntas o problemas:

1. **Revisar documentación:**
   - `FINAL_SUMMARY.md` - Resumen ejecutivo
   - `ARCHITECTURE.md` - Arquitectura del sistema
   - `TESTING_GUIDE.md` - Guía de testing manual
   - `VERIFICATION_REPORT.md` - Detalles técnicos

2. **Revisar logs:**
   ```bash
   docker-compose logs citas_service
   docker-compose logs usuario_service
   ```

3. **Verificar base de datos:**
   ```bash
   docker exec citas_service python manage.py dbshell
   ```

---

**¡Sistema de Reserva de Citas completamente implementado y funcional! 🎉**
