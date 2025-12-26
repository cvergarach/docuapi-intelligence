const claudeService = require('../services/claudeService');
const geminiService = require('../services/geminiService');

class PromptController {
    /**
     * Obtener el prompt por defecto para análisis de documentos
     */
    async getDefaultPrompt(req, res) {
        try {
            const { provider } = req.query; // 'claude' o 'gemini'

            let prompt;
            if (provider === 'gemini') {
                prompt = geminiService.getDefaultPrompt();
            } else {
                // Default a Claude
                prompt = claudeService.getDefaultPrompt();
            }

            res.json({
                success: true,
                prompt: prompt,
                provider: provider || 'claude'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new PromptController();
