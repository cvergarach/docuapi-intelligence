import { useState } from 'react';

export default function PromptEditor({ value, onChange, onReset, provider }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-6">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
                <span>⚙️ Avanzado: Editar Prompt</span>
                <span className="text-xs text-gray-500">
                    {isExpanded ? '▼ Ocultar' : '▶ Mostrar'}
                </span>
            </button>

            {/* Editor */}
            {isExpanded && (
                <div className="mt-3 border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Prompt Personalizado ({provider === 'google' ? 'Gemini' : 'Claude'})
                        </label>
                        <button
                            type="button"
                            onClick={onReset}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            🔄 Resetear a Default
                        </button>
                    </div>

                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs resize-y"
                        placeholder="Escribe tu prompt personalizado aquí..."
                    />

                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                        <span>{value.length} caracteres</span>
                        <span className="text-gray-400">
                            Usa {{ "{{"}}CONTENT{{ "}}"}} donde quieras insertar el contenido del documento
                        </span>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                            <strong>💡 Tip:</strong> Puedes personalizar el prompt para:
                        </p>
                        <ul className="text-xs text-blue-700 mt-1 ml-4 list-disc">
                            <li>Extraer información específica de tu dominio</li>
                            <li>Cambiar el formato de salida JSON</li>
                            <li>Agregar instrucciones adicionales para la IA</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
