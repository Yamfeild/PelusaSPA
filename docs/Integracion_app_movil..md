📱 Reporte de Integración: App Móvil & Microservicio de Usuarios
Este documento detalla la integración de la aplicación móvil con el backend desarrollado bajo una arquitectura de microservicios, centrándose en el servicio de Auth/Usuarios.
<img width="485" height="753" alt="image" src="https://github.com/user-attachments/assets/3bff10a5-976a-4f09-830e-3ec6498834e4" />

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
Acceso Exitoso: Descripción: Vista principal tras validar el Token JWT y el rol de Cliente.
            <img width="863" height="905" alt="image" src="https://github.com/user-attachments/assets/d27ab0bf-6fc2-4ebd-abea-92c0ecdb75a8" />

Interfaz de Registro y Login: Descripción: Formulario de registro enviando datos al puerto 8001.
<img width="1461" height="1048" alt="image" src="https://github.com/user-attachments/assets/6a525618-be5e-4644-85f2-56b838b6cc7e" />


4. Evidencia del Manejo de Errores
Se implementaron validaciones tanto en el lado del cliente (frontend) como capturas de excepciones del servidor (backend).

Escenarios Probados:


Restricción de Rol: Si un usuario con rol ADMINISTRADOR intenta entrar a la app móvil, el sistema detecta que el rol no es CLIENTE, muestra un mensaje de acceso denegado y cierra la sesión automáticamente.
<img width="876" height="931" alt="image" src="https://github.com/user-attachments/assets/bd3b8ee4-5a57-4d22-9206-4d99f60bedf5" />

Error de Red: Si la IP 172.20.10.10 no es alcanzable, se gestiona el timeout para evitar que la aplicación se bloquee.
Credenciales Incorrectas (401 Unauthorized): Si el usuario o clave no coinciden, la app captura el error y lanza un Alert.alert("Error", "Credenciales incorrectas").

<img width="1292" height="907" alt="image" src="https://github.com/user-attachments/assets/6552430a-9475-4913-8b47-f6c323e94e24" />

Captura de Manejo de Errores: Descripción: Ejemplo de feedback visual cuando el backend retorna un error de validación.
