import type { Map as LeafletMap } from 'leaflet';

interface CenterPopupOptions {
  map: LeafletMap;
  lat: number;
  lng: number;
  padding?: number;
  popupHeight?: number;
  popupWidth?: number;
}

export const ensurePopupVisible = ({
  map,
  lat,
  lng,
  padding = 50,
  popupHeight = 400,
  popupWidth = 280
}: CenterPopupOptions) => {
  // Convert the lat/lng to pixel coordinates
  const point = map.latLngToContainerPoint([lat, lng]);
  
  // Get the map container bounds
  const mapSize = map.getSize();
  
  // Calculate necessary offsets to keep popup visible
  let offsetX = 0;
  let offsetY = 0;
  
  // Check horizontal bounds (including popup width)
  if (point.x - (popupWidth / 2) < padding) {
    offsetX = padding - (point.x - (popupWidth / 2));
  } else if (point.x + (popupWidth / 2) > mapSize.x - padding) {
    offsetX = (mapSize.x - padding) - (point.x + (popupWidth / 2));
  }
  
  // Check vertical bounds (popup appears above the point)
  if (point.y - popupHeight < padding) {
    offsetY = padding - (point.y - popupHeight);
  } else if (point.y > mapSize.y - padding) {
    offsetY = (mapSize.y - padding) - point.y;
  }
  
  // If we need to adjust the position, do it smoothly
  if (offsetX !== 0 || offsetY !== 0) {
    map.panBy([-offsetX, -offsetY], {
      animate: true,
      duration: 0.25,
      easeLinearity: 0.25
    });
  }
};