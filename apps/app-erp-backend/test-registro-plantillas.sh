#!/bin/bash

# Test del nuevo sistema de registro con plantillas
echo "🧪 Iniciando test del sistema de registro con plantillas..."

# Variables de test
EMAIL="test-$(date +%s)@example.com"
PASSWORD="password123"
NOMBRE="Usuario Test"

# Datos de empresa
EMPRESA_NOMBRE="Test Store"
TIPO_EMPRESA_ID=1  # Comercial/Minimarket
PLAN_ID=1         # Plan Básico

echo "📧 Email de prueba: $EMAIL"
echo "🏢 Empresa: $EMPRESA_NOMBRE"
echo ""

# Test de registro
echo "📝 Enviando solicitud de registro..."
RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"nombre_completo\": \"$NOMBRE\",
    \"empresa_data\": {
      \"nombre\": \"$EMPRESA_NOMBRE\",
      \"tipo_empresa_id\": $TIPO_EMPRESA_ID,
      \"plan_id\": $PLAN_ID
    }
  }")

echo "📋 Respuesta del servidor:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# Extraer el UID si el registro fue exitoso
if echo "$RESPONSE" | grep -q "firebase_uid"; then
    UID=$(echo "$RESPONSE" | jq -r '.firebase_uid' 2>/dev/null)
    echo ""
    echo "✅ Registro exitoso. UID: $UID"
    
    # Test de verificación de roles creados
    echo ""
    echo "🔍 Verificando roles creados para la empresa..."
    EMPRESA_ID=$(echo "$RESPONSE" | jq -r '.usuario.empresa_id' 2>/dev/null)
    
    if [ "$EMPRESA_ID" != "null" ] && [ -n "$EMPRESA_ID" ]; then
        echo "🏢 ID de empresa: $EMPRESA_ID"
        
        # Consultar roles de la empresa
        curl -s "http://localhost:4000/api/roles/empresa/$EMPRESA_ID" | jq . 2>/dev/null || echo "Error consultando roles"
        
        echo ""
        echo "🎯 Verificando plantillas disponibles para tipo comercial..."
        curl -s "http://localhost:4000/api/roles-plantilla/empresa/comercial" | jq length 2>/dev/null || echo "Error consultando plantillas"
    fi
else
    echo "❌ Error en el registro:"
    echo "$RESPONSE"
fi

echo ""
echo "🧪 Test completado."