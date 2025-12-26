'use client'

import { useState, useEffect } from 'react';
import { credentialsStorage } from '../utils/credentialsStorage';

export default function CredentialsManager({ requiredCredentials = [], onCredentialsChange }) {
    const [credentials, setCredentials] = useState({});
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingCred, setEditingCred] = useState(null);
    const [newValue, setNewValue] = useState('');

    // Cargar credenciales al montar
    useEffect(() => {
        const stored = credentialsStorage.getAll();
        setCredentials(stored);

        // Notificar al padre
        if (onCredentialsChange) {
            onCredentialsChange(stored);
        }
    }, []);

    const handleSave = (name) => {
        if (newValue.trim()) {
            const description = requiredCredentials.find(c => c.name === name)?.description || '';
            credentialsStorage.set(name, newValue, description);

            const updated = credentialsStorage.getAll();
            setCredentials(updated);
            setEditingCred(null);
            setNewValue('');

            if (onCredentialsChange) {
                onCredentialsChange(updated);
            }
        }
    };

    const handleDelete = (name) => {
        if (confirm(`¿Eliminar la credencial "${name}"?`)) {
            credentialsStorage.remove(name);
            const updated = credentialsStorage.getAll();
            setCredentials(updated);

            if (onCredentialsChange) {
                onCredentialsChange(updated);
            }
        }
    };

    const startEdit = (name) => {
        setEditingCred(name);
        setNewValue(credentials[name]?.value || '');
    };

    return (
        <div className="mb-6">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
                <span>🔑 Configurar tus Credenciales</span>
                <span className="text-xs text-gray-500">
                    {isExpanded ? '▼ Ocultar' : '▶ Mostrar'}
                </span>
                {Object.keys(credentials).length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        {Object.keys(credentials).length} guardada{Object.keys(credentials).length !== 1 ? 's' : ''}
                    </span>
                )}
            </button>

            {/* Manager */}
            {isExpanded && (
                <div className="mt-3 border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="mb-3">
                        <p className="text-sm text-gray-600">
                            💡 <strong>Guarda tus credenciales una sola vez</strong> y se reutilizarán automáticamente en todas las APIs que las necesiten.
                        </p>
                    </div>

                    {/* Credenciales Requeridas */}
                    {requiredCredentials.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Credenciales Necesarias:</h4>

                            {requiredCredentials.map((cred) => {
                                const saved = credentials[cred.name];
                                const isEditing = editingCred === cred.name;

                                return (
                                    <div key={cred.name} className="bg-white border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{cred.name}</span>
                                                    {saved && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                            ✓ Guardado
                                                        </span>
                                                    )}
                                                </div>
                                                {cred.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{cred.description}</p>
                                                )}
                                            </div>

                                            {saved && !isEditing && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(cred.name)}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(cred.name)}
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {(!saved || isEditing) && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    value={isEditing ? newValue : ''}
                                                    onChange={(e) => setNewValue(e.target.value)}
                                                    placeholder={`Ingresa tu ${cred.name}...`}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <div className="mt-2 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSave(cred.name)}
                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                                    >
                                                        {saved ? 'Actualizar' : 'Guardar'}
                                                    </button>
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCred(null);
                                                                setNewValue('');
                                                            }}
                                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {saved && !isEditing && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Valor: {saved.value.substring(0, 20)}...
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {requiredCredentials.length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-4">
                            No se detectaron credenciales requeridas en este documento.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
