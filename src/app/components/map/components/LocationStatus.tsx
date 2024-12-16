// src/app/components/map/components/LocationStatus.tsx
interface LocationStatusProps {
    isLoading: boolean;
    error: string | null;
  }
  
  export const LocationStatus: React.FC<LocationStatusProps> = ({ isLoading, error }) => {
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
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      );
    }
  
    return null;
  };