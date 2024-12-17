import React, { useEffect } from 'react';
import { Star, Heart, MapPin, Beer, Loader2, Clock, Trash2 } from 'lucide-react';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { useGeolocation } from '../../hooks/useGeolocation';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

const formatDistance = (distance: number) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

const EmptyState = () => (
  <div className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-200">
    <Heart className="w-16 h-16 text-gray-300 mb-4" />
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      Brak ulubionych miejsc
    </h3>
    <p className="text-gray-600 text-center max-w-sm">
      Dodaj miejsca do ulubionych klikając ikonę serca przy lokalach, aby mieć do nich szybki dostęp
    </p>
  </div>
);

const LoadingState = () => (
  <div className="p-8 flex justify-center items-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      <p className="text-gray-600 font-medium">Ładowanie ulubionych...</p>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="p-8">
    <div className="bg-amber-50 text-amber-800 p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">{error}</h3>
      <p>Zaloguj się, aby zobaczyć swoje ulubione miejsca</p>
    </div>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FavoriteCard = ({ spot, userLocation, onRemove }: any) => {
  const cheapestBeer = spot.beers?.length > 0 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? spot.beers.reduce((prev: any, current: any) => 
        (prev.price < current.price) ? prev : current
      )
    : null;

  const distance = userLocation 
    ? calculateDistance(
        userLocation.latitude, 
        userLocation.longitude, 
        spot.latitude, 
        spot.longitude
      )
    : null;

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
              {spot.name}
            </h3>
            
            {cheapestBeer && (
              <div className="flex items-center text-gray-900 mb-3">
                <Beer className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="font-medium truncate">
                  {cheapestBeer.name}
                </span>
                <span className="mx-2">•</span>
                <span className="font-bold text-amber-600">
                  {cheapestBeer.price.toFixed(2)} zł
                </span>
              </div>
            )}

            {spot.address && (
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{spot.address}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-amber-400 mr-1" />
                <span className="font-bold text-amber-700">
                  {spot.average_rating?.toFixed(1) || '0.0'}
                </span>
              </div>

              {distance && (
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-medium text-blue-700">
                    {formatDistance(distance)}
                  </span>
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Otwarte</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 sm:items-end">
            <button
              onClick={() => onRemove(spot.id)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Usuń</span>
            </button>
            
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors"
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

const FavoritesList = () => {
  const { 
    favorites, 
    isLoading, 
    error, 
    isInitialized,
    fetchFavorites,
    removeFavorite
  } = useFavoritesStore();

  const { latitude, longitude } = useGeolocation();

  useEffect(() => {
    if (!isInitialized) {
      fetchFavorites(true);
    }
  }, [isInitialized, fetchFavorites]);

  if (!isInitialized && isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!isLoading && favorites.length === 0) {
    return <EmptyState />;
  }

  // Sort by distance if we have user location
  const sortedFavorites = [...favorites];
  if (latitude && longitude) {
    sortedFavorites.sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  return (
    <div className="relative">
      {isLoading && isInitialized && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {sortedFavorites.map((spot) => (
          <FavoriteCard 
            key={spot.id}
            spot={spot}
            userLocation={latitude && longitude ? { latitude, longitude } : null}
            onRemove={removeFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;