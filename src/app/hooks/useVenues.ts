// src/app/hooks/useVenues.ts
import { useState, useEffect } from 'react';
import { Venue } from '../types';
import { fetchNearbyVenues } from '../services/api';

interface VenueApiResponse {
  id: number;
  name: string;
  cheapest_beer: string;
  price: number;
  average_rating: number;
  latitude: number;
  longitude: number;
  address: string;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Promień Ziemi w kilometrach
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Odległość w kilometrach
};

export const useVenues = (userLat: number, userLng: number) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadVenues = async () => {
      try {
        console.log('Loading venues for location:', { userLat, userLng });
        setIsLoading(true);
        setError(null);
        
        const result = await fetchNearbyVenues(userLat, userLng, 40);
        console.log('API response:', result);

        if (!result || !result.data) {
          throw new Error('Brak danych z API');
        }

        const transformedVenues = result.data
          .map((venue: VenueApiResponse): Venue | null => {
            if (!venue.latitude || !venue.longitude) {
              console.warn('Venue missing coordinates:', venue);
              return null;
            }

            const distance = calculateDistance(
              userLat,
              userLng,
              venue.latitude,
              venue.longitude
            );

            return {
              id: venue.id,
              name: venue.name,
              beer: venue.cheapest_beer || 'Nieznane',
              price: venue.price ? `${Number(venue.price).toFixed(2)} zł` : 'Brak ceny',
              rating: venue.average_rating || 5.0,
              lat: venue.latitude,
              lng: venue.longitude,
              address: venue.address,
              distance: distance
            };
          })
          .filter((venue: Venue | null): venue is Venue => venue !== null)
          .sort((a: Venue, b: Venue) => a.distance - b.distance);

        console.log('Transformed venues:', transformedVenues);
        setVenues(transformedVenues);
      } catch (err) {
        console.error('Error loading venues:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Wystąpił nieznany błąd podczas ładowania lokali');
        }
        setVenues([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userLat && userLng) {
      loadVenues();
    }
  }, [userLat, userLng]);

  const filteredVenues = venues.filter(venue => {
    const searchLower = searchTerm.toLowerCase();
    return (
      venue.name.toLowerCase().includes(searchLower) ||
      venue.address?.toLowerCase().includes(searchLower) ||
      venue.beer.toLowerCase().includes(searchLower) ||
      venue.price.toLowerCase().includes(searchLower)
    );
  });

  return {
    venues: filteredVenues,
    isLoading,
    error,
    setSearchTerm
  };
};