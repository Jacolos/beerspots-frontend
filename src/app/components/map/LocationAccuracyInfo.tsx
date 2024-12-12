// src/app/components/map/LocationAccuracyInfo.tsx
import React from 'react';

interface LocationAccuracyInfoProps {
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
}

export const LocationAccuracyInfo: React.FC<LocationAccuracyInfoProps> = ({
  accuracy,
  isLoading,
  error
}) => {
  const getAccuracyLabel = (meters: number) => {
    if (meters < 10) return 'Bardzo wysoka';
    if (meters < 30) return 'Wysoka';
    if (meters < 100) return 'Średnia';
    return 'Niska';
  };

  if (isLoading) {
    return (
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-[400]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span>Uzyskiwanie dokładnej lokalizacji...</span>
        </div>
      </div>
    );
  }

  if (accuracy) {
    const accuracyLabel = getAccuracyLabel(accuracy);
    const color = accuracy < 30 ? 'text-green-600' : accuracy < 100 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-[400]">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Dokładność lokalizacji:</span>
          <span className={`font-medium ${color}`}>
            {accuracyLabel} ({Math.round(accuracy)}m)
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md z-[400]">
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  return null;
};