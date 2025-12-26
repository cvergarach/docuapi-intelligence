const express = require('express');
const apiController = require('../controllers/apiController');

const router = express.Router();

// Ejecutar una API
router.post('/api', apiController.executeApi.bind(apiController));

// Ejecutar múltiples APIs en lote
router.post('/batch', apiController.executeBatch.bind(apiController));

// Validar una API
router.post('/validate', apiController.validateApi.bind(apiController));

module.exports = router;
