// src/app/ClientLayout.tsx
'use client';

import Script from "next/script";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { useFavoritesStore } from "./stores/useFavoritesStore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      useFavoritesStore.getState().fetchFavorites();
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* Leaflet core */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        strategy="beforeInteractive"
      />
      
      {/* Plugins - load after Leaflet core */}
      <Script
        src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.79.0/dist/L.Control.Locate.min.js"
        strategy="afterInteractive"
      />

      <Toaster
        position="top-center"
        containerStyle={{
          top: 50
        }}
        toastOptions={{
          className: 'text-sm',
          duration: 3000,
          style: {
            maxWidth: '500px',
            padding: '12px 20px',
          },
          success: {
            style: {
              background: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #6EE7B7',
            },
            icon: '✅',
          },
          error: {
            style: {
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
            },
            icon: '⚠️',
            duration: 4000,
          },
        }}
      />

      <style jsx global>{`
        .custom-loading-toast {
          background: #FFF;
          color: #1F2937;
          border: 1px solid #E5E7EB;
        }

        .cluster-marker {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          color: white;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .leaflet-container {
          font-family: inherit;
        }

        .leaflet-control-container .leaflet-bottom.leaflet-right {
          bottom: 35px !important; 
        }

        .leaflet-control-container .leaflet-right {
          right: 12px !important; 
        }

        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
        }

        .leaflet-popup-content {
          margin: 0;
        }

        .venue-popup {
          min-width: 280px;
        }

        .locate-control {
          border: 2px solid rgba(0,0,0,0.2);
          border-radius: 4px;
        }

        .locate-control.active {
          color: #2563EB;
        }

        .leaflet-marker-icon {
          background: none;
          border: none;
        }

        /* MarkerCluster custom styles */
        .marker-cluster-small {
          background-color: rgba(181, 226, 140, 0.6);
        }
        .marker-cluster-small div {
          background-color: rgba(110, 204, 57, 0.6);
        }

        .marker-cluster-medium {
          background-color: rgba(241, 211, 87, 0.6);
        }
        .marker-cluster-medium div {
          background-color: rgba(240, 194, 12, 0.6);
        }

        .marker-cluster-large {
          background-color: rgba(253, 156, 115, 0.6);
        }
        .marker-cluster-large div {
          background-color: rgba(241, 128, 23, 0.6);
        }

        .marker-cluster {
          background-clip: padding-box;
          border-radius: 20px;
        }
        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
        }
        .marker-cluster span {
          line-height: 30px;
        }

        .new-location-marker {
          background-color: #059669;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          font-weight: bold;
        }

        .new-location-marker span {
          font-size: 20px;
        }

        .price-marker {
          background-color: #D97706;
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
          white-space: nowrap;
          min-width: 60px;
          height: 30px;
        }

        .price-marker span {
          display: block;
          line-height: 1;
        }
      `}</style>

      {children}
    </>
  );
}