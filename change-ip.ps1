# Script para cambiar la IP de producción de forma centralizada
# Uso: .\change-ip.ps1 NUEVA_IP

param(
    [Parameter(Mandatory = $true)]
    [string]$NewIP
)

# Validar formato de IP
if ($NewIP -notmatch '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$') {
    Write-Host "❌ Error: Formato de IP inválido" -ForegroundColor Red
    Write-Host "Formato esperado: XXX.XXX.XXX.XXX"
    exit 1
}

Write-Host "🔄 Cambiando IP a: $NewIP" -ForegroundColor Cyan
Write-Host ""

# Crear backup del .env actual
if (Test-Path .env) {
    $backupFile = ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item .env $backupFile
    Write-Host "✅ Backup creado: $backupFile" -ForegroundColor Green
}

# Contenido del nuevo archivo .env
$envContent = @"
# ============================================
# CONFIGURACIÓN CENTRALIZADA - PRODUCCIÓN
# ============================================
# Nueva IP del servidor en producción
PUBLIC_IP=$NewIP

# URLs Base
FRONTEND_URL=http://${NewIP}:3000
OAUTH_URL=http://${NewIP}:9000
GATEWAY_URL=http://${NewIP}:8080

# Puertos de Servicios
GATEWAY_PORT=8080
OAUTH_PORT=9000
FRONTEND_PORT=3000
CATALOGO_PORT=8081
INVENTARIO_PORT=8082
VENTAS_PORT=8083

# Base de Datos MySQL
MYSQL_ROOT_PASSWORD=admin
MYSQL_HOST=mysql-db
MYSQL_PORT=3306

# Base de Datos PostgreSQL
POSTGRES_DB=db_oauth
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_HOST=postgres-db
POSTGRES_PORT=5432

# URLs internas de microservicios (para comunicación entre contenedores)
CATALOGO_INTERNAL_URL=http://ms-catalogo:8081
INVENTARIO_INTERNAL_URL=http://ms-inventario:8082
VENTAS_INTERNAL_URL=http://ms-ventas:8083
OAUTH_INTERNAL_URL=http://oauth-server:9000
"@

# Actualizar archivo .env
Set-Content -Path .env -Value $envContent
Write-Host "✅ Archivo .env actualizado" -ForegroundColor Green
Write-Host ""

# Contenido del .env del frontend
$frontendEnvContent = @"
VITE_API_GATEWAY=http://${NewIP}:8080
VITE_OIDC_AUTHORITY=http://${NewIP}:9000
VITE_FRONTEND_URL=http://${NewIP}:3000
"@

# Actualizar .env del frontend
Set-Content -Path "ms-frontend\.env" -Value $frontendEnvContent
Write-Host "✅ Frontend .env actualizado" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Nueva configuración:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://${NewIP}:3000"
Write-Host "  - OAuth:    http://${NewIP}:9000"
Write-Host "  - Gateway:  http://${NewIP}:8080"
Write-Host ""
Write-Host "🚀 Para aplicar los cambios, ejecuta:" -ForegroundColor Cyan
Write-Host "   docker-compose down"
Write-Host "   docker-compose up --build -d"
Write-Host ""
