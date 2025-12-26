'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { credentialsStorage } from '../utils/credentialsStorage'
import CredentialsManager from './CredentialsManager'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Detectar variables en un string
const detectVariables = (text) => {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/\{\{|\}\}/g, '').trim());
}

// Detectar variables en una API
const detectApiVariables = (api) => {
  const variables = new Set();

  if (api.url) {
    detectVariables(api.url).forEach(v => variables.add(v));
  }

  if (api.params) {
    Object.values(api.params).forEach(value => {
      if (typeof value === 'string') {
        detectVariables(value).forEach(v => variables.add(v));
      }
    });
  }

  if (api.headers) {
    Object.values(api.headers).forEach(value => {
      if (typeof value === 'string') {
        detectVariables(value).forEach(v => variables.add(v));
      }
    });
  }

  return Array.from(variables);
}

export default function ApiExecutor({ apis, credentials: detectedCredentials }) {
  const [savedCredentials, setSavedCredentials] = useState({});
  const [apiVariables, setApiVariables] = useState({});
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState({});
  const [showResults, setShowResults] = useState({});

  // Cargar credenciales guardadas
  useEffect(() => {
    const stored = credentialsStorage.getAll();
    setSavedCredentials(stored);
  }, []);

  // Detectar variables en cada API
  useEffect(() => {
    const vars = {};
    apis.forEach(api => {
      const detected = detectApiVariables(api);
      if (detected.length > 0) {
        vars[api.name] = {};
        detected.forEach(varName => {
          // Inicializar con valor guardado si existe
          vars[api.name][varName] = savedCredentials[varName]?.value || '';
        });
      }
    });
    setApiVariables(vars);
  }, [apis, savedCredentials]);

  const handleVariableChange = (apiName, varName, value) => {
    setApiVariables(prev => ({
      ...prev,
      [apiName]: {
        ...prev[apiName],
        [varName]: value
      }
    }));
  };

  const handleCredentialsUpdate = (newCredentials) => {
    setSavedCredentials(newCredentials);

    // Actualizar variables con nuevos valores
    setApiVariables(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(apiName => {
        Object.keys(updated[apiName]).forEach(varName => {
          if (newCredentials[varName]) {
            updated[apiName][varName] = newCredentials[varName].value;
          }
        });
      });
      return updated;
    });
  };

  const executeApi = async (api) => {
    setExecuting(true);
    setResults(prev => ({ ...prev, [api.name]: null }));

    try {
      // Preparar credenciales desde localStorage
      const credentialsArray = Object.entries(savedCredentials).map(([name, data]) => ({
        name,
        value: data.value,
        type: 'stored'
      }));

      // Preparar variables
      const variables = apiVariables[api.name] || {};

      const response = await axios.post(`${API_URL}/api/execute/api`, {
        api: api,
        credentials: credentialsArray,
        variables: variables
      }, {
        timeout: 30000
      });

      setResults(prev => ({
        ...prev,
        [api.name]: response.data
      }));
      setShowResults(prev => ({
        ...prev,
        [api.name]: true
      }));

    } catch (error) {
      console.error('Error executing API:', error);
      setResults(prev => ({
        ...prev,
        [api.name]: {
          success: false,
          humanMessage: error.response?.data?.humanMessage || '❌ Error al ejecutar la API',
          error: error.response?.data?.error || error.message || 'Error desconocido'
        }
      }));
      setShowResults(prev => ({
        ...prev,
        [api.name]: true
      }));
    } finally {
      setExecuting(false);
    }
  };

  const executeBatch = async () => {
    setExecuting(true);

    try {
      const credentialsArray = Object.entries(savedCredentials).map(([name, data]) => ({
        name,
        value: data.value,
        type: 'stored'
      }));

      // Para batch, usar las primeras variables de la primera API
      const firstApiVars = apiVariables[apis[0]?.name] || {};

      const response = await axios.post(`${API_URL}/api/execute/batch`, {
        apis: apis,
        credentials: credentialsArray,
        variables: firstApiVars
      }, {
        timeout: 120000
      });

      if (response.data.success) {
        const newResults = {};
        const newShowResults = {};

        response.data.data.results.forEach(result => {
          newResults[result.api] = result;
          newShowResults[result.api] = true;
        });

        setResults(newResults);
        setShowResults(newShowResults);
      }

    } catch (error) {
      console.error('Error executing batch:', error);
      alert('Error al ejecutar batch: ' + (error.response?.data?.error || error.message));
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          ⚡ Ejecutar APIs
        </h3>
        {apis.length > 1 && (
          <button
            onClick={executeBatch}
            disabled={executing}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {executing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Ejecutando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Ejecutar Todas ({apis.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Gestor de Credenciales */}
      <CredentialsManager
        requiredCredentials={detectedCredentials || []}
        onCredentialsChange={handleCredentialsUpdate}
      />

      {/* Lista de APIs */}
      <div className="space-y-4 mt-6">
        {apis.map((api, index) => {
          const vars = detectApiVariables(api);
          const hasVariables = vars.length > 0;

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{api.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{api.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${api.method === 'GET' ? 'bg-green-100 text-green-800' :
                        api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            api.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                      }`}>
                      {api.method}
                    </span>
                    <code className="text-xs text-gray-500 truncate max-w-md">
                      {api.url}
                    </code>
                  </div>
                </div>
                <button
                  onClick={() => executeApi(api)}
                  disabled={executing}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap flex items-center space-x-2"
                >
                  {executing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Ejecutando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Ejecutar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Formulario de Variables */}
              {hasVariables && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-3">
                    📝 Información que necesitas proporcionar:
                  </h5>
                  <div className="space-y-3">
                    {vars.map(varName => {
                      const isSaved = savedCredentials[varName];
                      return (
                        <div key={varName}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {varName}
                            {isSaved && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                ✓ Guardado
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={apiVariables[api.name]?.[varName] || ''}
                            onChange={(e) => handleVariableChange(api.name, varName, e.target.value)}
                            placeholder={`Ingresa ${varName}...`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resultado */}
              {results[api.name] && showResults[api.name] && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Resultado</h5>
                    <button
                      onClick={() => setShowResults(prev => ({ ...prev, [api.name]: false }))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Mensaje Humano */}
                  {results[api.name].humanMessage && (
                    <div className={`mb-3 p-4 rounded-lg ${results[api.name].success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                      }`}>
                      <div className={`text-sm whitespace-pre-line ${results[api.name].success ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {results[api.name].humanMessage}
                      </div>
                    </div>
                  )}

                  {results[api.name].success ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          ✓ Éxito
                        </span>
                        {results[api.name].statusText && (
                          <span className="text-xs text-gray-600">
                            {results[api.name].statusText}
                          </span>
                        )}
                        {results[api.name].data?.executionTime && (
                          <span className="text-xs text-gray-600">
                            Tiempo: {results[api.name].data.executionTime}ms
                          </span>
                        )}
                      </div>

                      {/* Datos clave en formato legible */}
                      {results[api.name].data?.keyData && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h6 className="text-sm font-medium text-blue-900 mb-2">📊 Datos principales:</h6>
                          <pre className="text-xs text-blue-800 whitespace-pre-wrap">
                            {JSON.stringify(results[api.name].data.keyData, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Datos completos (colapsable) */}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                          Ver respuesta completa
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64 border border-gray-200">
                          {JSON.stringify(results[api.name].data?.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                          ✗ Error
                        </span>
                      </div>
                      {results[api.name].data?.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                            Ver detalles técnicos
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64 border border-gray-200">
                            {JSON.stringify(results[api.name].data.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instrucciones */}
      {apis.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-500">No hay APIs para ejecutar</p>
          <p className="text-sm text-gray-400 mt-2">
            Sube un documento que contenga información de APIs
          </p>
        </div>
      )}
    </div>
  );
}
