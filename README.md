# 🐶 Peluquería Canina – Documentación del Sistema

## 1. Introducción

El sistema **Peluquería Canina** es una plataforma web diseñada para gestionar de forma eficiente el registro de clientes, mascotas, peluqueros y el agendamiento de citas.  
El objetivo principal es automatizar el proceso de atención, mejorar la organización del negocio y ofrecer una experiencia clara y segura tanto para clientes como para administradores y peluqueros.

El sistema está desarrollado bajo una **arquitectura de microservicios**, utilizando tecnologías modernas como **Django REST Framework, JWT, Docker y Kong API Gateway**, garantizando escalabilidad, seguridad y mantenibilidad.

---

## 2. Alcance del Sistema

El sistema permite:

- Registro y autenticación de usuarios.
- Gestión de clientes y sus mascotas.
- Agendamiento, cancelación y seguimiento de citas.
- Administración de peluqueros y sus horarios.
- Control de estados de las citas.
- Comunicación segura entre servicios mediante JWT y API Gateway.

---

## 3. Requisitos del Sistema

### 3.1 Requisitos Funcionales (RF)

- **RF01** – Registro de Clientes  
- **RF02** – Gestión de Mascotas  
- **RF03** – Agendamiento de Citas  
- **RF04** – Validación de Disponibilidad  
- **RF05** – Cancelación de Citas por el Cliente  
- **RF06** – Visualización del Estado de Citas  
- **RF07** – Registro de Peluqueros (solo administrador)  
- **RF08** – Gestión de Horarios de Peluqueros  
- **RF09** – Visualización Administrativa de Citas  
- **RF10** – Gestión de Estado de Citas por Peluqueros  
- **RF11** – Notificaciones de Cambio de Estado  

---

### 3.2 Requisitos No Funcionales (RNF)

- **RNF01** – Seguridad (JWT, roles, permisos)  
- **RNF02** – Rendimiento (tiempo de respuesta < 2s)  
- **RNF03** – Disponibilidad (99%)  
- **RNF04** – Escalabilidad (microservicios)  
- **RNF05** – Usabilidad (interfaz intuitiva)  
- **RNF06** – Mantenibilidad (PEP8, REST, documentación)  
- **RNF07** – Integridad de Datos (restricciones y validaciones)  

---

### 3.3 Reglas de Negocio (RN)

- **RN01** – Una mascota no puede tener dos citas el mismo día.  
- **RN02** – Un cliente solo puede cancelar sus propias citas.  
- **RN03** – Solo el administrador puede registrar peluqueros.  
- **RN04** – Los horarios solo pueden ser gestionados por el administrador.  
- **RN05** – Toda cita debe estar asociada a un peluquero disponible.  
- **RN06** – Estados permitidos: `Pendiente`, `Confirmada`, `Cancelada`, `Finalizada`.  

---

## 4. Tecnologías, Frameworks y Lenguajes Utilizados

### 4.1 Lenguaje de Programación

**Python 3.11+**  
Lenguaje principal para el desarrollo backend basado en Django y Django REST Framework debido a su rapidez de desarrollo, mantenibilidad y ecosistema maduro.

---

### 4.2 Frameworks Backend

#### Django 5
Framework principal para la construcción de cada microservicio por su robustez, modularidad y ORM integrado.

#### Django REST Framework (DRF)

Framework utilizado para crear APIs RESTful, proporcionando:

- Serializers  
- ViewSets  
- Routers  
- Autenticación JWT  
- Control de permisos por roles  

---

## 5. Arquitectura del Sistema

### 5.1 Arquitectura de Microservicios

El sistema se divide en dos servicios independientes:

#### 🧩 UserService

- Gestión de usuarios  
- Autenticación  
- Roles: cliente, peluquero y administrador  
- Generación de tokens JWT  
- Manejo de cuentas y permisos  

---

#### 🧩 Cita-Cliente Service  
(Cliente + Mascota + Cita + Peluquero)

- Gestión de clientes  
- Gestión de mascotas  
- Agendamiento y validación de citas  
- Gestión de horarios de peluqueros  
- Cambio de estado de citas  

---

## 6. Contenedores y Orquestación

### 6.1 Docker

Utilizado para empaquetar cada microservicio en contenedores independientes, asegurando que funcionen igual en desarrollo, pruebas y producción.

### 6.2 Docker Compose

Permite levantar:

- Base de datos  
- Microservicios  
- API Gateway  
- Redes internas  
- Volúmenes  

Todo con un solo comando.

---

## 7. API Gateway

### Kong API Gateway

Implementado para gestionar:

- Ruteo entre microservicios  
- Seguridad  
- Control de tráfico  
- Versionado de APIs  
- Escalabilidad y desacoplamiento  

---

## 8. Autenticación y Autorización

### JWT (JSON Web Tokens)

Mecanismo utilizado para:

- Iniciar sesión  
- Mantener sesiones seguras  
- Transmitir roles de usuario en el token  

Implementado con:

- `djangorestframework-simplejwt`

---

## 9. Estados del Sistema

Estados permitidos para las citas:

- Pendiente  
- Confirmada  
- Cancelada  
- Finalizada  

---

## 10. Ejecución del Proyecto

### 10.1 Clonar el repositorio

```bash
git clone https://github.com/usuario/peluqueria-canina.git
cd peluqueria-canina
docker-compose up --build
