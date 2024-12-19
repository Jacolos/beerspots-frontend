/// <reference types="leaflet" />
/// <reference types="leaflet.markercluster" />

declare module 'leaflet.markercluster' {
  export = L;
}

interface Window {
  L: typeof L;
} 