/**
 * Utilidad para gestionar credenciales en localStorage
 */

const CREDENTIALS_KEY = 'docuapi_credentials';

export const credentialsStorage = {
    /**
     * Guardar todas las credenciales
     */
    save(credentials) {
        try {
            localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
            return true;
        } catch (error) {
            console.error('Error saving credentials:', error);
            return false;
        }
    },

    /**
     * Obtener todas las credenciales
     */
    getAll() {
        try {
            const stored = localStorage.getItem(CREDENTIALS_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading credentials:', error);
            return {};
        }
    },

    /**
     * Guardar una credencial específica
     */
    set(name, value, description = '') {
        const credentials = this.getAll();
        credentials[name] = {
            value,
            description,
            savedAt: new Date().toISOString()
        };
        return this.save(credentials);
    },

    /**
     * Obtener una credencial específica
     */
    get(name) {
        const credentials = this.getAll();
        return credentials[name] || null;
    },

    /**
     * Eliminar una credencial
     */
    remove(name) {
        const credentials = this.getAll();
        delete credentials[name];
        return this.save(credentials);
    },

    /**
     * Limpiar todas las credenciales
     */
    clear() {
        try {
            localStorage.removeItem(CREDENTIALS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing credentials:', error);
            return false;
        }
    },

    /**
     * Verificar si existe una credencial
     */
    has(name) {
        const credentials = this.getAll();
        return name in credentials;
    },

    /**
     * Obtener lista de nombres de credenciales guardadas
     */
    getNames() {
        return Object.keys(this.getAll());
    }
};
