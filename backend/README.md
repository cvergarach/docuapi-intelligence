# 🚀 DocuAPI Intelligence - Backend

Backend API para procesamiento de documentos y ejecución automática de APIs usando Claude AI.

## 🛠️ Tecnologías

- **Node.js** 18+
- **Express** - Framework web
- **Claude API** - Procesamiento AI
- **pdf-parse** - Procesamiento de PDFs
- **mammoth** - Procesamiento de DOCX
- **cheerio** - Web scraping
- **axios** - Cliente HTTP

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- API Key de Anthropic (Claude)

## 🔧 Instalación Local

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno en `.env`:
```env
ANTHROPIC_API_KEY=tu_api_key_aqui
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

4. Iniciar servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🌐 API Endpoints

### Documentos

**GET** `/api/documents/models`
- Obtener lista de modelos de Claude disponibles

**POST** `/api/documents/upload`
- Subir y analizar documento (PDF, DOCX, TXT)
- Body: `multipart/form-data`
- Fields: `file` (archivo), `model` (opcional)

**POST** `/api/documents/scrape`
- Hacer web scraping de una URL
- Body: `{ "url": "https://...", "model": "claude-sonnet-4-5-20250929" }`

**GET** `/api/documents/analysis/:id`
- Obtener análisis guardado por ID

### Ejecución de APIs

**POST** `/api/execute/api`
- Ejecutar una API
- Body: `{ "api": {...}, "credentials": [...] }`

**POST** `/api/execute/batch`
- Ejecutar múltiples APIs en lote
- Body: `{ "apis": [...], "credentials": [...] }`

**POST** `/api/execute/validate`
- Validar una API antes de ejecutarla
- Body: `{ "api": {...} }`

## 📦 Deploy en Render

1. Crear cuenta en [Render](https://render.com)

2. Crear nuevo Web Service:
   - Conectar repositorio de GitHub
   - Build Command: `npm install`
   - Start Command: `npm start`

3. Configurar variables de entorno:
   - `ANTHROPIC_API_KEY`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` (URL de tu frontend en Vercel)

4. Deploy automático al hacer push

## 🔒 Seguridad

- Rate limiting habilitado (100 requests por 15 minutos)
- CORS configurado
- Helmet para headers de seguridad
- Validación de tipos de archivo
- Timeout en requests (30 segundos)

## 📊 Capacidades

- ✅ PDFs hasta 1500 páginas
- ✅ Documentos DOCX y TXT
- ✅ Web scraping con headers personalizados
- ✅ Extracción automática de credenciales y APIs
- ✅ Ejecución de APIs REST
- ✅ Soporte para múltiples modelos de Claude
- ✅ Chunking automático de documentos grandes

## 🐛 Troubleshooting

**Error: "ANTHROPIC_API_KEY no configurada"**
- Verificar que `.env` tenga la API key correcta

**Error: "Tipo de archivo no soportado"**
- Solo se permiten PDF, DOCX y TXT

**Error: "CORS"**
- Agregar el origen del frontend a `ALLOWED_ORIGINS`

**Timeout en scraping**
- Algunas páginas pueden tardar más de 30 segundos
- El límite se puede ajustar en `documentService.js`
