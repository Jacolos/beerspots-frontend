import React, { useState, useEffect } from 'react';
import { Star, Heart, Beer, Clock, MapPin, Flag, X } from 'lucide-react';
import { useFavoritesStore } from '../../../stores/useFavoritesStore';
import ReviewModal from './ReviewModal';
import AddBeerModal from './AddBeerModal';
import ReportForm from '../../forms/ReportForm';
import { ensurePopupVisible } from '../utils/mapCentering';

interface VenuePopupProps {
  spotId: number;
  name: string;
  beer?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  openingStatus?: 'open' | 'closed' | 'unknown';
  latitude: number;
  longitude: number;
  mapInstance?: L.Map | null;
  onClose?: () => void;
}

const VenuePopup: React.FC<VenuePopupProps> = ({
  spotId,
  name,
  beer = 'Nieznane',
  price = '??? zł',
  rating = 0,
  reviewCount = 0,
  address,
  openingStatus = 'unknown',
  latitude,
  longitude,
  mapInstance,
  onClose
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isAddBeerModalOpen, setAddBeerModalOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFavoriteLocal(isFavorite(spotId));
  }, [spotId, isFavorite]);

  // Nowy useEffect do centrowania popupu
  useEffect(() => {
    if (mapInstance && latitude && longitude) {
      const position = { lat: latitude, lng: longitude };
      
      // Najpierw wycentruj mapę na lokalizacji
      mapInstance.setView(position, mapInstance.getZoom(), {
        animate: true,
        duration: 0.5
      });

      // Następnie dostosuj pozycję, aby popup był całkowicie widoczny
      setTimeout(() => {
        ensurePopupVisible({
          map: mapInstance,
          lat: latitude,
          lng: longitude,
          popupHeight: 400,
          popupWidth: 280,
          padding: 50
        });
      }, 100);
    }
  }, [mapInstance, latitude, longitude]);

  // Efekt czyszczący
  useEffect(() => {
    return () => {
      setReviewModalOpen(false);
      setAddBeerModalOpen(false);
      setReportModalOpen(false);
    };
  }, []);

  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Musisz być zalogowany, aby dodać do ulubionych');
      return;
    }

    setIsLoading(true);
    try {
      const spotData = {
        id: spotId,
        name,
        address: address || '',
        latitude,
        longitude,
        average_rating: rating,
        beers: [{
          name: beer,
          price: parseFloat(price.replace(/[^\d.-]/g, '')) || 0
        }]
      };

      const newIsFavorite = await toggleFavorite(spotId, spotData);
      setIsFavoriteLocal(newIsFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  const getOpeningStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="text-green-600 font-medium">Otwarte</span>;
      case 'closed':
        return <span className="text-red-600 font-medium">Zamknięte</span>;
      default:
        return <span className="text-gray-600">Godziny nieznane</span>;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (mapInstance) {
      mapInstance.closePopup();
    }
  };

  return (
    <>
      <div 
        className="venue-popup bg-white rounded-lg overflow-hidden shadow-lg z-[25]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleFavoriteToggle}
                disabled={isLoading}
                className={`p-1.5 rounded-full transition-colors ${
                  isHovered ? 'bg-gray-100' : ''
                }`}
              >
                <Heart 
                  size={20} 
                  className={`transition-colors ${
                    isFavoriteLocal ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  } ${isLoading ? 'opacity-50' : ''}`}
                />
              </button>
              {onClose && (
                <button 
                  onClick={handleClose}
                  className="p-1.5 rounded-full transition-colors hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-900">
              <Beer size={18} className="mr-2 text-gray-800" />
              <span className="font-medium">{beer}</span>
            </div>
            <span className="font-bold text-amber-600">{price}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
              <Star size={16} className="text-amber-400 mr-1" />
              <span className="font-medium text-amber-700">{rating.toFixed(1)}</span>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="text-sm text-gray-900 hover:text-amber-600 transition-colors font-medium"
            >
              {reviewCount} {reviewCount === 1 ? 'opinia' : 'opinii'}
            </button>
          </div>

          <div className="flex items-center text-gray-900">
            <Clock size={16} className="mr-2 text-gray-800" />
            {getOpeningStatusLabel(openingStatus)}
          </div>

          <div className="flex items-center text-gray-900">
            <MapPin size={16} className="mr-2 text-gray-800 flex-shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 bg-gray-50 border-t grid grid-cols-3 gap-2">
          <button
            onClick={() => setAddBeerModalOpen(true)}
            className="flex items-center justify-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            <Beer size={16} className="mr-1" />
            <span>Dodaj piwo</span>
          </button>
          
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
              window.open(url, '_blank');
            }}
            className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <MapPin size={16} className="mr-1" />
            <span>Nawiguj</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <Flag size={16} className="mr-1" />
            <span>Zgłoś</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        venueName={name}
        spotId={spotId}
      />

      <AddBeerModal
        isOpen={isAddBeerModalOpen}
        onClose={() => setAddBeerModalOpen(false)}
        venueName={name}
        spotId={spotId}
      />

      <ReportForm 
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        spotId={spotId}
        venueName={name}
      />
    </>
  );
};

export default VenuePopup;