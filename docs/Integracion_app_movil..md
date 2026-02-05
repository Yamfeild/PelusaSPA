📱 Reporte de Integración: App Móvil & Microservicio de Usuarios
Este documento detalla la integración de la aplicación móvil con el backend desarrollado bajo una arquitectura de microservicios, centrándose en el servicio de Auth/Usuarios.

1. Endpoints Consumidos
Se trabajó específicamente con el microservicio alojado en el puerto 8001, encargado de la persistencia de personas y cuentas de usuario.

Método,Endpoint,Propósito,Servicio
POST,/api/auth/registro/,Registrar un nuevo usuario con rol CLIENTE.,Usuarios (8001)
POST,/api/auth/login/,Autenticar usuario y obtener Token JWT.,Usuarios (8001)
GET,/api/auth/perfil/,Obtener datos del cliente logueado.,Usuarios (8001)

2. Ejemplo de Solicitud y Respuesta
A continuación, se detalla un ejemplo técnico de la interacción con el endpoint de registro:

Solicitud (JSON enviado desde la App):

{
  "username": "usuario_prueba",
  "correo": "cliente@ejemplo.com",
  "clave": "Segura123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "identificacion": "110548XXXX",
  "rol": "CLIENTE",
  "direccion": "Loja, Ecuador"
}

Respuesta Exitosa (201 Created):

{
  "id": 15,
  "username": "usuario_prueba",
  "mensaje": "Usuario creado exitosamente"
}

3. Capturas de Pantalla (App en Ejecución)
En esta sección se adjunta la evidencia visual del correcto funcionamiento de la interfaz móvil conectada al backend.

Interfaz de Registro y Login: Descripción: Formulario de registro enviando datos al puerto 8001.

Acceso Exitoso: Descripción: Vista principal tras validar el Token JWT y el rol de Cliente.

4. Evidencia del Manejo de Errores
Se implementaron validaciones tanto en el lado del cliente (frontend) como capturas de excepciones del servidor (backend).

Escenarios Probados:
Credenciales Incorrectas (401 Unauthorized): Si el usuario o clave no coinciden, la app captura el error y lanza un Alert.alert("Error", "Credenciales incorrectas").

Restricción de Rol: Si un usuario con rol ADMINISTRADOR intenta entrar a la app móvil, el sistema detecta que el rol no es CLIENTE, muestra un mensaje de acceso denegado y cierra la sesión automáticamente.

Error de Red: Si la IP 172.20.10.10 no es alcanzable, se gestiona el timeout para evitar que la aplicación se bloquee.

Captura de Manejo de Errores: Descripción: Ejemplo de feedback visual cuando el backend retorna un error de validación.