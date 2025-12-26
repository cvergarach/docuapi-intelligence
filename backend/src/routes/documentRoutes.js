const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');

const router = express.Router();

// Configurar multer para manejar uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Permitir PDFs, DOCX y TXT
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Solo PDF, DOCX y TXT permitidos.'));
    }
  }
});

// Obtener modelos disponibles
router.get('/models', documentController.getModels.bind(documentController));

// Subir y procesar documento
router.post('/upload', upload.single('file'), documentController.uploadDocument.bind(documentController));

// Procesar URL (web scraping)
router.post('/scrape', documentController.scrapeUrl.bind(documentController));

// Obtener análisis por ID
router.get('/analysis/:id', documentController.getAnalysis.bind(documentController));

module.exports = router;
