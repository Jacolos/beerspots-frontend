import dynamic from 'next/dynamic';
import type { LeafletMouseEvent } from 'leaflet';
import { Venue } from '../../types';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-xl shadow-inner mb-4 flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Ładowanie mapy...</p>
    </div>
  )
});

interface BeerMapProps {
  venues: Venue[];
  onMapClick?: (e: LeafletMouseEvent) => void;
  isAddMode?: boolean;
}

export const BeerMap: React.FC<BeerMapProps> = (props) => {
  return <MapComponent {...props} />;
};