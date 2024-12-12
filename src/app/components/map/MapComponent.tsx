// src/app/components/map/MapComponent.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, LeafletMouseEvent, Marker } from 'leaflet';
import { Venue } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';


interface MapComponentProps {
  venues: Venue[];
  onMapClick?: (e: LeafletMouseEvent) => void;
  isAddMode?: boolean;
}

const createPriceMarker = (price: string, isTemp = false) => {
  const L = window.L;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${isTemp ? '#FCD34D' : '#D97706'};
        color: white;
        border-radius: 20px;
        padding: 6px 12px;
        font-weight: bold;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid white;
        white-space: nowrap;
      ">
        ${price}
      </div>
    `,
    iconSize: [40, 20],
    iconAnchor: [20, 10],
    popupAnchor: [0, -10]
  });
};

const createUserLocationMarker = () => {
  const L = window.L;
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative;">
        <div style="
          position: absolute;
          top: -12px;
          left: -12px;
          background-color: #3B82F6;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          border: 2px solid white;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const MapComponent: React.FC<MapComponentProps> = ({ venues, onMapClick, isAddMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const tempMarkerRef = useRef<Marker | null>(null);
  const userLocationMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { latitude, longitude, isLoading, error, isDefault } = useGeolocation();

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

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Add user location marker
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
        // @ts-expect-error - Leaflet.Locate plugin is loaded dynamically
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
        mapInstance.current.remove();
        mapInstance.current = null;
        setMapReady(false);
      }
    };
  }, [latitude, longitude, isDefault]);

  // Handle venue markers
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add venue markers (always, regardless of mode)
    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;

      const marker = window.L.marker([venue.lat, venue.lng], {
        icon: createPriceMarker(venue.price)
      })
        .bindPopup(`
          <div class="venue-popup">
            <h3 class="text-lg font-bold mb-2">${venue.name}</h3>
            <p class="mb-1">🍺 ${venue.beer}</p>
            <p class="mb-1">⭐ ${venue.rating}</p>
            <p>📍 ${venue.address || 'Brak adresu'}</p>
          </div>
        `)
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
    });
  }, [venues, mapReady]);

  // Handle map clicks
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    const handleClick = (e: LeafletMouseEvent) => {
      if (!isAddMode || !onMapClick) return;

      // Clear previous temporary marker
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }

      // Add new marker
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

    // Update user location marker position
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLatLng([latitude, longitude]);
    }

  }, [latitude, longitude, mapReady, isDefault]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full z-0" />
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md z-[400]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
            <span>Ustalanie twojej lokalizacji...</span>
          </div>
        </div>
      )}
      {error && (
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
      )}
    </div>
  );
};

export default MapComponent;