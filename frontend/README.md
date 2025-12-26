# 🚀 DocuAPI Intelligence - Frontend

Frontend application para DocuAPI Intelligence, construido con Next.js 14 y React.

## 🛠️ Tecnologías

- **Next.js 14** - Framework React
- **React 18** - Librería UI
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Backend corriendo (local o en Render)

## 🔧 Instalación Local

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env.local`:
```bash
cp .env.example .env.local
```

3. Configurar variable de entorno:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

5. Abrir navegador en `http://localhost:3000`

## 🌐 Deploy en Vercel

### Opción 1: Deploy Automático desde GitHub

1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `NEXT_PUBLIC_API_URL` → URL de tu backend en Render
3. Deploy automático al hacer push

### Opción 2: Deploy Manual

```bash
npm run build
vercel --prod
```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar build de producción
npm start

# Linting
npm run lint
```

## 🎨 Características

- ✅ Interfaz intuitiva y moderna
- ✅ Drag & drop para archivos
- ✅ Web scraping de URLs
- ✅ Visualización de credenciales y APIs
- ✅ Ejecución de APIs con un clic
- ✅ Selector de modelos de Claude
- ✅ Resultados en tiempo real
- ✅ Responsive design
- ✅ Manejo de errores robusto

## 🔐 Variables de Entorno

### Desarrollo (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Producción (Vercel)
```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

## 📱 Estructura de Componentes

```
src/
├── app/
│   ├── layout.js          # Layout principal
│   ├── page.js            # Página home
│   └── globals.css        # Estilos globales
└── components/
    ├── Header.js          # Header de la app
    ├── DocumentUpload.js  # Upload de archivos y URL
    ├── ResultsDisplay.js  # Visualización de resultados
    └── ApiExecutor.js     # Ejecución de APIs
```

## 🎯 Flujo de Usuario

1. **Subir Documento o URL**
   - Arrastrar archivo o seleccionar
   - O ingresar URL para scraping

2. **Seleccionar Modelo**
   - Claude Sonnet 4.5 (recomendado)
   - Claude Haiku 4.5 (rápido)
   - Claude Sonnet 3.5 (equilibrado)

3. **Ver Resultados**
   - Resumen del documento
   - Credenciales extraídas
   - APIs encontradas
   - Metadata del análisis

4. **Configurar Credenciales**
   - Editar valores si es necesario
   - Verificar asociaciones con APIs

5. **Ejecutar APIs**
   - Ejecutar individualmente
   - O ejecutar todas en batch
   - Ver resultados en tiempo real

## 🐛 Troubleshooting

**Error: "Cannot connect to backend"**
- Verificar que el backend esté corriendo
- Verificar NEXT_PUBLIC_API_URL en .env.local
- Revisar CORS en el backend

**Error: "File type not supported"**
- Solo se aceptan PDF, DOCX y TXT
- Máximo 100MB

**Estilos no se cargan**
- Ejecutar `npm run build` y reiniciar
- Verificar instalación de Tailwind CSS

## 🎨 Personalización

### Colores
Editar `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {...}
    }
  }
}
```

### Límites
Editar en componentes:
- `DocumentUpload.js` - Tamaño máximo de archivo
- `ApiExecutor.js` - Timeout de APIs

## 📝 Notas

- El frontend no almacena credenciales
- Los resultados se mantienen en memoria durante la sesión
- Compatible con todos los navegadores modernos
- Optimizado para mobile y desktop

## 🔗 Enlaces Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel Deploy](https://vercel.com/docs)
- [Claude API](https://docs.anthropic.com)
