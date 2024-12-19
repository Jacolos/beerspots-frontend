import { useState, useEffect, useCallback } from 'react';
import { Venue } from '../types';
import { fetchNearbyVenues } from '../services/api';

interface UseNearbyVenuesResult {
  venues: Venue[];
  isLoading: boolean;
  error: string | null;
  searchVenues: (term: string) => void;
}

export const useNearbyVenues = (
  latitude: number,
  longitude: number
): UseNearbyVenuesResult => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcja do pobierania lokali
  const fetchVenues = useCallback(async () => {
    if (!latitude || !longitude) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchNearbyVenues({
        latitude,
        longitude,
        radius: 15 // Stały większy promień, np. 100km
      });

      if (!result?.data) {
        throw new Error('Brak danych z API');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const venuesData = result.data.map((venue: any): Venue => ({
        id: venue.id,
        name: venue.name,
        beer: venue.cheapest_beer || 'Nieznane',
        price: venue.price ? `${Number(venue.price).toFixed(2)}` : 'Brak ceny',
        rating: venue.average_rating || 0,
        reviewCount: venue.review_count || 0,
        lat: venue.latitude,
        lng: venue.longitude,
        address: venue.address,
        distance: venue.distance
      }));

      // Sortuj po odległości z prawidłowymi typami
      const sortedVenues = venuesData.sort((a: Venue, b: Venue) => a.distance - b.distance);
      
      setVenues(sortedVenues);
      setFilteredVenues(sortedVenues);
    } catch (err) {
      console.error('Error loading venues:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania lokali');
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude]);

  // Pobierz lokale przy zmianie lokalizacji
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Funkcja do wyszukiwania
  const searchVenues = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredVenues(venues);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = venues.filter(venue => 
      venue.name.toLowerCase().includes(searchLower) ||
      venue.address?.toLowerCase().includes(searchLower) ||
      venue.beer.toLowerCase().includes(searchLower) ||
      venue.price.toLowerCase().includes(searchLower)
    );

    setFilteredVenues(filtered);
  }, [venues]);

  return {
    venues: filteredVenues,
    isLoading,
    error,
    searchVenues
  };
};