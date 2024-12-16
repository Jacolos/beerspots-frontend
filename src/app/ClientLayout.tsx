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
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@0.79.0/dist/L.Control.Locate.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"
        strategy="beforeInteractive"
      />

      <Toaster
        position="bottom-center"
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
      `}</style>

      {children}
    </>
  );
}