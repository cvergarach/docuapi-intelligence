const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Modelos disponibles de Claude
   */
  getAvailableModels() {
    return {
      'claude-sonnet-4-5': {
        id: 'claude-sonnet-4-5-20250929',
        name: 'Claude Sonnet 4.5',
        description: 'El modelo más inteligente, ideal para tareas complejas',
        maxTokens: 8000
      },
      'claude-haiku-4-5': {
        id: 'claude-haiku-4-5-20251001',
        name: 'Claude Haiku 4.5',
        description: 'Rápido y eficiente para tareas simples',
        maxTokens: 4000
      },
      'claude-sonnet-3-5': {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude Sonnet 3.5',
        description: 'Equilibrio entre velocidad y calidad',
        maxTokens: 8000
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
  async analyzeDocument(content, modelId = 'claude-sonnet-4-5-20250929', customPrompt = null) {
    try {
      // Usar prompt personalizado o el por defecto
      const promptTemplate = customPrompt || this.getDefaultPrompt();
      const prompt = promptTemplate.replace('{{CONTENT}}', content);

      const response = await this.client.messages.create({
        model: modelId,
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Extraer el contenido de texto de la respuesta
      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent) {
        throw new Error('No se recibió respuesta de texto de Claude');
      }

      let jsonText = textContent.text.trim();

      // Limpiar markdown si está presente
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const analysis = JSON.parse(jsonText);

      return {
        success: true,
        data: analysis,
        modelUsed: modelId,
        tokensUsed: response.usage
      };

    } catch (error) {
      console.error('Error analyzing document with Claude:', error);
      throw new Error(`Error al analizar documento: ${error.message}`);
    }
  }

  /**
   * Genera código para ejecutar una API basándose en credenciales
   */
  async generateApiExecutionCode(api, credentials, modelId = 'claude-sonnet-4-5-20250929') {
    try {
      const prompt = `Genera código JavaScript para ejecutar la siguiente API usando las credenciales proporcionadas.

API:
${JSON.stringify(api, null, 2)}

CREDENCIALES DISPONIBLES:
${JSON.stringify(credentials, null, 2)}

Genera código que:
1. Use fetch o axios para hacer la petición
2. Incluya todas las credenciales necesarias en headers o body
3. Maneje errores apropiadamente
4. Retorne un objeto con success y data/error

Responde ÚNICAMENTE con un JSON en este formato:
{
  "code": "string (código JavaScript completo listo para ejecutar)",
  "explanation": "string (explicación breve de qué hace)"
}`;

      const response = await this.client.messages.create({
        model: modelId,
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const textContent = response.content.find(block => block.type === 'text');
      let jsonText = textContent.text.trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      return JSON.parse(jsonText);

    } catch (error) {
      console.error('Error generating execution code:', error);
      throw new Error(`Error al generar código: ${error.message}`);
    }
  }

  /**
   * Valida y sanitiza credenciales antes de usarlas
   */
  async validateCredentials(credentials, modelId = 'claude-sonnet-4-5-20250929') {
    try {
      const prompt = `Analiza las siguientes credenciales y determina si son válidas y completas.

CREDENCIALES:
${JSON.stringify(credentials, null, 2)}

Responde con un JSON:
{
  "isValid": boolean,
  "issues": ["string (problemas encontrados)"],
  "suggestions": ["string (sugerencias de mejora)"]
}`;

      const response = await this.client.messages.create({
        model: modelId,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const textContent = response.content.find(block => block.type === 'text');
      let jsonText = textContent.text.trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      return JSON.parse(jsonText);

    } catch (error) {
      console.error('Error validating credentials:', error);
      return {
        isValid: true,
        issues: [],
        suggestions: []
      };
    }
  }
}

module.exports = new ClaudeService();
