# ⚡ Inicio Rápido - DocuAPI Intelligence

Guía de 5 minutos para poner el proyecto en marcha localmente.

## 📋 Antes de Empezar

Necesitas:
- ✅ Node.js 18+ instalado
- ✅ npm o yarn
- ✅ API Key de Anthropic ([obtener aquí](https://console.anthropic.com))
- ✅ Terminal o línea de comandos

## 🚀 Opción 1: Setup Completo (Recomendado)

### Paso 1: Backend

```bash
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env y agregar tu API Key de Anthropic
# ANTHROPIC_API_KEY=tu_api_key_aqui

# Iniciar servidor
npm run dev
```

El backend estará corriendo en `http://localhost:3001`

### Paso 2: Frontend (en otra terminal)

```bash
# Navegar al frontend
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.example .env.local

# Iniciar aplicación
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### Paso 3: Probar

1. Abre `http://localhost:3000` en tu navegador
2. Sube un documento de prueba o ingresa una URL
3. ¡Listo! 🎉

## 🎯 Opción 2: Test Rápido (Solo Backend)

Si solo quieres probar el procesamiento de documentos:

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu API Key
npm run dev
```

Luego prueba con cURL:

```bash
# Health check
curl http://localhost:3001/health

# Obtener modelos disponibles
curl http://localhost:3001/api/documents/models
```

## 📝 Configuración Mínima

### Backend (.env)

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 Prueba con Ejemplo

Crea un archivo `test-api.txt`:

```
API de Prueba

Credenciales:
- API Key: test_key_123456
- Bearer Token: bearer_xyz789

Endpoint: GET https://api.example.com/users
Headers:
  Authorization: Bearer {token}
  X-API-Key: {api_key}
```

Súbelo y ve la magia ✨

## ❗ Problemas Comunes

### "Cannot find module..."
```bash
# Solución: Instalar dependencias
npm install
```

### "Port 3000 already in use"
```bash
# Solución: Cambiar puerto en package.json o matar el proceso
# En Mac/Linux:
lsof -ti:3000 | xargs kill -9

# En Windows:
netstat -ano | findstr :3000
taskkill /PID [número] /F
```

### "ANTHROPIC_API_KEY is not defined"
```bash
# Solución: Verificar .env
cat backend/.env | grep ANTHROPIC_API_KEY
```

### "CORS error"
```bash
# Solución: Verificar ALLOWED_ORIGINS en backend/.env
# Debe incluir http://localhost:3000
```

## 🎨 Estructura de Carpetas

```
docuapi-intelligence/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Rutas de la API
│   │   └── services/        # Servicios (Claude, Docs)
│   ├── .env                 # Variables de entorno
│   └── package.json
│
├── frontend/                # App Next.js
│   ├── src/
│   │   ├── app/            # Páginas y layout
│   │   └── components/     # Componentes React
│   ├── .env.local          # Variables de entorno
│   └── package.json
│
├── README.md               # Documentación principal
├── DEPLOYMENT.md           # Guía de deploy
├── EXAMPLES.md             # Ejemplos de prueba
└── QUICKSTART.md           # Esta guía
```

## 🔄 Comandos Útiles

### Backend
```bash
npm run dev      # Desarrollo con hot reload
npm start        # Producción
```

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm start        # Servir build
npm run lint     # Verificar código
```

## 📊 Verificación del Setup

✅ Backend corriendo: http://localhost:3001/health

✅ Frontend corriendo: http://localhost:3000

✅ Puede subir archivos

✅ Puede extraer credenciales

✅ Puede ejecutar APIs

## 🚀 Siguiente Paso: Deploy

Una vez que todo funcione localmente, sigue la guía en `DEPLOYMENT.md` para:
- Deploy del backend en Render
- Deploy del frontend en Vercel
- Configuración de dominio personalizado

## 💡 Tips

1. **Desarrollo**: Usa `npm run dev` en ambos proyectos
2. **Logs**: Revisa la terminal para ver errores
3. **Cambios**: Hot reload automático en desarrollo
4. **Testing**: Usa los ejemplos en `EXAMPLES.md`

## 📞 ¿Necesitas Ayuda?

- 📖 Lee `README.md` para documentación completa
- 🚀 Lee `DEPLOYMENT.md` para deploy en producción
- 📝 Usa `EXAMPLES.md` para documentos de prueba
- 🐛 Revisa los logs en la terminal

## ⏱️ Timeline Esperado

- Backend setup: 2-3 minutos
- Frontend setup: 2-3 minutos
- Primera prueba: 1 minuto
- **Total: ~5-7 minutos**

## 🎉 ¡Éxito!

Si llegaste aquí, tu sistema está corriendo. Ahora puedes:

1. ✅ Subir documentos PDF, DOCX, TXT
2. ✅ Hacer web scraping de URLs
3. ✅ Extraer credenciales automáticamente
4. ✅ Identificar APIs
5. ✅ Ejecutar APIs con un clic

¡Disfruta de DocuAPI Intelligence! 🚀
