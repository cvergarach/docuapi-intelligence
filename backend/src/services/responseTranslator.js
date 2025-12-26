/**
 * Traduce respuestas técnicas a lenguaje humano
 */
class ResponseTranslator {
    /**
     * Traduce una respuesta de API a lenguaje humano
     */
    static translateResponse(response, api) {
        const { status, data } = response;

        // Determinar si fue exitoso
        const isSuccess = status >= 200 && status < 300;

        // Mensaje principal
        let message = '';
        if (isSuccess) {
            message = this.getSuccessMessage(status, data, api);
        } else {
            message = this.getErrorMessage(status, data);
        }

        // Extraer datos clave
        const keyData = this.extractKeyData(data);

        return {
            success: isSuccess,
            humanMessage: message,
            statusCode: status,
            statusText: this.translateStatusCode(status),
            keyData: keyData,
            rawData: data
        };
    }

    /**
     * Traduce códigos de estado HTTP a lenguaje humano
     */
    static translateStatusCode(status) {
        const translations = {
            200: '✅ Éxito - La solicitud se completó correctamente',
            201: '✅ Creado - El recurso se creó exitosamente',
            204: '✅ Sin contenido - La operación fue exitosa',
            400: '❌ Solicitud incorrecta - Revisa los datos que enviaste',
            401: '🔒 No autorizado - Verifica tus credenciales',
            403: '🚫 Prohibido - No tienes permiso para acceder',
            404: '🔍 No encontrado - El recurso no existe',
            500: '⚠️ Error del servidor - Problema en el servidor',
            502: '⚠️ Puerta de enlace incorrecta - Problema de conexión',
            503: '⏸️ Servicio no disponible - El servidor está temporalmente fuera de servicio'
        };

        return translations[status] || `Código ${status}`;
    }

    /**
     * Genera mensaje de éxito
     */
    static getSuccessMessage(status, data, api) {
        const apiName = api?.name || 'la API';

        if (Array.isArray(data)) {
            const count = data.length;
            return `✅ ¡Éxito! Se encontraron ${count} resultado${count !== 1 ? 's' : ''} en ${apiName}`;
        }

        if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            if (keys.length > 0) {
                return `✅ ¡Éxito! ${apiName} respondió con información`;
            }
        }

        return `✅ ¡Éxito! ${apiName} se ejecutó correctamente`;
    }

    /**
     * Genera mensaje de error
     */
    static getErrorMessage(status, data) {
        let message = '❌ No se pudo ejecutar la API\n\n';

        // Mensaje específico según el código
        if (status === 401) {
            message += '🔑 **Problema de autenticación**\n';
            message += 'Tus credenciales no son válidas o han expirado.\n\n';
            message += '**¿Qué hacer?**\n';
            message += '1. Verifica que hayas ingresado las credenciales correctas\n';
            message += '2. Revisa que no hayan expirado\n';
            message += '3. Contacta al administrador si el problema persiste';
        } else if (status === 404) {
            message += '🔍 **Recurso no encontrado**\n';
            message += 'La URL o el recurso que buscas no existe.\n\n';
            message += '**¿Qué hacer?**\n';
            message += '1. Verifica que los parámetros sean correctos\n';
            message += '2. Revisa que la URL esté bien escrita\n';
            message += '3. Confirma que el recurso exista';
        } else if (status >= 500) {
            message += '⚠️ **Error del servidor**\n';
            message += 'Hay un problema en el servidor de la API.\n\n';
            message += '**¿Qué hacer?**\n';
            message += '1. Intenta de nuevo en unos minutos\n';
            message += '2. Contacta al proveedor de la API si persiste';
        } else {
            message += '**Detalles del error:**\n';
            message += typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        }

        return message;
    }

    /**
     * Extrae datos clave de la respuesta
     */
    static extractKeyData(data) {
        if (!data) return null;

        // Si es array, tomar primeros elementos
        if (Array.isArray(data)) {
            return {
                type: 'list',
                count: data.length,
                items: data.slice(0, 5).map(item => this.simplifyObject(item))
            };
        }

        // Si es objeto, simplificar
        if (typeof data === 'object') {
            return {
                type: 'object',
                data: this.simplifyObject(data)
            };
        }

        // Si es string o número
        return {
            type: 'simple',
            value: data
        };
    }

    /**
     * Simplifica un objeto para mostrar solo lo importante
     */
    static simplifyObject(obj, maxDepth = 2, currentDepth = 0) {
        if (currentDepth >= maxDepth) return '[...]';

        if (Array.isArray(obj)) {
            return obj.slice(0, 3).map(item => this.simplifyObject(item, maxDepth, currentDepth + 1));
        }

        if (typeof obj === 'object' && obj !== null) {
            const simplified = {};
            const keys = Object.keys(obj).slice(0, 10); // Máximo 10 campos

            keys.forEach(key => {
                const value = obj[key];
                if (typeof value === 'object') {
                    simplified[key] = this.simplifyObject(value, maxDepth, currentDepth + 1);
                } else {
                    simplified[key] = value;
                }
            });

            return simplified;
        }

        return obj;
    }

    /**
     * Formatea datos para mostrar en tabla
     */
    static formatAsTable(data) {
        if (!Array.isArray(data) || data.length === 0) return null;

        // Obtener todas las columnas únicas
        const columns = new Set();
        data.forEach(item => {
            if (typeof item === 'object') {
                Object.keys(item).forEach(key => columns.add(key));
            }
        });

        return {
            columns: Array.from(columns),
            rows: data.map(item => {
                const row = {};
                columns.forEach(col => {
                    row[col] = item[col] !== undefined ? item[col] : '-';
                });
                return row;
            })
        };
    }
}

module.exports = ResponseTranslator;
