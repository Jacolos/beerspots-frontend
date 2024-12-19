// src/app/components/map/utils/markers.ts
export const createPriceMarker = (price: string | number, isNew = false) => {
  const L = window.L;
  
  const html = isNew 
    ? `<div class="custom-marker new-location-marker">
         <span>📍</span>
       </div>`
    : `<div class="price-marker">
         <span>${typeof price === 'number' ? price.toFixed(2) : price}</span>
       </div>`;

  return L.divIcon({
    html: html,
    className: isNew ? 'new-location-marker' : 'price-marker',
    iconSize: [60, 30],
    iconAnchor: [30, 30]
  });
};
  
  export const createUserLocationMarker = () => {
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