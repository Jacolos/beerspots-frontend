import React, { useState } from 'react';
import { Star, Heart, MapPin, Beer, Loader2, Clock } from 'lucide-react';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { useAuth } from '../../hooks/useAuth';

const LoadingState = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      <p className="text-gray-600 font-medium">Szukam najlepszych lokali w okolicy...</p>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
      <p className="font-medium">{error}</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="min-h-[300px] flex items-center justify-center">
    <div className="text-center">
      <Beer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Brak lokali w okolicy
      </h3>
      <p className="text-gray-600">
        Spróbuj zmienić kryteria wyszukiwania lub lokalizację
      </p>
    </div>
  </div>
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VenueCard = ({ venue }: { venue: any }) => {
  const { isAuthenticated } = useAuth();
  const { 
    toggleFavorite, 
    isFavorite,
    canAddMore 
  } = useFavoritesStore();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // You might want to trigger auth modal here
      alert('Musisz być zalogowany, aby dodać do ulubionych');
      return;
    }

    if (!isFavorite(venue.id) && !canAddMore()) {
      alert('Osiągnięto limit ulubionych miejsc. Usuń niektóre, aby dodać nowe.');
      return;
    }

    setIsTogglingFavorite(true);
    try {
      await toggleFavorite(venue.id, {
        id: venue.id,
        name: venue.name,
        address: venue.address || '',
        latitude: venue.lat,
        longitude: venue.lng,
        average_rating: venue.rating,
        beers: [{
          name: venue.beer,
          price: parseFloat(venue.price.replace(/[^\d.-]/g, '')) || 0
        }]
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleNavigate = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`,
      '_blank'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {venue.name}
              </h3>
              <button
                onClick={handleFavoriteClick}
                disabled={isTogglingFavorite}
                className={`p-1 rounded-full transition-colors ${
                  isTogglingFavorite ? 'opacity-50' : ''
                }`}
              >
                <Heart 
                  size={20} 
                  className={`transition-colors ${
                    isFavorite(venue.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center text-gray-900 mb-3">
              <Beer className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium truncate">{venue.beer}</span>
              <span className="mx-2">•</span>
              <span className="font-bold text-amber-600">{venue.price}</span>
            </div>

            {venue.address && (
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{venue.address}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-400 mr-1" />
                <span className="font-bold text-amber-700">
                  {venue.rating.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Otwarte</span>
              </div>

              <div className="flex items-center text-amber-600 font-medium">
                <span>{(venue.distance < 1 
                  ? `${(venue.distance * 1000).toFixed(0)}m`
                  : `${venue.distance.toFixed(1)}km`)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors whitespace-nowrap"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Nawiguj</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VenueList = ({ 
  venues, 
  isLoading, 
  error 
}: { 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  venues: any[];
  isLoading: boolean;
  error: string | null;
}) => {
  const nearestVenues = venues.slice(0, 40);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (venues.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Lokale w pobliżu
        </h2>
        <span className="text-sm text-gray-600">
          Pokazuje {nearestVenues.length} najbliższych lokali
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nearestVenues.map(venue => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
};