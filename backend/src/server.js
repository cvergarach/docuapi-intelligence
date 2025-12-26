require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const documentRoutes = require('./routes/documentRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use(limiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

console.log('🔐 CORS Configuration:');
console.log('   Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS: Allowed origin (exact match): ${origin}`);
      return callback(null, true);
    }

    // Check if origin is a Vercel preview deployment
    // Vercel preview URLs follow pattern: https://docuapi-intelligence-*.vercel.app
    const isVercelPreview = origin.match(/^https:\/\/docuapi-intelligence.*\.vercel\.app$/);
    if (isVercelPreview) {
      console.log(`✅ CORS: Allowed origin (Vercel preview): ${origin}`);
      return callback(null, true);
    }

    // Reject all other origins
    console.log(`❌ CORS: Rejected origin: ${origin}`);
    console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(null, false); // Don't throw error, just reject
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DocuAPI Intelligence Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/execute', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
