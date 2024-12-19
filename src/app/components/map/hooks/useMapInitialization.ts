import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, LeafletMouseEvent } from 'leaflet';
import { createUserLocationMarker, createPriceMarker } from '../utils/markers';
import { debounce } from 'lodash';
import 'leaflet.locatecontrol';

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
  selectedLocation?: { lat: number; lng: number } | null;
}

export const useMapInitialization = ({
  mapRef,
  latitude,
  longitude,
  isDefault,
  onBoundsChanged,
  isAddMode,
  onMapClick,
  selectedLocation,
}: UseMapInitializationProps) => {
  const mapInstance = useRef<LeafletMap | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null); 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locateControlRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const isFirstLocationUpdateRef = useRef(true);
  const lastKnownPositionRef = useRef({ lat: latitude, lng: longitude });
  const isUnmountingRef = useRef(false);

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

  const updateUserLocationMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstance.current || !userLocationMarkerRef.current || isUnmountingRef.current) return;

    const distance = mapInstance.current.distance(
      [lastKnownPositionRef.current.lat, lastKnownPositionRef.current.lng],
      [lat, lng]
    );

    if (distance > 10) {
      try {
        userLocationMarkerRef.current.setLatLng([lat, lng]);
        lastKnownPositionRef.current = { lat, lng };
        
        const popup = userLocationMarkerRef.current.getPopup();
        if (popup && popup.isOpen()) {
          popup.setContent('Twoja aktualna lokalizacja');
        }
      } catch (error) {
        console.error('Error updating user location marker:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      if (typeof window === 'undefined' || !window.L) return;

      const mapElement = mapRef.current;
      if (!mapElement) return;

      try {
        const L = window.L;
        mapInstance.current = L.map(mapElement, {
          zoomControl: true,
          dragging: true,
          maxZoom: 19,
          minZoom: 3,
          bounceAtZoomLimits: true
        }).setView([latitude, longitude], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstance.current);

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

        try {
          locateControlRef.current = new L.Control.Locate({
            position: 'bottomright',
            strings: {
              title: 'Pokaż moją lokalizację'
            },
            flyTo: true,
            cacheLocation: true,
            keepCurrentZoomLevel: true,
            setView: 'untilPan',
            returnToPrevBounds: true,
            //onLocationError: (event: { code: number; message: string }, control: L.Control.Locate) => {
            //  console.warn('Location error:', event.message || 'Unknown error');
            //},
            onLocationOutsideMapBounds: () => {
              console.warn('Location outside map bounds');
            },
            showPopup: false,
            locateOptions: {
              enableHighAccuracy: true
            }
          }).addTo(mapInstance.current);

          mapInstance.current.on('locationfound', (e: { latlng: L.LatLng }) => {
            if (!mapInstance.current || isUnmountingRef.current) return;
            
            const currentZoom = mapInstance.current.getZoom();
            updateUserLocationMarker(e.latlng.lat, e.latlng.lng);

            if (isFirstLocationUpdateRef.current) {
              mapInstance.current.setView(e.latlng, currentZoom);
              isFirstLocationUpdateRef.current = false;
            }

            localStorage.setItem('lastKnownLocation', JSON.stringify({
              latitude: e.latlng.lat,
              longitude: e.latlng.lng,
              source: 'gps'
            }));
          });

        } catch (e) {
          console.warn('Locate control initialization error:', e);
        }

        setMapReady(true);
        debouncedHandleMapMove();
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    };

    initMap();

    return () => {
      isUnmountingRef.current = true;
      if (mapInstance.current) {
        mapInstance.current.off('moveend', debouncedHandleMapMove);
        mapInstance.current.off('zoomend', debouncedHandleMapMove);
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      if (locateControlRef.current) {
        locateControlRef.current.stop();
      }
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    };
  }, [latitude, longitude, isDefault, debouncedHandleMapMove, updateUserLocationMarker]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    const handleMapClick = (e: LeafletMouseEvent) => {
      if (!isAddMode || !onMapClick) {
        if (tempMarkerRef.current) {
          tempMarkerRef.current.remove();
          tempMarkerRef.current = null;
        }
        return;
      }

      onMapClick(e);
    };

    mapInstance.current.on('click', handleMapClick);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleMapClick);
      }
    };
  }, [isAddMode, onMapClick, mapReady]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady || isDefault) return;
    updateUserLocationMarker(latitude, longitude);
  }, [latitude, longitude, mapReady, isDefault, updateUserLocationMarker]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (isAddMode && selectedLocation) {
      try {
        const L = window.L;
        tempMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
          icon: createPriceMarker('Nowa', true)
        })
          //.bindPopup('Nowa lokalizacja')
          .addTo(mapInstance.current)
          .openPopup();
      } catch (error) {
        console.error('Error creating temp marker:', error);
      }
    }

    return () => {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    };
  }, [mapReady, isAddMode, selectedLocation]);

  return {
    mapInstance,
    mapReady,
    userLocationMarkerRef,
    tempMarkerRef
  };
};