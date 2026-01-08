# Script para pruebas rápidas de la API
# Uso: .\docker-test.ps1

$GATEWAY_URL = "http://localhost:8000"
$USUARIO_URL = "http://localhost:8001"
$CITAS_URL = "http://localhost:8002"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Pruebas del Sistema - Docker    " -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Función para hacer peticiones
function Invoke-ApiRequest {
    param (
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        return $null
    }
}

Write-Host "1. Registrando un CLIENTE..." -ForegroundColor Yellow
$clienteBody = @{
    username = "cliente_test"
    correo = "cliente@test.com"
    clave = "Password123!"
    clave_confirmacion = "Password123!"
    nombre = "Juan"
    apellido = "Pérez"
    fecha_nacimiento = "1990-05-15"
    telefono = "0999123456"
    identificacion = "1234567890"
    rol = "CLIENTE"
    direccion = "Av. Principal 123"
} | ConvertTo-Json

$clienteResponse = Invoke-ApiRequest -Url "$GATEWAY_URL/api/auth/registro/" -Method POST -Body $clienteBody

if ($clienteResponse) {
    Write-Host "✓ Cliente registrado exitosamente" -ForegroundColor Green
    $clienteToken = $clienteResponse.tokens.access
    Write-Host "  Token: $($clienteToken.Substring(0, 20))..." -ForegroundColor Gray
}
else {
    Write-Host "✗ Error al registrar cliente" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Registrando un PELUQUERO..." -ForegroundColor Yellow
$peluqueroBody = @{
    username = "peluquero_test"
    correo = "peluquero@test.com"
    clave = "Password123!"
    clave_confirmacion = "Password123!"
    nombre = "María"
    apellido = "García"
    fecha_nacimiento = "1985-08-20"
    telefono = "0999654321"
    identificacion = "0987654321"
    rol = "PELUQUERO"
    especialidad = "Corte y Color"
    experiencia = "5 años de experiencia"
} | ConvertTo-Json

$peluqueroResponse = Invoke-ApiRequest -Url "$GATEWAY_URL/api/auth/registro/" -Method POST -Body $peluqueroBody

if ($peluqueroResponse) {
    Write-Host "✓ Peluquero registrado exitosamente" -ForegroundColor Green
    $peluqueroToken = $peluqueroResponse.tokens.access
    $peluqueroId = $peluqueroResponse.user.id
    Write-Host "  Token: $($peluqueroToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  ID: $peluqueroId" -ForegroundColor Gray
}
else {
    Write-Host "✗ Error al registrar peluquero" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Peluquero crea horario..." -ForegroundColor Yellow
$horarioBody = @{
    dia = "Lunes"
    hora_inicio = "09:00:00"
    hora_fin = "18:00:00"
    activo = $true
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $peluqueroToken"
}

$horarioResponse = Invoke-ApiRequest -Url "$GATEWAY_URL/api/horarios/" -Method POST -Headers $headers -Body $horarioBody

if ($horarioResponse) {
    Write-Host "✓ Horario creado exitosamente" -ForegroundColor Green
}
else {
    Write-Host "✗ Error al crear horario" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Cliente consulta disponibilidad..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $clienteToken"
}

# Obtener fecha de próximo lunes
$today = Get-Date
$daysUntilMonday = (8 - [int]$today.DayOfWeek) % 7
if ($daysUntilMonday -eq 0) { $daysUntilMonday = 7 }
$nextMonday = $today.AddDays($daysUntilMonday)
$fecha = $nextMonday.ToString("yyyy-MM-dd")

$disponibilidadResponse = Invoke-ApiRequest -Url "$GATEWAY_URL/api/citas/disponibilidad/?peluquero_id=$peluqueroId&fecha=$fecha" -Headers $headers

if ($disponibilidadResponse) {
    Write-Host "✓ Disponibilidad consultada" -ForegroundColor Green
    Write-Host "  Fecha: $fecha" -ForegroundColor Gray
}
else {
    Write-Host "✗ Error al consultar disponibilidad" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Cliente agenda una cita..." -ForegroundColor Yellow
$citaBody = @{
    peluquero_id = $peluqueroId
    fecha = $fecha
    hora_inicio = "10:00:00"
    hora_fin = "11:00:00"
    notas = "Corte y barba"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $clienteToken"
}

$citaResponse = Invoke-ApiRequest -Url "$GATEWAY_URL/api/citas/" -Method POST -Headers $headers -Body $citaBody

if ($citaResponse) {
    Write-Host "✓ Cita agendada exitosamente" -ForegroundColor Green
    $citaId = $citaResponse.id
    Write-Host "  Cita ID: $citaId" -ForegroundColor Gray
    Write-Host "  Estado: $($citaResponse.estado)" -ForegroundColor Gray
}
else {
    Write-Host "✗ Error al agendar cita" -ForegroundColor Red
}

Write-Host ""
Write-Host "6. Peluquero confirma la cita..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $peluqueroToken"
}

$confirmarResponse = Invoke-ApiRequest -Url "$GATEWAY_URL/api/citas/$citaId/confirmar/" -Method POST -Headers $headers

if ($confirmarResponse) {
    Write-Host "✓ Cita confirmada" -ForegroundColor Green
}
else {
    Write-Host "✗ Error al confirmar cita" -ForegroundColor Red
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "  Resumen de Pruebas" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cliente Token:" -ForegroundColor Yellow
Write-Host "  $clienteToken" -ForegroundColor White
Write-Host ""
Write-Host "Peluquero Token:" -ForegroundColor Yellow
Write-Host "  $peluqueroToken" -ForegroundColor White
Write-Host ""
Write-Host "Puedes usar estos tokens para hacer más pruebas manualmente" -ForegroundColor Cyan
Write-Host ""
