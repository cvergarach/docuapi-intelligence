# 📦 Guía de Deployment

Esta guía te ayudará a desplegar DocuAPI Intelligence en Vercel (frontend) y Render (backend).

## 🎯 Resumen de Arquitectura

```
[Usuario] 
    ↓
[Frontend - Vercel] (Next.js)
    ↓ API Calls
[Backend - Render] (Node.js + Express)
    ↓ AI Processing
[Claude API - Anthropic]
```

## 📋 Prerrequisitos

- [ ] Cuenta de GitHub
- [ ] Cuenta de Vercel (gratuita)
- [ ] Cuenta de Render (gratuita)
- [ ] API Key de Anthropic ([obtener aquí](https://console.anthropic.com))
- [ ] Git instalado localmente

## 🚀 Paso 1: Preparar el Repositorio

1. **Crear repositorio en GitHub**
```bash
git init
git add .
git commit -m "Initial commit: DocuAPI Intelligence"
git branch -M main
git remote add origin https://github.com/tu-usuario/docuapi-intelligence.git
git push -u origin main
```

## 🔧 Paso 2: Deploy del Backend en Render

### 2.1 Crear Web Service

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" → "Web Service"
3. Conectar repositorio de GitHub
4. Configurar:
   - **Name**: `docuapi-backend`
   - **Region**: Selecciona la más cercana
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (para empezar)

### 2.2 Variables de Entorno

En la sección "Environment" agregar:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

**IMPORTANTE**: 
- Obtén tu API Key de Anthropic en https://console.anthropic.com
- Reemplaza `ALLOWED_ORIGINS` después de deployar el frontend

### 2.3 Deploy

1. Click en "Create Web Service"
2. Espera 5-10 minutos para el primer deploy
3. Copia la URL del servicio (ej: `https://docuapi-backend.onrender.com`)

### 2.4 Verificar Backend

```bash
curl https://tu-backend.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "DocuAPI Intelligence Backend is running",
  "timestamp": "2024-12-24T..."
}
```

## 🎨 Paso 3: Deploy del Frontend en Vercel

### 3.1 Conectar Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New..." → "Project"
3. Importar repositorio de GitHub
4. Configurar:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `.next` (automático)

### 3.2 Variables de Entorno

En "Environment Variables" agregar:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

**IMPORTANTE**: Usa la URL de tu backend de Render

### 3.3 Deploy

1. Click en "Deploy"
2. Espera 2-3 minutos
3. Copia la URL del frontend (ej: `https://docuapi-intelligence.vercel.app`)

## 🔄 Paso 4: Actualizar CORS

1. Vuelve a Render Dashboard
2. Ve a tu servicio backend
3. En "Environment" actualiza:
```env
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```
4. Guarda y espera el redeploy automático

## ✅ Paso 5: Verificación

### 5.1 Test del Frontend

1. Abre tu URL de Vercel
2. Deberías ver la página de inicio correctamente

### 5.2 Test End-to-End

1. Sube un documento de prueba (PDF, DOCX o TXT)
2. Selecciona un modelo de Claude
3. Verifica que el análisis se complete
4. Revisa las credenciales y APIs extraídas
5. Ejecuta una API de prueba

## 🎯 Dominios Personalizados (Opcional)

### Vercel (Frontend)

1. En tu proyecto de Vercel → "Settings" → "Domains"
2. Agregar tu dominio (ej: `api-docs.tudominio.com`)
3. Configurar DNS según instrucciones
4. Actualizar `ALLOWED_ORIGINS` en Render

### Render (Backend)

1. Plan Pro requerido para dominios personalizados
2. "Settings" → "Custom Domain"
3. Agregar dominio (ej: `api.tudominio.com`)
4. Configurar DNS
5. Actualizar `NEXT_PUBLIC_API_URL` en Vercel

## 🔧 Troubleshooting

### Backend no responde

**Síntoma**: Error 503 o timeout

**Soluciones**:
1. Verificar logs en Render Dashboard
2. El plan Free de Render se duerme después de 15 min de inactividad
3. Primera petición puede tardar 30-60 segundos en despertar
4. Considerar upgrade a plan Starter ($7/mes) para servicio siempre activo

### CORS Errors

**Síntoma**: "Access-Control-Allow-Origin" error en consola

**Soluciones**:
1. Verificar `ALLOWED_ORIGINS` en backend incluye tu URL de Vercel
2. Asegurar que NO hay trailing slash en las URLs
3. Verificar que usas HTTPS en producción

### Frontend no se conecta al Backend

**Síntoma**: "Cannot connect to server"

**Soluciones**:
1. Verificar `NEXT_PUBLIC_API_URL` en Vercel
2. Asegurar que la URL del backend es correcta
3. Verificar que el backend está corriendo (`/health` endpoint)
4. Revisar logs en ambos servicios

### API Key Inválida

**Síntoma**: "Error al analizar documento"

**Soluciones**:
1. Verificar `ANTHROPIC_API_KEY` en Render
2. Confirmar que la API Key es válida en Anthropic Console
3. Verificar límites de uso de la API Key
4. Revisar logs del backend para detalles del error

### Archivos grandes fallan

**Síntoma**: Timeout o error en uploads

**Soluciones**:
1. Render Free tiene límite de 512MB RAM
2. Considerar chunking más pequeño en el código
3. Upgrade a plan con más recursos
4. Implementar procesamiento asíncrono con queues

## 📊 Monitoreo

### Render

- Dashboard → Tu servicio → "Logs"
- Monitorea uso de CPU y memoria
- Plan Free: logs últimas 24 horas
- Plan Pro: logs 7 días

### Vercel

- Dashboard → Tu proyecto → "Analytics"
- Monitorea requests, errores, performance
- Plan Hobby: básico
- Plan Pro: análisis avanzado

## 💰 Costos Estimados

### Free Tier (Desarrollo/Testing)

- **Vercel**: Gratis (Hobby plan)
  - 100GB bandwidth/mes
  - Serverless functions incluidas
  
- **Render**: Gratis (Free plan)
  - 750 horas/mes
  - Se duerme después de 15 min inactividad
  - 512MB RAM
  
- **Anthropic**: Variable
  - Claude Sonnet 4.5: ~$3 per 1M tokens input
  - Claude Haiku 4.5: ~$0.25 per 1M tokens input

**Total**: ~$0-10/mes (dependiendo del uso de Claude)

### Producción (Uso Moderado)

- **Vercel Pro**: $20/mes
  - 1TB bandwidth
  - Sin límites de build time
  - Análisis avanzado
  
- **Render Starter**: $7/mes
  - Siempre activo
  - 512MB RAM
  - Mejor para producción
  
- **Anthropic**: Variable según uso

**Total**: ~$27-50/mes

### Producción (Uso Alto)

- **Vercel Enterprise**: Custom pricing
- **Render Pro**: $25/mes (1GB RAM)
- **Anthropic**: $100-500/mes (uso intensivo)

**Total**: ~$150-600/mes

## 🔄 CI/CD Automático

Ambos servicios tienen CI/CD integrado:

- **Push a `main`** → Deploy automático en Render y Vercel
- **Pull Requests** → Preview deployments en Vercel
- **Rollback** → Un click en ambas plataformas

## 📈 Escalabilidad

### Para más tráfico:

1. **Render**: Upgrade a Pro/Enterprise
2. **Vercel**: Upgrade a Pro/Enterprise
3. **Redis**: Agregar para caché (Upstash)
4. **CDN**: Cloudflare para assets estáticos
5. **Queue**: Implementar procesamiento asíncrono

### Para más usuarios:

1. Implementar rate limiting más estricto
2. Agregar autenticación de usuarios
3. Implementar sistema de cuotas
4. Considerar PostgreSQL para datos persistentes
5. Implementar caché de resultados

## 🎉 ¡Listo!

Tu aplicación está ahora desplegada y lista para usar. Comparte tu URL con otros usuarios:

```
https://tu-frontend.vercel.app
```

## 📞 Soporte

- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Anthropic**: https://docs.anthropic.com
- **GitHub Issues**: Para bugs del proyecto
