'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function DocumentUpload({ onAnalysisComplete, onError, loading, setLoading }) {
  const [uploadType, setUploadType] = useState('file') // 'file' o 'url'
  const [url, setUrl] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash')
  const [models, setModels] = useState([])
  const [dragActive, setDragActive] = useState(false)

  // Cargar modelos disponibles
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/documents/models`)
        if (response.data.success) {
          setModels(response.data.models)
        }
      } catch (error) {
        console.error('Error loading models:', error)
      }
    }
    fetchModels()
  }, [])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file) => {
    // Validar tamaño (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      onError('El archivo es demasiado grande. Máximo 100MB.')
      return
    }

    // Validar tipo
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      onError('Tipo de archivo no soportado. Solo PDF, DOCX y TXT.')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', selectedModel)

    try {
      const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minutos
      })

      if (response.data.success) {
        onAnalysisComplete(response.data.data)
      } else {
        onError(response.data.error || 'Error al procesar el documento')
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error.response) {
        onError(error.response.data.error || 'Error del servidor')
      } else if (error.request) {
        onError('No se pudo conectar con el servidor')
      } else {
        onError(error.message)
      }
    }
  }

  const handleUrlSubmit = async (e) => {
    e.preventDefault()

    if (!url.trim()) {
      onError('Por favor ingresa una URL')
      return
    }

    // Validar formato de URL
    try {
      new URL(url)
    } catch (e) {
      onError('URL inválida')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/documents/scrape`, {
        url: url.trim(),
        model: selectedModel
      }, {
        timeout: 120000 // 2 minutos
      })

      if (response.data.success) {
        onAnalysisComplete(response.data.data)
      } else {
        onError(response.data.error || 'Error al hacer scraping')
      }
    } catch (error) {
      console.error('Scraping error:', error)
      if (error.response) {
        onError(error.response.data.error || 'Error del servidor')
      } else if (error.request) {
        onError('No se pudo conectar con el servidor')
      } else {
        onError(error.message)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      {/* Selector de tipo */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setUploadType('file')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${uploadType === 'file'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          📄 Subir Archivo
        </button>
        <button
          onClick={() => setUploadType('url')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${uploadType === 'url'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          🌐 Web Scraping
        </button>
      </div>

      {/* Selector de modelo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modelo de IA
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          {/* Agrupar modelos por proveedor */}
          <optgroup label="🤖 Claude (Anthropic)">
            {models.filter(m => m.provider === 'anthropic').map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </optgroup>
          <optgroup label="✨ Gemini (Google)">
            {models.filter(m => m.provider === 'google').map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Upload de archivo */}
      {uploadType === 'file' && (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arrastra tu archivo aquí
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o haz clic para seleccionar
            </p>
            <label className="cursor-pointer">
              <span className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                {loading ? 'Procesando...' : 'Seleccionar Archivo'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                disabled={loading}
              />
            </label>
            <p className="text-xs text-gray-400 mt-4">
              PDF, DOCX, TXT • Máximo 100MB • Hasta 1500 páginas
            </p>
          </div>
        </div>
      )}

      {/* Web scraping */}
      {uploadType === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la página web
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/api-documentation"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analizando...
              </span>
            ) : (
              'Analizar Sitio Web'
            )}
          </button>
        </form>
      )}

      {loading && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Procesando con Claude AI...
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Esto puede tomar hasta 2 minutos para documentos grandes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
