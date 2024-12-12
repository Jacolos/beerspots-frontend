// src/app/hooks/useVenues.ts
'use client';
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

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const result = await fetchNearbyVenues(52.2, 21, 40);
        
        const transformedVenues = result.data
          .map((venue: VenueApiResponse) => ({
            id: venue.id,
            name: venue.name,
            beer: venue.cheapest_beer || 'Nieznane',
            price: venue.price ? `${Number(venue.price).toFixed(2)} zł` : 'Brak ceny',
            rating: venue.average_rating || 5.0,
            lat: venue.latitude,
            lng: venue.longitude,
            address: venue.address
          }))
          .filter((venue: Venue) => venue.lat && venue.lng);

        setVenues(transformedVenues);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Wystąpił nieznany błąd');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadVenues();
  }, []);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.beer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return { venues: filteredVenues, isLoading, error, searchTerm, setSearchTerm };
};