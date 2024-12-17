import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
//import { useAuth } from '../../hooks/useAuth';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useVenueMarkers } from './hooks/useVenueMarkers';
import { LocationStatus } from './components/LocationStatus';
import { ReviewsModal } from './components/ReviewsModal';
import type { Venue } from '../../types';
import { createPriceMarker } from './utils/markers';

interface MapComponentProps {
  venues: Venue[];
  onMapClick?: (e: LeafletMouseEvent) => void;
  isAddMode?: boolean;
  selectedLocation: {lat: number; lng: number} | null;
  onBoundsChanged?: (center: { 
    latitude: number; 
    longitude: number; 
    zoom: number 
  }) => void;
  onMapReady?: (map: LeafletMap) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  venues,
  onMapClick,
  isAddMode = false,
  selectedLocation,
  onBoundsChanged,
}) => {
  // Refs
  const mapRef = useRef<HTMLDivElement>(null!);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  // State
  const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Hooks
  const { latitude, longitude, isLoading, error, isDefault } = useGeolocation();
//  const { token } = useAuth();

  // Initialize map
  const { mapInstance, mapReady } = useMapInitialization({
    mapRef,
    latitude,
    longitude,
    isDefault,
    onBoundsChanged,
    isAddMode,
    onMapClick: (e) => {
      // Przekazujemy kliknięcie dalej tylko jeśli mamy handler
      if (onMapClick) {
        onMapClick(e);
      }
    }
  });

  // Handle reviews modal
  const handleReviewsClick = useCallback(async (venue: Venue) => {
    setSelectedVenue(venue);
    setReviewsModalOpen(true);
  }, []);

  // Initialize venue markers
  useVenueMarkers({
    mapInstance,
    mapReady,
    venues,
    handleReviewsClick,
    isAddMode
  });

  // Manage temporary marker for new location
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    // Zawsze usuwamy stary marker
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    // Dodajemy nowy marker tylko jeśli mamy lokalizację i jesteśmy w trybie dodawania
    if (selectedLocation && isAddMode) {
      const L = window.L;
      tempMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: createPriceMarker('Nowa', true)
      })
        .addTo(mapInstance.current);
    }

    // Cleanup
    return () => {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    };
  }, [selectedLocation, isAddMode, mapReady]);

  // Clean up marker when leaving add mode
  useEffect(() => {
    // Czyść marker gdy wychodzimy z trybu dodawania
    if (!isAddMode && tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  }, [isAddMode]);

  // Clean up marker on component unmount
  useEffect(() => {
    return () => {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full z-0" />
      
      <LocationStatus 
        isLoading={isLoading} 
        error={error} 
      />
      
      {selectedVenue && (
        <ReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={() => setReviewsModalOpen(false)}
          spotId={selectedVenue.id}
          spotName={selectedVenue.name}
        />
      )}
    </div>
  );
};

export default MapComponent;