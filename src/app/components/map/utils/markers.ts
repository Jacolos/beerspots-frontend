// src/app/components/map/utils/markers.ts
export const createPriceMarker = (price: string, isTemp = false) => {
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