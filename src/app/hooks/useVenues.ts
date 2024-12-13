import { useState, useEffect, useCallback, useRef } from 'react';
import { Venue } from '../types';
import { fetchNearbyVenues } from '../services/api';

interface VenueApiResponse {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  open: 'open' | 'closed' | 'unknown';
  status: string;
  verified: boolean;
  average_rating: number;
  review_count: number;
  cheapest_beer: string | null;
  price: number | null;
  distance: number;
}

interface CacheEntry {
  timestamp: number;
  venues: Venue[];
}

interface MapCenter {
  latitude: number;
  longitude: number;
  zoom: number;
}

const CACHE_LIFETIME = 5 * 60 * 1000; // 5 minut

export const useVenues = (initialLat: number, initialLng: number) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState<MapCenter>({
    latitude: initialLat,
    longitude: initialLng,
    zoom: 13
  });
  const cachedAreas = useRef<Map<string, CacheEntry>>(new Map());
  const loadingRef = useRef<boolean>(false);

  const generateCacheKey = (lat: number, lng: number, zoom: number): string => {
    return `${lat.toFixed(3)},${lng.toFixed(3)},${zoom}`;
  };

  const clearOldCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of cachedAreas.current.entries()) {
      if (now - entry.timestamp > CACHE_LIFETIME) {
        cachedAreas.current.delete(key);
      }
    }
  }, []);

  const loadVenuesForLocation = useCallback(async (center: MapCenter) => {
    if (loadingRef.current) return; // Zabezpieczenie przed równoległymi zapytaniami
    
    const cacheKey = generateCacheKey(center.latitude, center.longitude, center.zoom);
    clearOldCache();

    // Sprawdź cache
    const cachedEntry = cachedAreas.current.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_LIFETIME) {
      setVenues(cachedEntry.venues);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      //console.log('Loading venues for:', center);
      
      const result = await fetchNearbyVenues({
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: center.zoom
      });

      if (!result?.data) {
        throw new Error('Brak danych z API');
      }

      const newVenues = result.data.map((venue: VenueApiResponse): Venue => ({
        id: venue.id,
        name: venue.name,
        beer: venue.cheapest_beer || 'Nieznane',
        price: venue.price ? `${Number(venue.price).toFixed(2)} zł` : 'Brak ceny',
        rating: venue.average_rating || 0,
        reviewCount: venue.review_count || 0,
        lat: venue.latitude,
        lng: venue.longitude,
        address: venue.address,
        distance: venue.distance,
       // openStatus: venue.open,
       // verified: venue.verified
      }));

      // Update cache
      cachedAreas.current.set(cacheKey, {
        timestamp: Date.now(),
        venues: newVenues
      });

      setVenues(newVenues);
      setError(null);
    } catch (err) {
      console.error('Error loading venues:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania lokali');
      setVenues([]);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [clearOldCache]);

  // Załaduj początkowe dane
  useEffect(() => {
    loadVenuesForLocation({
      latitude: initialLat,
      longitude: initialLng,
      zoom: 13
    });
  }, [initialLat, initialLng, loadVenuesForLocation]);

  // Obsługa zmiany centrum mapy
  const handleMapChange = useCallback((newCenter: MapCenter) => {
    setMapCenter(newCenter);
    loadVenuesForLocation(newCenter);
  }, [loadVenuesForLocation]);

  const filteredVenues = venues.filter(venue => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      venue.name.toLowerCase().includes(searchLower) ||
      venue.address?.toLowerCase().includes(searchLower) ||
      venue.beer.toLowerCase().includes(searchLower) ||
      venue.price.toLowerCase().includes(searchLower)
    );
  });

  // Dla widoku listy zwracamy tylko 40 najbliższych
  const getListVenues = useCallback(() => {
    return [...filteredVenues]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 40);
  }, [filteredVenues]);

  return {
    venues: filteredVenues,
    listVenues: getListVenues(),
    isLoading,
    error,
    setSearchTerm,
    handleMapChange,
    mapCenter
  };
};

export default useVenues;