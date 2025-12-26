const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs').promises;

class DocumentService {
  /**
   * Procesa un archivo PDF
   */
  async processPdf(buffer) {
    try {
      const data = await pdf(buffer);
      
      return {
        success: true,
        content: data.text,
        metadata: {
          pages: data.numpages,
          info: data.info,
          type: 'pdf'
        }
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error(`Error procesando PDF: ${error.message}`);
    }
  }

  /**
   * Procesa un archivo DOCX (Word)
   */
  async processDocx(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      return {
        success: true,
        content: result.value,
        metadata: {
          type: 'docx',
          messages: result.messages
        }
      };
    } catch (error) {
      console.error('Error processing DOCX:', error);
      throw new Error(`Error procesando DOCX: ${error.message}`);
    }
  }

  /**
   * Procesa un archivo de texto plano
   */
  async processTxt(buffer) {
    try {
      const content = buffer.toString('utf-8');
      
      return {
        success: true,
        content: content,
        metadata: {
          type: 'txt',
          size: buffer.length
        }
      };
    } catch (error) {
      console.error('Error processing TXT:', error);
      throw new Error(`Error procesando TXT: ${error.message}`);
    }
  }

  /**
   * Realiza web scraping de una URL
   */
  async scrapeWebsite(url) {
    try {
      // Validar URL
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Solo se permiten URLs HTTP o HTTPS');
      }

      // Hacer request
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
        },
        timeout: 30000, // 30 segundos
        maxContentLength: 50 * 1024 * 1024, // 50MB max
      });

      const $ = cheerio.load(response.data);

      // Remover scripts, estilos y otros elementos no deseados
      $('script, style, noscript, iframe, nav, footer, header, aside').remove();

      // Extraer texto principal
      const bodyText = $('body').text().trim();
      
      // Limpiar texto (remover múltiples espacios y saltos de línea)
      const cleanedText = bodyText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      // Extraer información adicional
      const metadata = {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        type: 'web-scraping',
        url: url,
        scrapedAt: new Date().toISOString()
      };

      // Extraer código de ejemplos si existen
      const codeBlocks = [];
      $('pre, code').each((i, elem) => {
        const code = $(elem).text().trim();
        if (code.length > 10) {
          codeBlocks.push(code);
        }
      });

      let content = cleanedText;
      
      // Si hay bloques de código, agregarlos al final
      if (codeBlocks.length > 0) {
        content += '\n\n--- EJEMPLOS DE CÓDIGO ENCONTRADOS ---\n\n';
        content += codeBlocks.join('\n\n---\n\n');
      }

      return {
        success: true,
        content: content,
        metadata: metadata
      };

    } catch (error) {
      console.error('Error scraping website:', error);
      
      if (error.code === 'ENOTFOUND') {
        throw new Error('No se pudo encontrar el sitio web');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Tiempo de espera agotado al conectar con el sitio');
      } else if (error.response) {
        throw new Error(`Error HTTP ${error.response.status}: ${error.response.statusText}`);
      } else {
        throw new Error(`Error al hacer scraping: ${error.message}`);
      }
    }
  }

  /**
   * Procesa un documento según su tipo
   */
  async processDocument(file) {
    try {
      const { buffer, mimetype, originalname } = file;

      let result;

      switch (mimetype) {
        case 'application/pdf':
          result = await this.processPdf(buffer);
          break;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          result = await this.processDocx(buffer);
          break;

        case 'text/plain':
          result = await this.processTxt(buffer);
          break;

        default:
          // Intentar como texto plano si no reconocemos el tipo
          try {
            result = await this.processTxt(buffer);
          } catch (e) {
            throw new Error(`Tipo de archivo no soportado: ${mimetype}`);
          }
      }

      result.metadata.originalName = originalname;
      result.metadata.size = buffer.length;
      
      return result;

    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  /**
   * Divide documentos grandes en chunks para procesamiento
   */
  chunkText(text, maxChunkSize = 100000) {
    const chunks = [];
    let currentChunk = '';

    const paragraphs = text.split('\n\n');

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

module.exports = new DocumentService();
