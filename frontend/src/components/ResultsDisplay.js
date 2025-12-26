'use client'

import { useState } from 'react'

export default function ResultsDisplay({ data }) {
  const [activeTab, setActiveTab] = useState('summary')
  const [showCredentialValue, setShowCredentialValue] = useState({})

  const toggleCredentialVisibility = (index) => {
    setShowCredentialValue(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Resumen
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'credentials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔑 Credenciales ({data.credentials?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'apis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔌 APIs ({data.apis?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'metadata'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ℹ️ Metadata
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Documento
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {data.summary || 'No se generó resumen'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Credenciales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.credentials?.length || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">APIs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.apis?.length || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Modelo</p>
                <p className="text-sm font-semibold text-green-600 mt-1">
                  {data.metadata?.model?.split('-')[1]?.toUpperCase() || 'Claude'}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Tokens</p>
                <p className="text-xl font-bold text-yellow-600">
                  {data.metadata?.tokens?.total_tokens || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            {(!data.credentials || data.credentials.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="text-gray-500">No se encontraron credenciales en el documento</p>
              </div>
            ) : (
              data.credentials.map((cred, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{cred.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{cred.description}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {cred.type}
                    </span>
                  </div>
                  
                  {cred.value && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-gray-50 rounded text-sm font-mono break-all">
                          {showCredentialValue[index] ? cred.value : '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleCredentialVisibility(index)}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          title={showCredentialValue[index] ? 'Ocultar' : 'Mostrar'}
                        >
                          {showCredentialValue[index] ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {cred.associatedApi && (
                    <p className="text-xs text-gray-500 mt-2">
                      Asociada a: <span className="font-medium">{cred.associatedApi}</span>
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* APIs Tab */}
        {activeTab === 'apis' && (
          <div className="space-y-6">
            {(!data.apis || data.apis.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No se encontraron APIs en el documento</p>
              </div>
            ) : (
              data.apis.map((api, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-lg text-gray-900">{api.name}</h4>
                    <span className={`px-3 py-1 text-xs font-bold rounded ${
                      api.method === 'GET' ? 'bg-green-100 text-green-800' :
                      api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      api.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {api.method}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{api.description}</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Endpoint</p>
                      <code className="block px-3 py-2 bg-gray-50 rounded text-sm break-all">
                        {api.url}
                      </code>
                    </div>

                    {api.headers && Object.keys(api.headers).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Headers</p>
                        <pre className="px-3 py-2 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(api.headers, null, 2)}
                        </pre>
                      </div>
                    )}

                    {api.params && Object.keys(api.params).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Parámetros</p>
                        <pre className="px-3 py-2 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(api.params, null, 2)}
                        </pre>
                      </div>
                    )}

                    {api.body && Object.keys(api.body).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Body</p>
                        <pre className="px-3 py-2 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(api.body, null, 2)}
                        </pre>
                      </div>
                    )}

                    {api.requiredCredentials && api.requiredCredentials.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Credenciales Requeridas</p>
                        <div className="flex flex-wrap gap-2">
                          {api.requiredCredentials.map((credName, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {credName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Metadata Tab */}
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Documento</h4>
                <dl className="space-y-2 text-sm">
                  {data.metadata?.document?.type && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Tipo:</dt>
                        <dd className="font-medium text-gray-900">{data.metadata.document.type.toUpperCase()}</dd>
                      </div>
                      {data.metadata.document.pages && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Páginas:</dt>
                          <dd className="font-medium text-gray-900">{data.metadata.document.pages}</dd>
                        </div>
                      )}
                      {data.metadata.document.originalName && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Archivo:</dt>
                          <dd className="font-medium text-gray-900 truncate max-w-[200px]">
                            {data.metadata.document.originalName}
                          </dd>
                        </div>
                      )}
                      {data.metadata.document.url && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">URL:</dt>
                          <dd className="font-medium text-blue-600 truncate max-w-[200px]">
                            <a href={data.metadata.document.url} target="_blank" rel="noopener noreferrer">
                              {data.metadata.document.url}
                            </a>
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Procesamiento IA</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Modelo:</dt>
                    <dd className="font-medium text-gray-900">{data.metadata?.model || 'N/A'}</dd>
                  </div>
                  {data.metadata?.tokens && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Tokens Input:</dt>
                        <dd className="font-medium text-gray-900">{data.metadata.tokens.input_tokens}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Tokens Output:</dt>
                        <dd className="font-medium text-gray-900">{data.metadata.tokens.output_tokens}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Total:</dt>
                        <dd className="font-medium text-gray-900">{data.metadata.tokens.total_tokens}</dd>
                      </div>
                    </>
                  )}
                  {data.metadata?.isChunked && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                      ⚠️ Documento dividido en chunks para procesamiento
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
