#!/bin/bash

# Script para cambiar la IP de producción de forma centralizada
# Uso: ./change-ip.sh NUEVA_IP

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar una IP"
    echo "Uso: ./change-ip.sh NUEVA_IP"
    echo "Ejemplo: ./change-ip.sh 35.123.45.67"
    exit 1
fi

NEW_IP=$1

# Validar formato de IP
if ! [[ $NEW_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo "❌ Error: Formato de IP inválido"
    echo "Formato esperado: XXX.XXX.XXX.XXX"
    exit 1
fi

echo "🔄 Cambiando IP a: $NEW_IP"
echo ""

# Crear backup del .env actual
if [ -f .env ]; then
    BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_FILE"
    echo "✅ Backup creado: $BACKUP_FILE"
fi

# Actualizar el archivo .env
cat > .env << EOF
# ============================================
# CONFIGURACIÓN CENTRALIZADA - PRODUCCIÓN
# ============================================
# Nueva IP del servidor en producción
PUBLIC_IP=$NEW_IP

# URLs Base
FRONTEND_URL=http://$NEW_IP:3000
OAUTH_URL=http://$NEW_IP:9000
GATEWAY_URL=http://$NEW_IP:8080

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
EOF

echo "✅ Archivo .env actualizado"
echo ""

# Actualizar también el .env del frontend para desarrollo local
cat > ms-frontend/.env << EOF
VITE_API_GATEWAY=http://$NEW_IP:8080
VITE_OIDC_AUTHORITY=http://$NEW_IP:9000
VITE_FRONTEND_URL=http://$NEW_IP:3000
EOF

echo "✅ Frontend .env actualizado"
echo ""

echo "📋 Nueva configuración:"
echo "  - Frontend: http://$NEW_IP:3000"
echo "  - OAuth:    http://$NEW_IP:9000"
echo "  - Gateway:  http://$NEW_IP:8080"
echo ""
echo "🚀 Para aplicar los cambios, ejecuta:"
echo "   docker-compose down"
echo "   docker-compose up --build -d"
echo ""
