import dynamic from 'next/dynamic';
import type { LeafletMouseEvent } from 'leaflet';
import { Venue } from '../../types';
import { useEffect } from 'react';
import type { Map as LeafletMap } from 'leaflet';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-xl shadow-inner mb-4 flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Ładowanie mapy...</p>
    </div>
  )
});

interface BeerMapProps {
  venues: Venue[];
  onMapClick: (e: LeafletMouseEvent) => void;
  isAddMode: boolean;
  selectedLocation: {lat: number; lng: number} | null;
  onBoundsChanged: (center: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
  onMapReady?: (map: LeafletMap) => void;
}

export const BeerMap: React.FC<BeerMapProps> = ({
  venues,
  onMapClick,
  isAddMode,
  selectedLocation,
  onBoundsChanged,
  onMapReady
}) => {
  const handleMapClick = (e: LeafletMouseEvent) => {
    if (!isAddMode) return;
    
    if (onMapClick) {
      onMapClick(e);
    }
  };

  useEffect(() => {
    // Upewnij się, że wszystko jest czyszczone przy wyjściu z trybu dodawania
    if (!isAddMode && selectedLocation) {
      onMapClick({ latlng: { lat: 0, lng: 0 } } as LeafletMouseEvent);
    }
  }, [isAddMode, onMapClick, selectedLocation]);

  return (
    <MapComponent 
      venues={venues}
      onMapClick={handleMapClick}
      isAddMode={isAddMode}
      selectedLocation={isAddMode ? selectedLocation : null}
      onBoundsChanged={onBoundsChanged}
      onMapReady={onMapReady}
    />
  );
};