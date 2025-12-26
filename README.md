# 🚀 DocuAPI Intelligence

Sistema inteligente para procesar documentos grandes, extraer credenciales y ejecutar APIs automáticamente.

## 🎯 Características

- ✅ Procesa PDFs de hasta 1500 páginas
- ✅ Web scraping de páginas web
- ✅ Lee archivos TXT y DOCX
- ✅ Extrae credenciales y APIs automáticamente usando Claude AI
- ✅ Ejecuta APIs de forma automática
- ✅ Interfaz visual simple (no requiere conocimientos técnicos)
- ✅ Selección de modelos de Claude

## 🏗️ Arquitectura

```
Frontend (Next.js) → Vercel
Backend (Node.js + Express) → Render
AI Processing → Claude API (Anthropic)
```

## 📦 Estructura del Proyecto

```
docuapi-intelligence/
├── frontend/          # Next.js app
├── backend/           # Express API
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Backend (Render)
1. Conectar repositorio a Render
2. Configurar variables de entorno
3. Deploy como Web Service

## 🔐 Variables de Entorno

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

### Backend (.env)
```
ANTHROPIC_API_KEY=tu_api_key_aqui
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

## 📝 Uso

1. Subir documento (PDF, DOCX, TXT) o ingresar URL para scraping
2. Seleccionar modelo de Claude
3. El sistema extrae automáticamente credenciales y APIs
4. Revisar y editar credenciales si es necesario
5. Ejecutar APIs con un clic
6. Ver resultados en tiempo real

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Express, pdf-parse, cheerio, mammoth
- **AI**: Claude API (Anthropic)
- **Deploy**: Vercel + Render
