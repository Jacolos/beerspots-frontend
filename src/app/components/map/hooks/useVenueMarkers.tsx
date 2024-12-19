import React from 'react';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { createRoot } from 'react-dom/client';
import { createPriceMarker } from '../utils/markers';
import type { Venue } from '../../../types';
import VenuePopup from '../popups/VenuePopup';
import L from 'leaflet';

interface UseVenueMarkersProps {
  mapInstance: React.RefObject<LeafletMap | null>;
  mapReady: boolean;
  venues: Venue[];
  handleReviewsClick: (venue: Venue) => void;
  isAddMode?: boolean;
  selectedLocation?: {lat: number; lng: number} | null;
}

export const useVenueMarkers = ({
  mapInstance,
  mapReady,
  venues,
  handleReviewsClick,
  isAddMode = false,
  selectedLocation
}: UseVenueMarkersProps) => {
  const markersRef = useRef<Marker[]>([]);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const popupContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const activeVenueRef = useRef<{id: number; lat: number; lng: number} | null>(null);
  const isUnmountedRef = useRef(false);
  const tempMarkerRef = useRef<Marker | null>(null);

  // Inicjalizacja kontenera dla popupu
  useEffect(() => {
    const container = document.createElement('div');
    container.className = 'leaflet-popup-fixed';
    container.style.position = 'absolute';
    container.style.zIndex = '20';
    container.style.display = 'none';
    container.style.transform = 'translate(-50%, -100%)';
    document.body.appendChild(container);
    popupContainerRef.current = container;
    popupRootRef.current = createRoot(container);
    isUnmountedRef.current = false;

    return () => {
      isUnmountedRef.current = true;
      if (popupRootRef.current) {
        popupRootRef.current.unmount();
        popupRootRef.current = null;
      }
      if (popupContainerRef.current) {
        popupContainerRef.current.remove();
        popupContainerRef.current = null;
      }
    };
  }, []);

  // Zarządzanie markerami i clusterami
  useEffect(() => {
    if (!mapInstance.current || !mapReady || !popupRootRef.current || !popupContainerRef.current) return;
    
    const map = mapInstance.current;

    // Funkcja aktualizacji pozycji popupu
    const updatePopupPosition = () => {
      if (activeVenueRef.current && popupContainerRef.current && map) {
        const point = map.latLngToContainerPoint([
          activeVenueRef.current.lat,
          activeVenueRef.current.lng
        ]);
        
        const mapContainer = map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        popupContainerRef.current.style.left = `${point.x + mapRect.left}px`;
        popupContainerRef.current.style.top = `${point.y + mapRect.top - 10}px`;
      }
    };

    // Inicjalizacja cluster group
    if (!markerClusterGroupRef.current) {
      const L = window.L;
      markerClusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 15,
        chunkedLoading: true,
        removeOutsideVisibleBounds: true,
        animate: true
      });
      map.addLayer(markerClusterGroupRef.current);
    }

    // Bezpieczne czyszczenie markerów
    const clearMarkers = () => {
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current.clearLayers();
      }
      markersRef.current.forEach(marker => {
        if (marker) marker.remove();
      });
      markersRef.current = [];
    };

    // Czyszczenie starych markerów
    clearMarkers();

    // Dodawanie nowych markerów
    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;

      try {
        const marker = window.L.marker([venue.lat, venue.lng], {
          icon: createPriceMarker(venue.price)
        });

        marker.on('click', (e) => {
          e.originalEvent.stopPropagation();
          
          if (isUnmountedRef.current || !popupRootRef.current || !popupContainerRef.current) return;
        
          if (activeVenueRef.current?.id !== venue.id) {
            activeVenueRef.current = {
              id: venue.id,
              lat: venue.lat,
              lng: venue.lng
            };
        
            popupRootRef.current.render(
              <VenuePopup
                spotId={venue.id}
                name={venue.name}
                beer={venue.beer}
                price={venue.price}
                rating={venue.rating}
                reviewCount={venue.reviewCount}
                address={venue.address}
                openingStatus="unknown"
                latitude={venue.lat}
                longitude={venue.lng}
                mapInstance={mapInstance.current}
                onClose={() => {
                  if (popupContainerRef.current) {
                    popupContainerRef.current.style.display = 'none';
                  }
                  activeVenueRef.current = null;
                }}
              />
            );
          }
        
          popupContainerRef.current.style.display = 'block';
          updatePopupPosition();
        });

        markersRef.current.push(marker);
        if (markerClusterGroupRef.current) {
          markerClusterGroupRef.current.addLayer(marker);
        }
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });

    // Event handlers
    const handleMapMove = () => {
      if (!isUnmountedRef.current) {
        requestAnimationFrame(updatePopupPosition);
      }
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isUnmountedRef.current) return;
      
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest('.leaflet-popup-fixed') && 
          !target.closest('.venue-popup') && 
          !target.closest('.custom-marker')) {
        if (popupContainerRef.current) {
          popupContainerRef.current.style.display = 'none';
        }
        activeVenueRef.current = null;
      }
    };

    // Dodawanie event listenerów
    map.on('move', handleMapMove);
    map.on('zoom', handleMapMove);
    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);
    map.on('click', handleMapClick);
    window.addEventListener('resize', handleMapMove);

    // Handler resetowania markerów
    const handleReset = () => {
      if (markersRef.current.length === 0 && venues.length > 0) {
        clearMarkers();
        venues.forEach(venue => {
          try {
            const marker = window.L.marker([venue.lat, venue.lng], {
              icon: createPriceMarker(venue.price)
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
    };

    map.on('moveend', handleReset);
    map.on('zoomend', handleReset);

    // Cleanup
    return () => {
      map.off('move', handleMapMove);
      map.off('zoom', handleMapMove);
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
      map.off('click', handleMapClick);
      map.off('moveend', handleReset);
      map.off('zoomend', handleReset);
      window.removeEventListener('resize', handleMapMove);

      clearMarkers();
      if (markerClusterGroupRef.current) {
        map.removeLayer(markerClusterGroupRef.current);
        markerClusterGroupRef.current = null;
      }
    };
  }, [venues, mapReady, handleReviewsClick]);

  // Czyszczenie markera tymczasowego przy zmianie trybu lub lokalizacji
  useEffect(() => {
    if (!isAddMode || !selectedLocation) {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    }
  }, [isAddMode, selectedLocation]);

  return {
    markersRef,
    markerClusterGroupRef,
    tempMarkerRef,
    clearTempMarker: () => {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    }
  };
};