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

interface GridCell {
  lat: number;
  lng: number;
  zoom: number;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface CacheEntry {
  timestamp: number;
  venues: Venue[];
  bounds: MapBounds;
}

interface MapCenter {
  latitude: number;
  longitude: number;
  zoom: number;
}

// Stałe konfiguracyjne
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 minut
const GRID_SIZE = 0.1; // Wielkość komórki siatki w stopniach
const MIN_ZOOM_CHANGE = 2; // Minimalna zmiana zoomu wymuszająca odświeżenie
const DEBOUNCE_DELAY = 300; // Opóźnienie debounce w ms
const MAX_VENUES_LIST = 40; // Maksymalna liczba lokali na liście

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
  const lastFetch = useRef<GridCell | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Zaokrąglanie do siatki
  const roundToGrid = (value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  // Generowanie klucza cache
  const generateCacheKey = (cell: GridCell): string => {
    return `${cell.lat.toFixed(3)},${cell.lng.toFixed(3)},${cell.zoom}`;
  };

  // Sprawdzanie czy należy pobrać nowe dane
  const shouldFetchNewData = (newCell: GridCell): boolean => {
    if (!lastFetch.current) return true;

    const zoomChanged = Math.abs(lastFetch.current.zoom - newCell.zoom) >= MIN_ZOOM_CHANGE;
    const positionChanged = 
      Math.abs(lastFetch.current.lat - newCell.lat) >= GRID_SIZE ||
      Math.abs(lastFetch.current.lng - newCell.lng) >= GRID_SIZE;

    return zoomChanged || positionChanged;
  };

  // Czyszczenie starego cache
  const clearOldCache = useCallback(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];

    cachedAreas.current.forEach((entry, key) => {
      if (now - entry.timestamp > CACHE_LIFETIME) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => cachedAreas.current.delete(key));
  }, []);

  // Główna funkcja pobierająca dane
  const loadVenuesForLocation = useCallback(async (center: MapCenter) => {
    if (loadingRef.current) return;

    const cell: GridCell = {
      lat: roundToGrid(center.latitude),
      lng: roundToGrid(center.longitude),
      zoom: Math.round(center.zoom)
    };

    // Sprawdź czy potrzebujemy nowych danych
    if (!shouldFetchNewData(cell)) return;

    const cacheKey = generateCacheKey(cell);
    clearOldCache();

    // Sprawdź cache
    const cachedEntry = cachedAreas.current.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_LIFETIME) {
      setVenues(cachedEntry.venues);
      setIsLoading(false);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    try {
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
        price: venue.price ? `${Number(venue.price).toFixed(2)} zł` : '??? zł',
        rating: venue.average_rating || 0,
        reviewCount: venue.review_count || 0,
        lat: venue.latitude,
        lng: venue.longitude,
        address: venue.address,
        distance: venue.distance
      }));

      // Zapisz w cache
      cachedAreas.current.set(cacheKey, {
        timestamp: Date.now(),
        venues: newVenues,
        bounds: {
          north: center.latitude + GRID_SIZE,
          south: center.latitude - GRID_SIZE,
          east: center.longitude + GRID_SIZE,
          west: center.longitude - GRID_SIZE
        }
      });

      lastFetch.current = cell;
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

  // Obsługa zmiany centrum mapy z debounce
  const handleMapChange = useCallback((newCenter: MapCenter) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setMapCenter(newCenter);
      loadVenuesForLocation(newCenter);
    }, DEBOUNCE_DELAY);
  }, [loadVenuesForLocation]);

  // Czyszczenie timeoutów
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Filtrowanie lokali
  const filtered = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.beer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.price?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pobieranie lokali do widoku listy
  const getListVenues = useCallback(() => {
    return [...filtered]
      .sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
      })
      .slice(0, MAX_VENUES_LIST);
  }, [filtered]);

  return {
    venues: filtered,
    listVenues: getListVenues(),
    isLoading,
    error,
    setSearchTerm,
    handleMapChange,
    mapCenter
  };
};

export default useVenues;