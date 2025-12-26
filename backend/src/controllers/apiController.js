const axios = require('axios');
const VariableDetector = require('../utils/variableDetector');
const ResponseTranslator = require('../services/responseTranslator');

class ApiController {
  /**
   * Ejecutar una API con las credenciales proporcionadas
   */
  async executeApi(req, res) {
    try {
      const { api, credentials, variables } = req.body;

      if (!api || !api.url || !api.method) {
        return res.status(400).json({
          success: false,
          error: 'Datos de API incompletos',
          humanMessage: '❌ La información de la API está incompleta. Falta la URL o el método HTTP.'
        });
      }

      console.log(`🚀 Executing API: ${api.method} ${api.url}`);

      // Detectar variables requeridas
      const detectedVars = VariableDetector.detectApiVariables(api);
      console.log(`📝 Variables detected:`, detectedVars);

      // Preparar valores para reemplazo (credenciales + variables)
      const allValues = {};

      // Agregar credenciales
      if (credentials && Array.isArray(credentials)) {
        credentials.forEach(cred => {
          if (cred.name && cred.value) {
            allValues[cred.name] = cred.value;
          }
        });
      }

      // Agregar variables
      if (variables) {
        Object.assign(allValues, variables);
      }

      // Validar que todas las variables tengan valor
      const validation = VariableDetector.validateVariables(api, allValues);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Faltan variables requeridas',
          humanMessage: `❌ Faltan datos necesarios:\n\n${validation.missing.map(v => `• ${v}`).join('\n')}\n\n**¿Qué hacer?**\nCompleta todos los campos requeridos antes de ejecutar.`,
          missing: validation.missing,
          required: validation.required
        });
      }

      // Reemplazar variables en la API
      const processedApi = VariableDetector.replaceApiVariables(api, allValues);
      console.log(`✅ Variables replaced. Final URL: ${processedApi.url}`);

      console.log(`🚀 Executing API: ${processedApi.method} ${processedApi.url}`);

      // Preparar headers
      const headers = { ...processedApi.headers };

      // Preparar body
      let body = processedApi.body || {};

      // Configuración de la petición
      const config = {
        method: processedApi.method.toLowerCase(),
        url: processedApi.url,
        headers: headers,
        timeout: 30000, // 30 segundos
        validateStatus: () => true // Aceptar cualquier status code
      };

      // Agregar params si existen
      if (processedApi.params && Object.keys(processedApi.params).length > 0) {
        config.params = processedApi.params;
      }

      // Agregar body para métodos que lo permiten
      if (['post', 'put', 'patch'].includes(processedApi.method.toLowerCase())) {
        if (Object.keys(body).length > 0) {
          config.data = body;
        }
      }

      console.log('📤 Request config:', {
        method: config.method,
        url: config.url,
        headers: Object.keys(config.headers),
        hasParams: !!config.params,
        hasBody: !!config.data
      });

      // Ejecutar la petición
      const startTime = Date.now();
      const response = await axios(config);
      const executionTime = Date.now() - startTime;

      console.log(`✅ API Response: ${response.status} (${executionTime}ms)`);

      // Traducir respuesta a lenguaje humano
      const translated = ResponseTranslator.translateResponse(response, api);

      // Determinar si fue exitoso
      const isSuccess = response.status >= 200 && response.status < 300;

      res.json({
        success: isSuccess,
        humanMessage: translated.humanMessage,
        statusText: translated.statusText,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          executionTime: executionTime,
          timestamp: new Date().toISOString(),
          keyData: translated.keyData
        }
      });

    } catch (error) {
      console.error('❌ Error executing API:', error);

      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código fuera del rango 2xx
        const translated = ResponseTranslator.translateResponse(error.response, api);
        res.status(200).json({
          success: false,
          humanMessage: translated.humanMessage,
          statusText: translated.statusText,
          data: {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data,
            error: `API respondió con error ${error.response.status}`
          }
        });
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        res.status(200).json({
          success: false,
          humanMessage: '❌ No se pudo conectar con el servidor\n\n**Posibles causas:**\n• El servidor no está disponible\n• Problemas de red\n• URL incorrecta\n\n**¿Qué hacer?**\nVerifica la URL y tu conexión a internet.',
          data: {
            error: 'No se recibió respuesta del servidor',
            details: error.message
          }
        });
      } else {
        // Algo pasó al configurar la petición
        res.status(200).json({
          success: false,
          humanMessage: '❌ Error al preparar la solicitud\n\n**Detalles:**\n' + error.message,
          data: {
            error: 'Error al configurar la petición',
            details: error.message
          }
        });
      }
    }
  }

  /**
   * Ejecutar múltiples APIs en secuencia
   */
  async executeBatch(req, res) {
    try {
      const { apis, credentials } = req.body;

      if (!apis || !Array.isArray(apis) || apis.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de APIs'
        });
      }

      console.log(`🚀 Executing batch of ${apis.length} APIs`);

      const results = [];

      for (let i = 0; i < apis.length; i++) {
        const api = apis[i];
        console.log(`\n📍 Executing API ${i + 1}/${apis.length}: ${api.name}`);

        try {
          // Simular la ejecución individual
          const mockReq = {
            body: {
              api: api,
              credentials: credentials
            }
          };

          let result = null;
          const mockRes = {
            json: (data) => { result = data; },
            status: () => mockRes
          };

          await this.executeApi(mockReq, mockRes);

          results.push({
            api: api.name,
            index: i,
            ...result
          });

          // Pequeña pausa entre requests
          if (i < apis.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }

        } catch (error) {
          results.push({
            api: api.name,
            index: i,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`\n✅ Batch completed: ${successCount}/${apis.length} successful`);

      res.json({
        success: true,
        data: {
          total: apis.length,
          successful: successCount,
          failed: apis.length - successCount,
          results: results
        }
      });

    } catch (error) {
      console.error('❌ Error executing batch:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Validar una API antes de ejecutarla
   */
  async validateApi(req, res) {
    try {
      const { api } = req.body;

      if (!api) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó API para validar'
        });
      }

      const issues = [];
      const warnings = [];

      // Validar URL
      try {
        new URL(api.url);
      } catch (e) {
        issues.push('URL inválida o mal formada');
      }

      // Validar método
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      if (!api.method || !validMethods.includes(api.method.toUpperCase())) {
        issues.push('Método HTTP inválido');
      }

      // Advertencias
      if (!api.headers || Object.keys(api.headers).length === 0) {
        warnings.push('No se especificaron headers');
      }

      if (api.requiredCredentials && api.requiredCredentials.length === 0) {
        warnings.push('No se requieren credenciales para esta API');
      }

      res.json({
        success: issues.length === 0,
        isValid: issues.length === 0,
        issues: issues,
        warnings: warnings
      });

    } catch (error) {
      console.error('Error validating API:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ApiController();
