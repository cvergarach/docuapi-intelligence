const documentService = require('../services/documentService');
const claudeService = require('../services/claudeService');
const geminiService = require('../services/geminiService');
const { v4: uuidv4 } = require('uuid');
const VariableDetector = require('../utils/variableDetector');
const VariableClassifier = require('../utils/variableClassifier');

// Almacenamiento en memoria para resultados (en producción, usar Redis o base de datos)
const analysisCache = new Map();

class DocumentController {
  /**
   * Obtener modelos disponibles de Claude y Gemini
   */
  async getModels(req, res) {
    try {
      const claudeModels = claudeService.getAvailableModels();
      const geminiModels = geminiService.getAvailableModels();

      // Combinar modelos de ambos proveedores
      const allModels = [
        ...Object.values(claudeModels).map(m => ({ ...m, provider: 'anthropic' })),
        ...Object.values(geminiModels)
      ];

      res.json({
        success: true,
        models: allModels
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Procesar archivo subido
   */
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo'
        });
      }

      const modelId = req.body.model || 'claude-sonnet-4-5-20250929';
      const customPrompt = req.body.customPrompt || null;

      console.log(`📄 Processing document: ${req.file.originalname}`);
      console.log(`🤖 Using model: ${modelId}`);

      // Procesar el documento
      const documentResult = await documentService.processDocument(req.file);

      if (!documentResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al procesar el documento'
        });
      }

      console.log(`✅ Document processed: ${documentResult.metadata.type}`);
      console.log(`📊 Content length: ${documentResult.content.length} characters`);

      // Si el documento es muy grande, dividirlo en chunks
      let contentToAnalyze = documentResult.content;
      let isChunked = false;

      if (documentResult.content.length > 150000) {
        console.log('📦 Document too large, chunking...');
        const chunks = documentService.chunkText(documentResult.content, 100000);
        contentToAnalyze = chunks[0]; // Por ahora solo procesamos el primer chunk
        isChunked = true;
        console.log(`📦 Using first chunk of ${chunks.length} total chunks`);
      }

      // Detectar proveedor basado en el ID del modelo
      const isGemini = modelId.startsWith('gemini-');
      const aiService = isGemini ? geminiService : claudeService;
      const providerName = isGemini ? 'Gemini' : 'Claude';

      // Analizar con el servicio correspondiente
      console.log(`🧠 Analyzing with ${providerName}...`);
      if (customPrompt) {
        console.log('📝 Using custom prompt');
      }
      const analysis = await aiService.analyzeDocument(contentToAnalyze, modelId, customPrompt);

      // Generar ID único para esta análisis
      const analysisId = uuidv4();

      // Guardar en caché (expira en 1 hora)
      const cacheData = {
        id: analysisId,
        documentMetadata: documentResult.metadata,
        analysis: analysis.data,
        modelUsed: analysis.modelUsed,
        tokensUsed: analysis.tokensUsed,
        isChunked: isChunked,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hora
      };

      analysisCache.set(analysisId, cacheData);

      // Limpiar caché expirada
      this.cleanExpiredCache();

      console.log('✅ Analysis completed successfully');

      // Clasificar credenciales detectadas
      const allCredentials = analysis.data.credentials || [];
      const classifiedCreds = allCredentials.map(cred => ({
        ...cred,
        isCredential: VariableClassifier.isCredential(cred.name),
        description: cred.description || VariableClassifier.getDescription(cred.name),
        example: VariableClassifier.getExample(cred.name)
      }));

      // Clasificar variables en APIs
      const classifiedApis = (analysis.data.apis || []).map(api => {
        const variables = VariableDetector.detectApiVariables(api);
        const classification = VariableClassifier.classify(variables);

        return {
          ...api,
          variables: {
            all: variables,
            credentials: classification.credentials,
            dynamic: classification.dynamicVariables
          }
        };
      });

      res.json({
        success: true,
        analysisId: analysisId,
        data: {
          credentials: classifiedCreds,
          apis: classifiedApis,
          summary: analysis.data.summary || '',
          metadata: {
            document: documentResult.metadata,
            model: analysis.modelUsed,
            tokens: analysis.tokensUsed,
            isChunked: isChunked
          }
        }
      });

    } catch (error) {
      console.error('❌ Error uploading document:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Procesar URL (web scraping)
   */
  async scrapeUrl(req, res) {
    try {
      const { url, model } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ninguna URL'
        });
      }

      const modelId = model || 'claude-sonnet-4-5-20250929';

      console.log(`🌐 Scraping URL: ${url}`);
      console.log(`🤖 Using model: ${modelId}`);

      // Hacer scraping
      const scrapingResult = await documentService.scrapeWebsite(url);

      if (!scrapingResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Error al hacer scraping de la URL'
        });
      }

      console.log(`✅ Scraping completed`);
      console.log(`📊 Content length: ${scrapingResult.content.length} characters`);

      // Si el contenido es muy grande, dividirlo
      let contentToAnalyze = scrapingResult.content;
      let isChunked = false;

      if (scrapingResult.content.length > 150000) {
        const chunks = documentService.chunkText(scrapingResult.content, 100000);
        contentToAnalyze = chunks[0];
        isChunked = true;
        console.log(`📦 Using first chunk of ${chunks.length} total chunks`);
      }

      // Detectar proveedor basado en el ID del modelo
      const isGemini = modelId.startsWith('gemini-');
      const aiService = isGemini ? geminiService : claudeService;
      const providerName = isGemini ? 'Gemini' : 'Claude';

      // Analizar con el servicio correspondiente
      console.log(`🧠 Analyzing with ${providerName}...`);
      const analysis = await aiService.analyzeDocument(contentToAnalyze, modelId);

      // Generar ID único
      const analysisId = uuidv4();

      // Guardar en caché
      const cacheData = {
        id: analysisId,
        documentMetadata: scrapingResult.metadata,
        analysis: analysis.data,
        modelUsed: analysis.modelUsed,
        tokensUsed: analysis.tokensUsed,
        isChunked: isChunked,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };

      analysisCache.set(analysisId, cacheData);
      this.cleanExpiredCache();

      console.log('✅ Analysis completed successfully');

      res.json({
        success: true,
        analysisId: analysisId,
        data: {
          credentials: analysis.data.credentials || [],
          apis: analysis.data.apis || [],
          summary: analysis.data.summary || '',
          metadata: {
            document: scrapingResult.metadata,
            model: analysis.modelUsed,
            tokens: analysis.tokensUsed,
            isChunked: isChunked
          }
        }
      });

    } catch (error) {
      console.error('❌ Error scraping URL:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener análisis por ID
   */
  async getAnalysis(req, res) {
    try {
      const { id } = req.params;

      const analysis = analysisCache.get(id);

      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: 'Análisis no encontrado o expirado'
        });
      }

      res.json({
        success: true,
        data: analysis
      });

    } catch (error) {
      console.error('Error getting analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Limpiar caché expirada
   */
  cleanExpiredCache() {
    const now = new Date();
    for (const [key, value] of analysisCache.entries()) {
      if (new Date(value.expiresAt) < now) {
        analysisCache.delete(key);
      }
    }
  }
}

module.exports = new DocumentController();
