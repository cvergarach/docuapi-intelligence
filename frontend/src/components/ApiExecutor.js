'use client'

import { useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ApiExecutor({ apis, credentials }) {
  const [selectedApi, setSelectedApi] = useState(null)
  const [editedCredentials, setEditedCredentials] = useState({})
  const [executing, setExecuting] = useState(false)
  const [results, setResults] = useState({})
  const [showResults, setShowResults] = useState({})

  const handleCredentialChange = (credName, value) => {
    setEditedCredentials(prev => ({
      ...prev,
      [credName]: value
    }))
  }

  const getCredentialValue = (credName) => {
    if (editedCredentials[credName] !== undefined) {
      return editedCredentials[credName]
    }
    const cred = credentials.find(c => c.name === credName)
    return cred?.value || ''
  }

  const executeApi = async (api) => {
    setExecuting(true)
    setResults(prev => ({ ...prev, [api.name]: null }))

    try {
      // Preparar credenciales con valores editados
      const finalCredentials = credentials.map(cred => ({
        ...cred,
        value: editedCredentials[cred.name] !== undefined 
          ? editedCredentials[cred.name] 
          : cred.value
      }))

      const response = await axios.post(`${API_URL}/api/execute/api`, {
        api: api,
        credentials: finalCredentials
      }, {
        timeout: 30000
      })

      setResults(prev => ({
        ...prev,
        [api.name]: response.data
      }))
      setShowResults(prev => ({
        ...prev,
        [api.name]: true
      }))

    } catch (error) {
      console.error('Error executing API:', error)
      setResults(prev => ({
        ...prev,
        [api.name]: {
          success: false,
          error: error.response?.data?.error || error.message || 'Error desconocido'
        }
      }))
      setShowResults(prev => ({
        ...prev,
        [api.name]: true
      }))
    } finally {
      setExecuting(false)
    }
  }

  const executeBatch = async () => {
    setExecuting(true)

    try {
      const finalCredentials = credentials.map(cred => ({
        ...cred,
        value: editedCredentials[cred.name] !== undefined 
          ? editedCredentials[cred.name] 
          : cred.value
      }))

      const response = await axios.post(`${API_URL}/api/execute/batch`, {
        apis: apis,
        credentials: finalCredentials
      }, {
        timeout: 120000 // 2 minutos para batch
      })

      if (response.data.success) {
        const newResults = {}
        const newShowResults = {}
        
        response.data.data.results.forEach(result => {
          newResults[result.api] = result
          newShowResults[result.api] = true
        })

        setResults(newResults)
        setShowResults(newShowResults)
      }

    } catch (error) {
      console.error('Error executing batch:', error)
      alert('Error al ejecutar batch: ' + (error.response?.data?.error || error.message))
    } finally {
      setExecuting(false)
    }
  }

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

      {/* Editar credenciales si es necesario */}
      {credentials && credentials.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">
            🔑 Configura tus Credenciales
          </h4>
          <p className="text-sm text-blue-700 mb-4">
            Revisa y edita las credenciales antes de ejecutar las APIs
          </p>
          <div className="space-y-3">
            {credentials.map((cred, index) => (
              <div key={index} className="bg-white p-3 rounded border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {cred.name}
                  <span className="text-xs text-gray-500 ml-2">({cred.type})</span>
                </label>
                <input
                  type="text"
                  value={getCredentialValue(cred.name)}
                  onChange={(e) => handleCredentialChange(cred.name, e.target.value)}
                  placeholder={cred.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de APIs */}
      <div className="space-y-4">
        {apis.map((api, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{api.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{api.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    api.method === 'GET' ? 'bg-green-100 text-green-800' :
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

                {results[api.name].success ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        ✓ Éxito
                      </span>
                      {results[api.name].data?.status && (
                        <span className="text-xs text-gray-600">
                          Status: {results[api.name].data.status}
                        </span>
                      )}
                      {results[api.name].data?.executionTime && (
                        <span className="text-xs text-gray-600">
                          Tiempo: {results[api.name].data.executionTime}ms
                        </span>
                      )}
                    </div>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64 border border-gray-200">
                      {JSON.stringify(results[api.name].data?.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                        ✗ Error
                      </span>
                    </div>
                    <div className="mt-2 p-3 bg-red-50 rounded text-sm text-red-700 border border-red-200">
                      {results[api.name].error || results[api.name].data?.error || 'Error desconocido'}
                    </div>
                    {results[api.name].data?.data && (
                      <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64 border border-gray-200">
                        {JSON.stringify(results[api.name].data.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
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
  )
}
