# 🚀 Guía Rápida de Inicio - Peluquería Canina

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Iniciar Backend
```powershell
cd d:\Plataformas\V1\PelusaSPA
docker-compose up -d
```
⏱️ Espera 30 segundos

### 2️⃣ Iniciar Frontend
```powershell
cd peluquería-canina
.\start-frontend.ps1
```

### 3️⃣ Abrir Navegador
🌐 http://localhost:5173

---

## 🎯 Primera Vez

### Instalar Dependencias (solo la primera vez)
```powershell
cd d:\Plataformas\V1\PelusaSPA\peluquería-canina
npm install
```

---

## 📱 Uso de la Aplicación

### Registrarse
1. Ir a http://localhost:5173/#/login
2. Click en "Registrarse"
3. Completar formulario
4. Click en "Registrarse"

### Agregar Mascota
1. Desde Dashboard → Click "Añadir" (Mis Mascotas)
2. Completar datos
3. Click "Guardar Mascota"

### Ver Citas
1. Dashboard → Pestaña "Próximas Citas"
2. O "Historial de Citas"

---

## 🛑 Detener Todo

### Detener Frontend
```
Ctrl + C en la terminal del frontend
```

### Detener Backend
```powershell
cd d:\Plataformas\V1\PelusaSPA
docker-compose stop
```

---

## 🔧 Solución Rápida de Problemas

### ❌ "Puerto ya en uso"
```powershell
# Ver qué usa el puerto
Get-NetTCPConnection -LocalPort 5173,8001,8002

# Detener Docker
docker-compose down
```

### ❌ "No conecta con backend"
```powershell
# Verificar que Docker esté corriendo
docker ps

# Si no hay contenedores, iniciar:
docker-compose up -d
```

### ❌ "Error al instalar dependencias"
```powershell
cd peluquería-canina
Remove-Item -Recurse node_modules
npm install
```

---

## 📚 Documentación Completa

- **[INTEGRACION_COMPLETA.md](INTEGRACION_COMPLETA.md)** - Guía completa
- **[CHECKLIST_VERIFICACION.md](CHECKLIST_VERIFICACION.md)** - Verificación paso a paso
- **[peluquería-canina/README_FRONTEND.md](peluquería-canina/README_FRONTEND.md)** - Docs del frontend

---

## 🌐 URLs del Sistema

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Usuario API | http://localhost:8001/api/ |
| Citas API | http://localhost:8002/api/ |
| Admin Usuarios | http://localhost:8001/admin/ |
| Admin Citas | http://localhost:8002/admin/ |

---

## ✨ ¡Listo!

El sistema está completamente funcional. ¡A usarlo! 🎉

Para más ayuda, consulta la documentación completa.
