# Script para iniciar el frontend de Peluqueria Canina

Write-Host "Iniciando Frontend de Peluqueria Canina..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Node.js este instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js no esta instalado. Por favor, instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Verificar que los modulos esten instalados
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR al instalar dependencias" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencias instaladas correctamente" -ForegroundColor Green
    Write-Host ""
}

# Iniciar el servidor de desarrollo
Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Cyan
Write-Host "La aplicacion estara disponible en: http://localhost:5173" -ForegroundColor White
Write-Host ""
npm run dev
