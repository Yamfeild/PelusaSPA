# README Docker

## Arranque rapido
1. Ubicate en la carpeta `PelusaSPA`.
2. Ejecuta el stack completo con PowerShell: `./docker-start.ps1`.
3. Alternativa manual: `docker-compose build` y luego `docker-compose up -d`.

## Detener y limpiar
- Detener: `docker-compose down`
- Detener y borrar volumenes (reinicio total de BD): `docker-compose down -v`

## Servicios y puertos
- usuario_service: http://localhost:8001
- citas_service: http://localhost:8002
- Kong API Gateway (proxy): http://localhost:8000
- Kong Admin API: http://localhost:8443

## Endpoints de prueba rapida
### Directo a cada servicio
- usuario_service
  - Registro: POST http://localhost:8001/api/auth/registro/
  - Login: POST http://localhost:8001/api/auth/login/
- citas_service
  - Listar citas: GET http://localhost:8002/citas/
  - Listar horarios: GET http://localhost:8002/horarios/

### A traves de Kong (recomendado)
- Registro: POST http://localhost:8000/api/auth/registro/
- Login: POST http://localhost:8000/api/auth/login/
- Citas: GET/POST http://localhost:8000/api/citas/
- Horarios: GET/POST http://localhost:8000/api/horarios/

## Ver estado y logs
- Estado de contenedores: `docker-compose ps`
- Logs en vivo: `docker-compose logs -f`
- Logs por servicio: `docker-compose logs -f usuario_service`, `docker-compose logs -f citas_service`, `docker-compose logs -f kong`

## Notas
- El primer arranque ejecuta migraciones automaticamente dentro de cada servicio.
- Si un puerto esta ocupado, detiene el proceso que lo usa o ajusta el mapeo en `docker-compose.yml`.
