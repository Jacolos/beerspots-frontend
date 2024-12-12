// src/app/components/map/LocationInfo.tsx
import React from 'react';

interface LocationInfoProps {
  error: string | null;
  isLoading: boolean;
  permissionStatus: string | null;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  error,
  isLoading,
  permissionStatus
}) => {
  if (isLoading) {
    return (
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md z-[400]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
          <span>Ustalanie twojej lokalizacji...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-4 right-4 bg-white px-4 py-3 rounded-lg shadow-md z-[400] max-w-md">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-amber-600">
            <svg className="w-5 h-5" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="font-medium">Informacja o lokalizacji</span>
          </div>
          {error.split('\n').map((line, index) => (
            <p key={index} className="text-sm text-gray-600">
              {line}
            </p>
          ))}
          {permissionStatus && (
            <p className="text-xs text-gray-500 mt-2">
              Status uprawnień: {permissionStatus === 'granted' ? 'przyznane' : 
                               permissionStatus === 'denied' ? 'odrzucone' : 'nie określono'}
            </p>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors text-sm font-medium"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return null;
};