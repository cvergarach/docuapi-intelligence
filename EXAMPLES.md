# 📝 Ejemplos de Documentos para Pruebas

Este documento contiene ejemplos que puedes usar para probar DocuAPI Intelligence.

## 📄 Ejemplo 1: API de Clima Simple

Crea un archivo `weather-api.txt` con este contenido:

```
API de Clima - Documentación

AUTENTICACIÓN:
- API Key: abc123xyz456
- Header: X-API-Key

ENDPOINTS:

1. Obtener Clima Actual
   Método: GET
   URL: https://api.weather.com/v1/current
   Headers:
     - X-API-Key: {tu_api_key}
   Parámetros:
     - city: string (requerido)
     - units: string (opcional, default: celsius)
   
   Ejemplo de respuesta:
   {
     "temperature": 22,
     "humidity": 65,
     "conditions": "Soleado"
   }

2. Pronóstico Semanal
   Método: GET
   URL: https://api.weather.com/v1/forecast
   Headers:
     - X-API-Key: {tu_api_key}
   Parámetros:
     - city: string
     - days: number (1-7)
```

## 📄 Ejemplo 2: API REST Completa

Crea un archivo `rest-api.txt` con este contenido:

```
API REST - Sistema de Usuarios

CREDENCIALES:
- Base URL: https://api.example.com/v2
- API Key: sk_live_51H123456789
- Client ID: client_abc123
- Client Secret: secret_xyz789

AUTENTICACIÓN:
POST /auth/token
Body: {
  "client_id": "client_abc123",
  "client_secret": "secret_xyz789"
}
Respuesta: {
  "access_token": "eyJhbGc...",
  "expires_in": 3600
}

ENDPOINTS DE USUARIOS:

1. Listar Usuarios
   GET /users
   Headers:
     Authorization: Bearer {access_token}
   Parámetros de consulta:
     - page: number (default: 1)
     - limit: number (default: 10)

2. Crear Usuario
   POST /users
   Headers:
     Authorization: Bearer {access_token}
     Content-Type: application/json
   Body: {
     "name": "Juan Pérez",
     "email": "juan@example.com",
     "role": "user"
   }

3. Actualizar Usuario
   PUT /users/{id}
   Headers:
     Authorization: Bearer {access_token}
     Content-Type: application/json
   Body: {
     "name": "Juan Pérez Actualizado"
   }

4. Eliminar Usuario
   DELETE /users/{id}
   Headers:
     Authorization: Bearer {access_token}

RATE LIMITS:
- 100 requests por minuto
- 10,000 requests por día
```

## 📄 Ejemplo 3: API de Pago (Stripe-like)

Crea un archivo `payment-api.txt`:

```
API de Pagos - Documentación

CREDENCIALES DE PRODUCCIÓN:
- Publishable Key: pk_live_51234567890abcdef
- Secret Key: sk_live_51234567890abcdef

CREDENCIALES DE PRUEBA:
- Publishable Key: pk_test_51234567890abcdef
- Secret Key: sk_test_51234567890abcdef

ENDPOINTS:

1. Crear Cargo
   POST https://api.payments.com/v1/charges
   Headers:
     Authorization: Bearer sk_live_51234567890abcdef
     Content-Type: application/json
   Body: {
     "amount": 1000,
     "currency": "usd",
     "source": "tok_visa",
     "description": "Cargo de prueba"
   }

2. Crear Cliente
   POST https://api.payments.com/v1/customers
   Headers:
     Authorization: Bearer sk_live_51234567890abcdef
   Body: {
     "email": "customer@example.com",
     "name": "Cliente Test"
   }

3. Listar Cargos
   GET https://api.payments.com/v1/charges
   Headers:
     Authorization: Bearer sk_live_51234567890abcdef
   Parámetros:
     - limit: 10
     - starting_after: charge_id

WEBHOOKS:
URL: https://tuapp.com/webhooks/payments
Secret: whsec_123456789
Eventos:
  - charge.succeeded
  - charge.failed
  - customer.created
```

## 🌐 URLs para Web Scraping

