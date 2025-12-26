/**
 * Detecta variables/placeholders en strings
 * Formatos soportados: {{variable}}, {variable}, $variable, :variable
 */
class VariableDetector {
    /**
     * Detecta todas las variables en un string
     */
    static detectVariables(text) {
        if (!text || typeof text !== 'string') return [];

        const variables = new Set();

        // Detectar {{variable}}
        const doublebraceMatches = text.match(/\{\{([^}]+)\}\}/g);
        if (doublebraceMatches) {
            doublebraceMatches.forEach(match => {
                const varName = match.replace(/\{\{|\}\}/g, '').trim();
                variables.add(varName);
            });
        }

        // Detectar {variable}
        const braceMatches = text.match(/\{([^}]+)\}/g);
        if (braceMatches) {
            braceMatches.forEach(match => {
                const varName = match.replace(/\{|\}/g, '').trim();
                // Evitar JSON objects
                if (!varName.includes(':') && !varName.includes(',')) {
                    variables.add(varName);
                }
            });
        }

        return Array.from(variables);
    }

    /**
     * Detecta variables en un objeto API completo
     */
    static detectApiVariables(api) {
        const variables = new Set();

        // Variables en URL
        if (api.url) {
            this.detectVariables(api.url).forEach(v => variables.add(v));
        }

        // Variables en headers
        if (api.headers) {
            Object.values(api.headers).forEach(value => {
                if (typeof value === 'string') {
                    this.detectVariables(value).forEach(v => variables.add(v));
                }
            });
        }

        // Variables en params
        if (api.params) {
            Object.values(api.params).forEach(value => {
                if (typeof value === 'string') {
                    this.detectVariables(value).forEach(v => variables.add(v));
                }
            });
        }

        // Variables en body
        if (api.body && typeof api.body === 'object') {
            JSON.stringify(api.body).match(/\{\{([^}]+)\}\}/g)?.forEach(match => {
                const varName = match.replace(/\{\{|\}\}/g, '').trim();
                variables.add(varName);
            });
        }

        return Array.from(variables);
    }

    /**
     * Reemplaza variables en un string
     */
    static replaceVariables(text, values) {
        if (!text || typeof text !== 'string') return text;

        let result = text;

        Object.entries(values).forEach(([key, value]) => {
            // Reemplazar {{key}}
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
            // Reemplazar {key}
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });

        return result;
    }

    /**
     * Reemplaza variables en un objeto API completo
     */
    static replaceApiVariables(api, values) {
        const result = JSON.parse(JSON.stringify(api)); // Deep clone

        // Reemplazar en URL
        if (result.url) {
            result.url = this.replaceVariables(result.url, values);
        }

        // Reemplazar en headers
        if (result.headers) {
            Object.keys(result.headers).forEach(key => {
                if (typeof result.headers[key] === 'string') {
                    result.headers[key] = this.replaceVariables(result.headers[key], values);
                }
            });
        }

        // Reemplazar en params
        if (result.params) {
            Object.keys(result.params).forEach(key => {
                if (typeof result.params[key] === 'string') {
                    result.params[key] = this.replaceVariables(result.params[key], values);
                }
            });
        }

        // Reemplazar en body
        if (result.body) {
            const bodyStr = JSON.stringify(result.body);
            const replacedStr = this.replaceVariables(bodyStr, values);
            try {
                result.body = JSON.parse(replacedStr);
            } catch (e) {
                // Si falla el parse, dejar como string
                result.body = replacedStr;
            }
        }

        return result;
    }

    /**
     * Valida que todas las variables requeridas tengan valor
     */
    static validateVariables(api, values) {
        const required = this.detectApiVariables(api);
        const missing = [];

        required.forEach(varName => {
            if (!values[varName] || values[varName].toString().trim() === '') {
                missing.push(varName);
            }
        });

        return {
            valid: missing.length === 0,
            missing: missing,
            required: required
        };
    }
}

module.exports = VariableDetector;
