const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');

// Obtener prompt por defecto
router.get('/default', promptController.getDefaultPrompt.bind(promptController));

module.exports = router;