Estas URLs contienen documentación de APIs reales que puedes probar:

### APIs Públicas sin Autenticación

1. **JSONPlaceholder** (API de prueba)
   - URL: `https://jsonplaceholder.typicode.com`
   - Contiene: Endpoints REST de ejemplo

2. **OpenWeatherMap API Docs** (requiere registro gratis)
   - URL: `https://openweathermap.org/api`
   - Contiene: Documentación de API del clima

3. **CoinGecko API**
   - URL: `https://www.coingecko.com/en/api/documentation`
   - Contiene: API de criptomonedas

### Documentación de APIs Empresariales

1. **Stripe API**
   - URL: `https://stripe.com/docs/api`
   - Contiene: Documentación completa de pagos

2. **Twilio API**
   - URL: `https://www.twilio.com/docs/usage/api`
   - Contiene: API de comunicaciones

## 📊 Cómo Usar los Ejemplos

### Opción 1: Crear archivo local

1. Copia uno de los ejemplos de arriba
2. Pégalo en un archivo .txt
3. Súbelo a DocuAPI Intelligence

### Opción 2: Web Scraping

1. Copia una de las URLs sugeridas
2. Pégala en el campo de "Web Scraping"
3. Click en "Analizar Sitio Web"

### Opción 3: Crear PDF de prueba

1. Copia el contenido de ejemplo
2. Pégalo en Google Docs o Word
3. Exporta como PDF
4. Súbelo a DocuAPI Intelligence

## ⚠️ Notas Importantes

### Para Pruebas Locales

- Las credenciales en estos ejemplos son **ficticias**
- Diseñadas para probar la extracción, no para ejecutar
- Si quieres ejecutar APIs reales, usa tus propias credenciales

### Para APIs Reales

1. **Nunca uses credenciales de producción para pruebas**
2. Usa siempre el ambiente de sandbox/test
3. Revoca credenciales después de las pruebas
4. No compartas credenciales reales en documentos

## 🎯 Qué Debería Extraer el Sistema

Para el **Ejemplo 1 (API de Clima)**:
- Credenciales: 1 (API Key)
- APIs: 2 (Current Weather, Forecast)

Para el **Ejemplo 2 (REST API)**:
- Credenciales: 4 (API Key, Client ID, Client Secret, Access Token)
- APIs: 5 (Auth, List Users, Create User, Update User, Delete User)

Para el **Ejemplo 3 (Pagos)**:
- Credenciales: 4 (2 Publishable Keys, 2 Secret Keys)
- APIs: 3 (Create Charge, Create Customer, List Charges)

## 🧪 Pruebas Avanzadas

### Prueba de Documentos Grandes

Crea un documento que incluya:
- Múltiples secciones de APIs (10+)
- Credenciales mezcladas en el texto
- Ejemplos de código
- Tablas de referencia
- Notas y advertencias

### Prueba de Formatos Mixtos

1. Crear documento Word con:
   - Tablas de credenciales
   - Código formateado
   - Imágenes de diagramas
   - Enlaces a recursos

2. Convertir a PDF

3. Subir y verificar extracción

## 📈 Métricas Esperadas

Para documentos bien estructurados:
- **Precisión de credenciales**: >95%
- **Detección de APIs**: >90%
- **Tiempo de procesamiento**: 10-30 segundos
- **Tokens usados**: 2,000-8,000 (depende del tamaño)

## 💡 Tips para Mejores Resultados

1. **Estructura clara**: Usa headers y secciones
2. **Formato consistente**: Mantén estilo uniforme
3. **Ejemplos explícitos**: Incluye ejemplos de uso
4. **Credenciales marcadas**: Usa prefijos como "API Key:", "Token:"
5. **URLs completas**: Siempre incluye protocolo (https://)

## 🔗 Recursos Adicionales

- **Postman Collections**: Exporta como JSON y convierte a texto
- **Swagger/OpenAPI**: Descarga la spec y analízala
- **cURL commands**: Copia comandos y ponlos en documento
- **Insomnia**: Exporta requests como texto
