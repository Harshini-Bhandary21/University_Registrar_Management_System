import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorAlert = ({ message, onClose }) => {
    if (!message) return null;
    
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-slide-down">
            <div className="flex items-start">
                <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                <div className="flex-1">
                    <p className="text-sm text-red-700">{message}</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorAlert;