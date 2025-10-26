# 🛡️ Decisiones de Seguridad --- Sistema PelusaSPA (Microservicios Django + Kong + Docker)

## 🧱 Arquitectura de seguridad general

-   Arquitectura basada en microservicios, con autenticación
    centralizada en `usuario_service`.
-   Comunicación entre microservicios mediante API REST seguras,
    controladas por **Kong API Gateway**.
-   Tráfico interno en HTTPS con certificados internos gestionados por
    Docker/Kong.

## 🔐 Autenticación y Autorización

-   Uso de **JWT (JSON Web Token)** para autenticación entre clientes y
    servicios.
-   Solo `usuario_service` emite tokens JWT; los demás servicios los
    validan.
-   Roles definidos: `ADMIN`, `PELUQUERO`, `CLIENTE`.
-   Tokens con expiración de 60 minutos; refresh token de 24 horas.
-   Autenticación implementada con `rest_framework_simplejwt`.

## 🔒 Protección de datos sensibles

-   Contraseñas hasheadas con PBKDF2 (por defecto de Django).
-   No se almacenan tokens en la base de datos.
-   Claves secretas (`SECRET_KEY`, `JWT_SECRET`, etc.) almacenadas en
    variables de entorno (.env).
-   No se exponen contraseñas ni información sensible en respuestas API.

## 🧠 Permisos y control de acceso

-   Uso de permisos de DRF: `IsAuthenticated` y `AllowAny` solo en
    registro/login.
-   Control de rol por tipo de usuario (Cliente, Peluquero, Admin).
-   Solo un `CLIENTE` puede registrar mascotas y citas; `PELUQUERO`
    gestiona horarios y citas; `ADMIN` configura tarifas.

## 🧰 Validación y sanitización

-   Validación de entradas mediante `serializers.py`.
-   Sanitización de texto libre y uso de tipos específicos
    (`EmailField`, `CharField`, etc.).
-   Límite de longitud en campos para prevenir inyección.

## 🛡️ Protecciones integradas de Django

-   CSRF deshabilitado para APIs REST (se usa JWT).
-   Configuraciones de seguridad activadas:
    -   `SECURE_BROWSER_XSS_FILTER = True`
    -   `SECURE_CONTENT_TYPE_NOSNIFF = True`
    -   `X_FRAME_OPTIONS = 'DENY'`
    -   `SECURE_SSL_REDIRECT = True` (en producción)
-   CORS restringido con `django-cors-headers` (`CORS_ALLOWED_ORIGINS`
    configurado).

## ⚙️ Kong API Gateway

-   Validación JWT antes de redirigir solicitudes.
-   Límite de peticiones (rate limiting) y control de acceso por ruta y
    método HTTP.
-   Aislamiento total: servicios internos no son accesibles desde
    internet.

## 🧾 Logs y auditoría

-   Registro de errores y eventos en todos los microservicios.
-   Auditoría de:
    -   Intentos de login fallidos.
    -   Creación/eliminación de usuarios.
    -   Cambios de contraseñas y accesos restringidos.
-   Logs fuera del contenedor de aplicación (volúmenes Docker).

## 🧩 Configuración Docker y entorno

-   Imágenes sin usuario root.
-   Variables sensibles en `.env` (no en código fuente).
-   Puertos expuestos solo al Gateway.
-   Admin de Django protegido (no público).

## 🔁 Buenas prácticas

-   Rotación periódica de claves JWT y `SECRET_KEY`.
-   Actualización continua de dependencias (pip-audit, safety).
-   Backups automáticos y replicación de base de datos.
-   Monitoreo de logs con Loki / Grafana / ELK Stack.

## ✅ Resumen de decisiones clave

  Categoría            Decisión
  -------------------- ---------------------------------------------
  Autenticación        JWT centralizado en `usuario_service`
  Autorización         Roles: ADMIN, PELUQUERO, CLIENTE
  Cifrado              Contraseñas hasheadas (PBKDF2)
  Variables secretas   En `.env`
  Comunicación         HTTPS + Kong Gateway
  Validación           Serializadores y validación por campos
  Permisos             DRF `IsAuthenticated` + control por rol
  Logs                 Centralizados y fuera del contenedor
  CORS                 Solo dominios confiables
  Actualizaciones      Auditoría y parches de seguridad periódicos
