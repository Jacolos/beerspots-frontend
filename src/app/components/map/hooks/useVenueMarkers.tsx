import React from 'react';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker, Popup } from 'leaflet';
import { createRoot } from 'react-dom/client';
import { createPriceMarker } from '../utils/markers';
import type { Venue } from '../../../types';
import VenuePopup from '../components/VenuePopup';

interface UseVenueMarkersProps {
  mapInstance: React.RefObject<LeafletMap | null>;
  mapReady: boolean;
  venues: Venue[];
  handleReviewsClick: (venue: Venue) => void;
}

export const useVenueMarkers = ({
  mapInstance,
  mapReady,
  venues,
  handleReviewsClick
}: UseVenueMarkersProps) => {
  const markersRef = useRef<Marker[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerClusterGroupRef = useRef<any>(null);
  const popupRootsRef = useRef<Map<number, { 
    root: ReturnType<typeof createRoot>, 
    element: HTMLElement,
    popup: Popup 
  }>>(new Map());
  const currentOpenPopupRef = useRef<number | null>(null);

  useEffect(() => {
  if (!mapInstance.current || !mapReady) return;

    if (!markerClusterGroupRef.current) {
      const L = window.L;
      markerClusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
        chunkedLoading: true,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let size = 'small';
          let additional = '';

          if (count > 50) {
            size = 'large';
            additional = 'bg-red-500';
          } else if (count > 10) {
            size = 'medium';
            additional = 'bg-amber-500';
          } else {
            additional = 'bg-amber-400';
          }

          return L.divIcon({
            html: `<div class="cluster-marker ${additional} text-white font-bold rounded-full flex items-center justify-center" style="width: 40px; height: 40px;">
              ${count}
            </div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(40, 40)
          });
        }
      });
      mapInstance.current.addLayer(markerClusterGroupRef.current);
    }

    // Clear existing markers
    markerClusterGroupRef.current.clearLayers();
    markersRef.current = [];

    // Cleanup old popup roots
    popupRootsRef.current.forEach(({ root, popup }) => {
      root.unmount();
      popup.remove();
    });
    popupRootsRef.current.clear();
    currentOpenPopupRef.current = null;

    // Add new markers
    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;

      const marker = window.L.marker([venue.lat, venue.lng], {
        icon: createPriceMarker(venue.price)
      });

      // Create a wrapper element for the popup content
      const popupContent = document.createElement('div');
      const root = createRoot(popupContent);

      // Create popup
      const popup = window.L.popup({
        minWidth: 288,
        maxWidth: 288,
        closeButton: true,
        closeOnClick: false,
        autoClose: true,
        className: 'venue-popup'
      });

      // Store references
      popupRootsRef.current.set(venue.id, { 
        root, 
        element: popupContent,
        popup 
      });

      // Render the VenuePopup component
      root.render(
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
        />
      );

      popup.setContent(popupContent);

      // Handle marker click
      marker.on('click', () => {
        // If there's another popup open, close it first
        if (currentOpenPopupRef.current && currentOpenPopupRef.current !== venue.id) {
          const currentPopup = popupRootsRef.current.get(currentOpenPopupRef.current);
          if (currentPopup) {
            currentPopup.popup.remove();
          }
        }

        // Open the new popup
        popup.setLatLng([venue.lat, venue.lng]);
        mapInstance.current?.addLayer(popup);
        currentOpenPopupRef.current = venue.id;
      });

      // Handle popup close
      popup.on('remove', () => {
        if (currentOpenPopupRef.current === venue.id) {
          currentOpenPopupRef.current = null;
        }
      });

      // Add to refs
      markersRef.current.push(marker);
      markerClusterGroupRef.current.addLayer(marker);
    });

    // Cleanup function
    return () => {
      popupRootsRef.current.forEach(({ root, popup }) => {
        root.unmount();
        popup.remove();
      });
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current.clearLayers();
      }
      currentOpenPopupRef.current = null;
    };
  }, [venues, mapReady, handleReviewsClick]);

  return { markersRef, markerClusterGroupRef };
};