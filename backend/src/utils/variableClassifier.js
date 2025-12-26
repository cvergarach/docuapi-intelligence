/**
 * Clasifica variables en credenciales vs variables dinámicas
 */
class VariableClassifier {
    /**
     * Palabras clave que indican que es una credencial
     */
    static CREDENTIAL_KEYWORDS = [
        'token', 'key', 'secret', 'password', 'pass', 'pwd',
        'auth', 'authorization', 'bearer', 'api_key', 'apikey',
        'access_token', 'refresh_token', 'session', 'ticket',
        'credential', 'client_id', 'client_secret'
    ];

    /**
     * Palabras clave que indican que es una variable dinámica
     */
    static VARIABLE_KEYWORDS = [
        'id', 'codigo', 'code', 'number', 'numero', 'name', 'nombre',
        'date', 'fecha', 'time', 'hora', 'status', 'estado',
        'type', 'tipo', 'category', 'categoria', 'search', 'buscar',
        'query', 'filter', 'filtro', 'page', 'pagina', 'limit',
        'offset', 'sort', 'order', 'from', 'to', 'start', 'end'
    ];

    /**
     * Determina si una variable es una credencial
     */
    static isCredential(varName) {
        const lowerName = varName.toLowerCase();

        // Buscar palabras clave de credenciales
        return this.CREDENTIAL_KEYWORDS.some(keyword =>
            lowerName.includes(keyword)
        );
    }

    /**
     * Determina si una variable es dinámica
     */
    static isDynamicVariable(varName) {
        const lowerName = varName.toLowerCase();

        // Si es credencial, no es variable dinámica
        if (this.isCredential(varName)) {
            return false;
        }

        // Buscar palabras clave de variables
        return this.VARIABLE_KEYWORDS.some(keyword =>
            lowerName.includes(keyword)
        );
    }

    /**
     * Clasifica una lista de variables
     */
    static classify(variables) {
        const credentials = [];
        const dynamicVars = [];
        const unknown = [];

        variables.forEach(varName => {
            const lowerName = varName.toLowerCase();

            // PRIORIDAD 1: Si contiene palabras de variables dinámicas, es variable
            const hasDynamicKeyword = this.VARIABLE_KEYWORDS.some(keyword =>
                lowerName.includes(keyword)
            );

            // PRIORIDAD 2: Si contiene palabras de credenciales, es credencial
            const hasCredentialKeyword = this.CREDENTIAL_KEYWORDS.some(keyword =>
                lowerName.includes(keyword)
            );

            // Casos especiales: "Ticket de Acceso" vs "Numero de la licitacion"
            // Si tiene AMBOS keywords, decidir por contexto
            if (hasDynamicKeyword && hasCredentialKeyword) {
                // Si tiene "numero", "codigo", "id" -> es variable
                if (lowerName.match(/numero|codigo|code|id/)) {
                    console.log(`📝 Variable dinámica (tiene numero/codigo): ${varName}`);
                    dynamicVars.push(varName);
                } else {
                    // Si tiene "ticket", "token", "key" -> es credencial
                    console.log(`🔑 Credencial (tiene ticket/token/key): ${varName}`);
                    credentials.push(varName);
                }
            } else if (hasDynamicKeyword) {
                console.log(`📝 Variable dinámica: ${varName}`);
                dynamicVars.push(varName);
            } else if (hasCredentialKeyword) {
                console.log(`🔑 Credencial: ${varName}`);
                credentials.push(varName);
            } else {
                // Si no está claro, asumir que es variable dinámica
                console.log(`❓ Variable desconocida (asumiendo dinámica): ${varName}`);
                dynamicVars.push(varName);
            }
        });

        console.log(`\n📊 Clasificación final:`);
        console.log(`  🔑 Credenciales: ${credentials.join(', ') || 'ninguna'}`);
        console.log(`  📝 Variables dinámicas: ${dynamicVars.join(', ') || 'ninguna'}\n`);

        return {
            credentials,
            dynamicVariables: dynamicVars,
            unknown
        };
    }

    /**
     * Genera descripción amigable para una variable
     */
    static getDescription(varName) {
        const lowerName = varName.toLowerCase();

        // Descripciones para credenciales
        if (lowerName.includes('ticket')) {
            return 'Token de acceso o ticket de autenticación';
        }
        if (lowerName.includes('token')) {
            return 'Token de autenticación';
        }
        if (lowerName.includes('api') && lowerName.includes('key')) {
            return 'Clave de API';
        }
        if (lowerName.includes('secret')) {
            return 'Secreto de autenticación';
        }
        if (lowerName.includes('password') || lowerName.includes('pass')) {
            return 'Contraseña';
        }

        // Descripciones para variables dinámicas
        if (lowerName.includes('codigo') || lowerName.includes('code')) {
            return 'Código identificador';
        }
        if (lowerName.includes('numero') || lowerName.includes('number')) {
            return 'Número identificador';
        }
        if (lowerName.includes('id')) {
            return 'Identificador único';
        }
        if (lowerName.includes('fecha') || lowerName.includes('date')) {
            return 'Fecha (formato: YYYY-MM-DD)';
        }
        if (lowerName.includes('nombre') || lowerName.includes('name')) {
            return 'Nombre';
        }

        // Descripción genérica
        return `Valor para ${varName}`;
    }

    /**
     * Genera ejemplo para una variable
     */
    static getExample(varName) {
        const lowerName = varName.toLowerCase();

        if (lowerName.includes('ticket') || lowerName.includes('token')) {
            return 'F8537A18-6766-4DEF-9E59-426B4FEE2B44';
        }
        if (lowerName.includes('codigo') || lowerName.includes('code')) {
            return '12345';
        }
        if (lowerName.includes('numero') || lowerName.includes('number')) {
            return '123';
        }
        if (lowerName.includes('fecha') || lowerName.includes('date')) {
            return '2025-12-26';
        }
        if (lowerName.includes('email')) {
            return 'usuario@ejemplo.com';
        }

        return '';
    }
}

module.exports = VariableClassifier;
