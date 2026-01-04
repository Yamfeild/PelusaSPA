# 🐕 Sistema de Gestión de Peluquería Canina

## 📋 Índice de Documentación

### 🚀 Para Comenzar
- **[INICIO_RAPIDO.md](PelusaSPA/INICIO_RAPIDO.md)** - Guía rápida de inicio (3 pasos)
- **[INTEGRACION_COMPLETA.md](PelusaSPA/INTEGRACION_COMPLETA.md)** - Guía completa del sistema integrado
- **[CHECKLIST_VERIFICACION.md](PelusaSPA/CHECKLIST_VERIFICACION.md)** - Verificación paso a paso

### 📚 Documentación Técnica
- **[Frontend](PelusaSPA/peluquería-canina/README_FRONTEND.md)** - Documentación del frontend (React + TypeScript)
- **[Usuario Service](PelusaSPA/usuario_service/README_AUTH.md)** - API de autenticación y usuarios
- **[Citas Service](PelusaSPA/citas_service/README_CITAS.md)** - API de citas y mascotas
- **[Docker](PelusaSPA/DOCKER_GUIDE.md)** - Guía de Docker y deployment

### 📊 Resumen del Proyecto
- **[RESUMEN_INTEGRACION.md](PelusaSPA/RESUMEN_INTEGRACION.md)** - Resumen ejecutivo de la integración

---

## ✨ Estado Actual: ✅ COMPLETADO Y FUNCIONAL

El sistema está completamente integrado con:
- ✅ Frontend React + TypeScript funcional
- ✅ Backend con 2 microservicios (Django REST)
- ✅ Autenticación JWT completa
- ✅ CRUD de mascotas implementado
- ✅ Gestión de citas funcional
- ✅ Sin errores de TypeScript
- ✅ Documentación completa

---

1. Requisitos Funcionales (RF)

RF01 – Registro de Clientes
RF02 – Gestión de Mascotas
RF03 – Agendamiento de Citas
RF04 – Validación de Disponibilidad
RF05 – Cancelación de Citas por el Cliente
RF06 – Visualización del Estado de Citas
RF07 – Registro de Peluqueros (solo administrador)
RF08 – Gestión de Horarios de Peluqueros
RF09 – Visualización Administrativa de Citas
RF10 – Gestión de Estado de Citas por Peluqueros
RF11 – Notificaciones de Cambio de Estado

2. Requisitos No Funcionales (RNF)

RNF01 – Seguridad (JWT, roles, permisos)
RNF02 – Rendimiento (tiempo de respuesta <2s)
RNF03 – Disponibilidad (99%)
RNF04 – Escalabilidad (microservicios)
RNF05 – Usabilidad (interfaz intuitiva)
RNF06 – Mantenibilidad (PEP8, REST, documentación)
RNF07 – Integridad de Datos (restricciones y validaciones)

3. Reglas de Negocio (RN)
RN01 – Una mascota no puede tener dos citas el mismo día.
RN02 – Un cliente solo puede cancelar sus propias citas.
RN03 – Solo el administrador puede registrar peluqueros.
RN04 – Los horarios solo pueden ser gestionados por el administrador.
RN05 – Toda cita debe estar asociada a un peluquero disponible.
RN06 – Estados permitidos: Pendiente, Confirmada, Cancelada, Finalizada.

4. Tecnologías, Frameworks y Lenguajes Utilizados

4.1 Lenguaje de Programación
Python 3.11+
Lenguaje principal para el desarrollo backend basado en Django y Django REST Framework debido a su rapidez de desarrollo, mantenibilidad y ecosistema maduro.

4.2 Frameworks Backend
--Django 5
Framework principal para la construcción de cada microservicio por su robustez, modularidad y ORM integrado.

--Django REST Framework (DRF)

Framework utilizado para crear APIs RESTful, proporcionando:

-Serializers
-Viewsets
-Routers
-Autenticación JWT
-Control de permisos por roles

4.3 Arquitectura
Arquitectura de Microservicios

El sistema se divide en dos servicios independientes (como definiste):

---UserService

-Gestión de usuarios, autenticación, roles (cliente, peluquero, administrador).
-Generación de tokens JWT.
-Manejo de cuentas y permisos.

---Cita-Cliente Service (Cliente + Mascota + Cita + Peluquero)

-Gestión de clientes.
-Gestión de mascotas.
-Agendamiento y validación de citas.
-Gestión de horarios de peluqueros.
-Cambio de estado de citas.

4.4 Contenedores y Orquestación
Docker

Utilizado para empaquetar cada microservicio en contenedores independientes, asegurando que funcionen igual en desarrollo, pruebas y producción.

Docker Compose

Permite levantar:

-Base de datos
-Microservicios
-API Gateway
-Redes internas
-Volúmenes
Todo con un solo comando.

4.5 API Gateway

Kong API Gateway

Implementado para gestionar:

-Ruteo entre microservicios
-Seguridad
-Control de tráfico
-Versionado de APIs
-Aporta escalabilidad y desacoplamiento.

4.6 Autenticación y Autorización
JWT (JSON Web Tokens)

Mecanismo para:
-Iniciar sesión
-Mantener sesiones seguras
-Transmitir roles de usuario en el token
-Utilizado principalmente con djangorestframework-simplejwt.