// src/app/components/map/GeolocationStatus.tsx
import React from 'react';

interface GeolocationStatusProps {
  error: string | null;
  isLoading: boolean;
  source: 'gps' | 'ip' | 'default';
}

export const GeolocationStatus: React.FC<GeolocationStatusProps> = ({
  error,
  isLoading,
  source
}) => {
  const getStatusColor = () => {
    switch (source) {
      case 'gps':
        return 'bg-green-50 text-green-700';
      case 'ip':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-red-50 text-red-700';
    }
  };

  const getStatusMessage = () => {
    if (isLoading) return 'Ustalanie lokalizacji...';
    if (error) return error;
    switch (source) {
      case 'gps':
        return 'Lokalizacja GPS';
      case 'ip':
        return 'Lokalizacja na podstawie IP';
      default:
        return 'Domyślna lokalizacja';
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />;
    }
    switch (source) {
      case 'gps':
        return '📍';
      case 'ip':
        return '🌐';
      default:
        return '⚠️';
    }
  };

  return (
    <div className={`absolute bottom-4 left-4 px-4 py-3 rounded-lg shadow-md z-[400] ${getStatusColor()}`}>
      <div className="flex items-center space-x-2">
        <span>{getIcon()}</span>
        <span className="font-medium">{getStatusMessage()}</span>
      </div>
      {error && (
        <div className="mt-2 text-sm whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  );
};