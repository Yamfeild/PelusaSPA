# Script para iniciar los servicios con Docker Compose
# Uso: .\docker-start.ps1

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Sistema de Peluquería - Docker  " -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Detener contenedores existentes
Write-Host "Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Limpiar volúmenes si es necesario (descomentar si quieres empezar desde cero)
# Write-Host "Limpiando volúmenes..." -ForegroundColor Yellow
# docker-compose down -v

# Construir imágenes
Write-Host ""
Write-Host "Construyendo imágenes Docker..." -ForegroundColor Green
docker-compose build

# Iniciar servicios
Write-Host ""
Write-Host "Iniciando servicios..." -ForegroundColor Green
docker-compose up -d

# Esperar a que los servicios estén listos
Write-Host ""
Write-Host "Esperando que los servicios inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Mostrar estado
Write-Host ""
Write-Host "Estado de los contenedores:" -ForegroundColor Cyan
docker-compose ps

# Mostrar información de acceso
Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "  Servicios Disponibles" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Usuario Service (directo):" -ForegroundColor Yellow
Write-Host "  http://localhost:8001" -ForegroundColor White
Write-Host "  http://localhost:8001/api/auth/registro/" -ForegroundColor White
Write-Host "  http://localhost:8001/api/auth/login/" -ForegroundColor White
Write-Host ""
Write-Host "Citas Service (directo):" -ForegroundColor Yellow
Write-Host "  http://localhost:8002" -ForegroundColor White
Write-Host "  http://localhost:8002/citas/" -ForegroundColor White
Write-Host "  http://localhost:8002/horarios/" -ForegroundColor White
Write-Host ""
Write-Host "Kong API Gateway:" -ForegroundColor Yellow
Write-Host "  http://localhost:8000/api/auth/registro/" -ForegroundColor White
Write-Host "  http://localhost:8000/api/auth/login/" -ForegroundColor White
Write-Host "  http://localhost:8000/api/citas/" -ForegroundColor White
Write-Host "  http://localhost:8000/api/horarios/" -ForegroundColor White
Write-Host ""
Write-Host "Kong Admin:" -ForegroundColor Yellow
Write-Host "  http://localhost:8443" -ForegroundColor White
Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver los logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "Para detener los servicios:" -ForegroundColor Cyan
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "Para ver logs de un servicio específico:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f usuario_service" -ForegroundColor White
Write-Host "  docker-compose logs -f citas_service" -ForegroundColor White
Write-Host "  docker-compose logs -f kong" -ForegroundColor White
Write-Host ""
