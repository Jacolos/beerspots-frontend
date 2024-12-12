// src/app/components/map/MapComponent.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import type { Map as LeafletMap, LeafletMouseEvent, Marker } from 'leaflet';
import { Venue } from '../../types';

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

const MapComponent: React.FC<MapComponentProps> = ({ venues, onMapClick, isAddMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const tempMarkerRef = useRef<Marker | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const L = window.L;
    mapInstance.current = L.map(mapRef.current).setView([52.2297, 21.0122], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Handle click events separately
  useEffect(() => {
    if (!mapInstance.current) return;

    const handleMapClick = (e: LeafletMouseEvent) => {
      if (!isAddMode || !onMapClick) return;

      e.originalEvent.preventDefault();
      
      // Remove previous temporary marker
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }

      // Add new marker
      const markerIcon = createPriceMarker('Nowa', true);
      tempMarkerRef.current = window.L.marker([e.latlng.lat, e.latlng.lng], {
        icon: markerIcon
      })
        .bindPopup('Nowa lokalizacja')
        .addTo(mapInstance.current!)
        .openPopup();

      onMapClick(e);
    };

    mapInstance.current.on('click', handleMapClick);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleMapClick);
      }
    };
  }, [isAddMode, onMapClick]);

  // Handle venue markers separately
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing venue markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new venue markers
    venues.forEach(venue => {
      const markerIcon = createPriceMarker(venue.price);
      const marker = window.L.marker([venue.lat, venue.lng], {
        icon: markerIcon
      })
        .bindPopup(`
          <div style="font-family: Arial;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${venue.name}</h3>
            <p style="margin: 4px 0;">🍺 ${venue.beer}</p>
            <p style="margin: 4px 0;">⭐ ${venue.rating}</p>
            <p style="margin: 4px 0;">📍 ${venue.address || 'Brak adresu'}</p>
          </div>
        `)
        .addTo(mapInstance.current!);
      
      markersRef.current.push(marker);
    });
  }, [venues]);

  return (
    <div 
      ref={mapRef}
      className="h-full w-full relative z-0" // Dodany niski z-index dla mapy
    />
  );
};

export default MapComponent;