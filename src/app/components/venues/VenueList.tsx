// src/app/components/venues/VenueList.tsx
'use client';
import React from 'react';
import { VenueCard } from './VenueCard';
import { Venue } from '../../types';

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  error: string | null;
}

export const VenueList: React.FC<VenueListProps> = ({ venues, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="text-center text-xl py-4 text-amber-600">
        Ładowanie lokalizacji... 🍺
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-xl text-red-500 py-4">
        Błąd: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {venues.map(venue => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
};