// src/app/components/map/hooks/useMapInitialization.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, LeafletMouseEvent } from 'leaflet';
import { createUserLocationMarker, createPriceMarker } from '../utils/markers';
import { debounce } from 'lodash';

interface UseMapInitializationProps {
  mapRef: React.RefObject<HTMLDivElement>;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  onBoundsChanged?: (center: { 
    latitude: number; 
    longitude: number; 
    zoom: number 
  }) => void;
  isAddMode?: boolean;
  onMapClick?: (e: LeafletMouseEvent) => void;
}

export const useMapInitialization = ({
  mapRef,
  latitude,
  longitude,
  isDefault,
  onBoundsChanged,
  isAddMode,
  onMapClick
}: UseMapInitializationProps) => {
  const mapInstance = useRef<LeafletMap | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const debouncedHandleMapMove = useCallback(
    debounce(() => {
      if (!mapInstance.current || !onBoundsChanged) return;
      const center = mapInstance.current.getCenter();
      const zoom = mapInstance.current.getZoom();
      
      onBoundsChanged({
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoom
      });
    }, 300),
    [onBoundsChanged]
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      if (typeof window === 'undefined' || !window.L) return;

      const mapElement = mapRef.current;
      if (!mapElement) return;

      const L = window.L;
      mapInstance.current = L.map(mapElement, {
        zoomControl: true,
        dragging: true,
        maxZoom: 19
      }).setView([latitude, longitude], 14);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Add event listeners
      mapInstance.current.on('moveend', debouncedHandleMapMove);
      mapInstance.current.on('zoomend', debouncedHandleMapMove);

      if (!isDefault) {
        const userMarker = L.marker([latitude, longitude], {
          icon: createUserLocationMarker()
        })
          .bindPopup('Twoja lokalizacja')
          .addTo(mapInstance.current);
        
        userLocationMarkerRef.current = userMarker;
      }

      // Add locate control
      try {
        // @ts-expect-error - Leaflet.Locate plugin
        const lc = new L.Control.Locate({
          position: 'bottomright',
          strings: {
            title: 'Pokaż moją lokalizację'
          },
          flyTo: true,
          initialZoomLevel: 16,
          showPopup: false,
          showCompass: true,
          locateOptions: {
            enableHighAccuracy: true,
            maxZoom: 19
          }
        });
        lc.addTo(mapInstance.current);
      } catch (e) {
        console.warn('Locate control is not available:', e);
      }

      setMapReady(true);
      debouncedHandleMapMove();
    };

    if (typeof window !== 'undefined' && window.L) {
      initMap();
    } else {
      const leafletCheck = setInterval(() => {
        if (typeof window !== 'undefined' && window.L) {
          clearInterval(leafletCheck);
          initMap();
        }
      }, 100);

      return () => clearInterval(leafletCheck);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('moveend', debouncedHandleMapMove);
        mapInstance.current.off('zoomend', debouncedHandleMapMove);
        mapInstance.current.remove();
        mapInstance.current = null;
        setMapReady(false);
      }
    };
  }, [latitude, longitude, isDefault, debouncedHandleMapMove]);

  // Handle map clicks for adding new venues
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    const handleClick = (e: LeafletMouseEvent) => {
      if (!isAddMode || !onMapClick) return;

      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }

      const L = window.L;
      tempMarkerRef.current = L.marker(e.latlng, {
        icon: createPriceMarker('Nowa', true)
      })
        .bindPopup('Nowa lokalizacja')
        .addTo(mapInstance.current!)
        .openPopup();

      onMapClick(e);
    };

    mapInstance.current.on('click', handleClick);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleClick);
      }
    };
  }, [isAddMode, onMapClick, mapReady]);

  // Update map view when location changes
  useEffect(() => {
    if (!mapInstance.current || !mapReady || isDefault) return;

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, mapReady, isDefault]);

  return {
    mapInstance,
    mapReady,
    userLocationMarkerRef,
    tempMarkerRef
  };
};