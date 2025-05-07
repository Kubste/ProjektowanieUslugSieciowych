import React from 'react';
import { X } from 'lucide-react';

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 relative">
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button onClick={onClose} className="text-red-700 hover:text-red-900">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;