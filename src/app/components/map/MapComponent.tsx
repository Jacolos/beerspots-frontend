import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useVenueMarkers } from './hooks/useVenueMarkers';
import { LocationStatus } from './components/LocationStatus';
import { ReviewsModal } from './components/ReviewsModal';
import { createPriceMarker } from './utils/markers';
import type { Venue } from '../../types';

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
  onMapReady
}) => {
  // Refs
  const mapRef = useRef<HTMLDivElement>(null!);
  const markersRef = useRef<L.Marker[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerClusterGroupRef = useRef<any>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // State
  const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Hooks
  const { latitude, longitude, isLoading, error, isDefault } = useGeolocation();

  // Initialize map
  const { mapInstance, mapReady } = useMapInitialization({
    mapRef,
    latitude,
    longitude,
    isDefault,
    onBoundsChanged,
    isAddMode,
    onMapClick: (e) => {
      if (onMapClick) {
        onMapClick(e);
      }
    },
    selectedLocation
  });

  // Handle reviews modal
  const handleReviewsClick = useCallback((venue: Venue) => {
    setSelectedVenue(venue);
    setReviewsModalOpen(true);
  }, []);

  // Get markers refs from useVenueMarkers hook
  useVenueMarkers({
    mapInstance,
    mapReady,
    venues,
    handleReviewsClick,
    isAddMode,
    selectedLocation
  });

  // Handle map ready callback
  useEffect(() => {
    if (mapReady && mapInstance.current && onMapReady) {
      onMapReady(mapInstance.current);
    }
  }, [mapReady, onMapReady]);

  // Handle markers reset
  const handleMarkersReset = useCallback(() => {
    if (!mapInstance.current || !mapReady) return;

    if (markersRef.current.length === 0 && venues.length > 0) {
      // Wyczyść istniejące markery
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current.clearLayers();
      }
      markersRef.current.forEach(marker => {
        if (marker) marker.remove();
      });
      markersRef.current = [];

      // Utwórz cluster group jeśli nie istnieje
      if (!markerClusterGroupRef.current) {
        markerClusterGroupRef.current = window.L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          zoomToBoundsOnClick: true,
          disableClusteringAtZoom: 16,
          chunkedLoading: true,
          removeOutsideVisibleBounds: true
        });
        mapInstance.current.addLayer(markerClusterGroupRef.current);
      }

      // Dodaj markery ponownie
      venues.forEach(venue => {
        try {
          const marker = window.L.marker([venue.lat, venue.lng], {
            icon: createPriceMarker(venue.price)
          });

          marker.on('click', (e) => {
            e.originalEvent.stopPropagation();
            handleReviewsClick(venue);
          });

          markersRef.current.push(marker);
          if (markerClusterGroupRef.current) {
            markerClusterGroupRef.current.addLayer(marker);
          }
        } catch (error) {
          console.error('Error recreating marker:', error);
        }
      });
    }
  }, [venues, mapReady, handleReviewsClick]);

  // Add map event listeners
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    const map = mapInstance.current;

    const handleMapMove = () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = setTimeout(handleMarkersReset, 300);
    };

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);
    map.on('locationfound', handleMapMove);

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      map.off('locationfound', handleMapMove);
    };
  }, [mapInstance, mapReady, handleMarkersReset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      if (markerClusterGroupRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(markerClusterGroupRef.current);
      }
      markersRef.current.forEach(marker => {
        if (marker) marker.remove();
      });
      markersRef.current = [];
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