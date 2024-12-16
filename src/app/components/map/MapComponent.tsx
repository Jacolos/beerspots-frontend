import React, { useRef, useState, useCallback } from 'react';
import type { LeafletMouseEvent } from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuth } from '../../hooks/useAuth';
import { useMapInitialization } from './hooks/useMapInitialization';
import { useVenueMarkers } from './hooks/useVenueMarkers';
import { LocationStatus } from './components/LocationStatus';
import { ReviewsModal } from './components/ReviewsModal';
import type { Venue } from '../../types';
//import { fetchReviews } from './utils/api';

interface MapComponentProps {
  venues: Venue[];
  onMapClick?: (e: LeafletMouseEvent) => void;
  isAddMode?: boolean;
  onBoundsChanged?: (center: { 
    latitude: number; 
    longitude: number; 
    zoom: number 
  }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  venues,
  onMapClick,
  isAddMode,
  onBoundsChanged
}) => {
  // Use non-null assertion since the ref will be attached to a div that always exists
  const mapRef = useRef<HTMLDivElement>(null!);
  const { latitude, longitude, isLoading, error, isDefault } = useGeolocation();
  const { token } = useAuth();

  // Reviews modal state
  const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  //@typescript-eslint/no-unused-vars

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reviews, setReviews] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Initialize map
  const { mapInstance, mapReady } = useMapInitialization({
    mapRef,
    latitude,
    longitude,
    isDefault,
    onBoundsChanged,
    isAddMode,
    onMapClick
  });

  // Handle reviews modal
  const handleReviewsClick = useCallback(async (venue: Venue) => {
    setSelectedVenue(venue);
    setReviewsModalOpen(true);
    setIsLoadingReviews(true);
    
    try {
    //  const reviewsData = await fetchReviews(venue.id, token);
   //   setReviews(reviewsData);
     // setReviewsError(null);
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania opinii');
   //   setReviews([]);
    } finally {
    //  setIsLoadingReviews(false);
    }
  }, [token]);

  // Initialize markers
  useVenueMarkers({
    mapInstance,
    mapReady,
    venues,
    handleReviewsClick
  });

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full z-0" />
      
      <LocationStatus 
        isLoading={isLoading} 
        error={error} 
      />
      
      {selectedVenue && (
        <ReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={() => setReviewsModalOpen(false)}
          spotId={selectedVenue.id}
          spotName={selectedVenue.name}
        />
      )}
    </div>
  );
};

export default MapComponent;