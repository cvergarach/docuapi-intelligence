const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }

    /**
     * Modelos disponibles de Gemini
     */
    getAvailableModels() {
        return {
            // Gemini 3.x Series (Latest - Nov/Dec 2025)
            'gemini-3-pro': {
                id: 'gemini-3-pro',
                name: 'Gemini 3 Pro',
                description: 'Más potente, multimodal, adaptive thinking',
                provider: 'google',
                maxTokens: 1000000
            },
            'gemini-3-flash': {
                id: 'gemini-3-flash',
                name: 'Gemini 3 Flash',
                description: 'Rendimiento frontier-class, rápido',
                provider: 'google',
                maxTokens: 1000000
            },

            // Gemini 2.5 Series (June 2025)
            'gemini-2.5-pro': {
                id: 'gemini-2.5-pro',
                name: 'Gemini 2.5 Pro',
                description: 'Razonamiento complejo, multi-step thinking',
                provider: 'google',
                maxTokens: 1048576
            },
            'gemini-2.5-flash': {
                id: 'gemini-2.5-flash',
                name: 'Gemini 2.5 Flash',
                description: 'Respuestas rápidas y fundamentadas',
                provider: 'google',
                maxTokens: 1048576
            },
            'gemini-2.5-flash-lite': {
                id: 'gemini-2.5-flash-lite',
                name: 'Gemini 2.5 Flash Lite',
                description: 'Bajo costo, alto rendimiento, ligero',
                provider: 'google',
                maxTokens: 1048576
            },

            // Gemini 2.0 Series (Feb 2025)
            'gemini-2.0-flash': {
                id: 'gemini-2.0-flash',
                name: 'Gemini 2.0 Flash',
                description: 'Eficiente y rápido, propósito general',
                provider: 'google',
                maxTokens: 1000000
            },

            // Gemini 1.5 Series (Legacy but still available)
            'gemini-1.5-pro': {
                id: 'gemini-1.5-pro',
                name: 'Gemini 1.5 Pro',
                description: 'Rendimiento equilibrado (legacy)',
                provider: 'google',
                maxTokens: 1000000
            },
            'gemini-1.5-flash': {
                id: 'gemini-1.5-flash',
                name: 'Gemini 1.5 Flash',
                description: 'Rápido y económico (legacy)',
                provider: 'google',
                maxTokens: 1000000
            }
        };
    }

    /**
     * Obtener el prompt por defecto para análisis
     */
    getDefaultPrompt() {
        return `Analiza el siguiente documento y extrae TODA la información relacionada con:

1. **CREDENCIALES**: API Keys, tokens, usuarios, contraseñas, secrets, client IDs, client secrets, authorization headers, bearer tokens, etc.
2. **APIs**: Endpoints, URLs, métodos HTTP, parámetros requeridos, headers necesarios, body de ejemplo, respuestas esperadas.

DOCUMENTO:
{{CONTENT}}

INSTRUCCIONES:
- Identifica TODAS las credenciales mencionadas, incluso si están en ejemplos o comentarios
- Para cada API encontrada, extrae: método HTTP, URL completa, headers requeridos, parámetros, body de ejemplo
- Si una credencial está asociada a una API específica, indícalo
- Organiza la información de forma estructurada

Responde ÚNICAMENTE con un JSON válido en este formato exacto:
{
  "credentials": [
    {
      "type": "string (api_key, token, username, password, etc)",
      "name": "string (nombre descriptivo)",
      "value": "string (valor de la credencial si está presente, o null)",
      "description": "string (contexto de uso)",
      "associatedApi": "string (nombre de API asociada si aplica, o null)"
    }
  ],
  "apis": [
    {
      "name": "string (nombre descriptivo de la API)",
      "method": "string (GET, POST, PUT, DELETE, etc)",
      "url": "string (URL completa del endpoint)",
      "headers": {
        "header-name": "valor o placeholder"
      },
      "params": {
        "param-name": "valor o placeholder"
      },
      "body": {},
      "requiredCredentials": ["string (nombres de credenciales requeridas)"],
      "description": "string (qué hace esta API)"
    }
  ],
  "summary": "string (resumen breve del documento)"
}

NO incluyas markdown, NO incluyas explicaciones adicionales, SOLO el JSON.`;
    }

    /**
     * Analiza el contenido del documento y extrae credenciales y APIs
     */
    async analyzeDocument(content, modelId = 'gemini-2.5-flash', customPrompt = null) {
        try {
            // Usar prompt personalizado o el por defecto
            const promptTemplate = customPrompt || this.getDefaultPrompt();
            const prompt = promptTemplate.replace('{{CONTENT}}', content);

            const model = this.client.getGenerativeModel({ model: modelId });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Limpiar markdown si está presente
            let jsonText = text.trim();
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const analysis = JSON.parse(jsonText);

            return {
                success: true,
                data: analysis,
                modelUsed: modelId,
                tokensUsed: {
                    promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: result.response.usageMetadata?.totalTokenCount || 0
                }
            };

        } catch (error) {
            console.error('Error analyzing document with Gemini:', error);
            throw new Error(`Error al analizar documento: ${error.message}`);
        }
    }
}

module.exports = new GeminiService();
