// src/app/components/favorites/FavoritesList.tsx
import React, { useEffect } from 'react';
import { Star, Heart, MapPin, Beer, Loader2 } from 'lucide-react';
import { useFavoritesStore } from '../../stores/useFavoritesStore';

const FavoritesList: React.FC = () => {
  const { 
    favorites, 
    isLoading, 
    error, 
    isInitialized,
    fetchFavorites,
    removeFavorite
  } = useFavoritesStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchFavorites(true);
    }
  }, [isInitialized, fetchFavorites]);

  // Pokaż loader tylko przy pierwszym ładowaniu
  if (!isInitialized && isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 text-amber-800 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">{error}</h3>
          <p>Zaloguj się, aby zobaczyć swoje ulubione miejsca</p>
        </div>
      </div>
    );
  }

  if (!isLoading && favorites.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Brak ulubionych miejsc
          </h3>
          <p className="text-gray-600">
            Dodaj miejsca do ulubionych, aby mieć do nich szybki dostęp
          </p>
        </div>
      </div>
    );
  }

  const handleNavigate = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative p-4 space-y-4">
      {isLoading && isInitialized && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        </div>
      )}

      {favorites.map((spot) => {
        const cheapestBeer = spot.beers?.length > 0 
          ? spot.beers.reduce((prev, current) => 
              (prev.price < current.price) ? prev : current
            )
          : null;

        return (
          <div 
            key={spot.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {spot.name}
                </h3>
                
                {cheapestBeer && (
                  <div className="flex items-center text-gray-900 mb-2">
                    <Beer className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {cheapestBeer.name}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="font-bold text-amber-600">
                      {cheapestBeer.price.toFixed(2)} zł
                    </span>
                  </div>
                )}

                {spot.address && (
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{spot.address}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-amber-400 mr-1" />
                  <span className="font-bold text-amber-700">
                    {spot.average_rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                
                <button
                  onClick={() => removeFavorite(spot.id)}
                  className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                >
                  <Heart className="w-4 h-4 mr-1 fill-current" />
                  <span>Usuń z ulubionych</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleNavigate(spot.latitude, spot.longitude)}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Nawiguj
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FavoritesList;