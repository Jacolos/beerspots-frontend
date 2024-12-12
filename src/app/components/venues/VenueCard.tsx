// src/app/components/venues/VenueCard.tsx
'use client';
import React from 'react';
import { Venue } from '../../types';
import { MapPin, Beer, Star } from 'lucide-react';

export const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{venue.name}</h3>
          <div className="flex items-center text-gray-900 mb-2">
            <Beer className="w-4 h-4 mr-2" />
            <span className="font-medium">Piwo: {venue.beer}</span>
            <span className="mx-2">•</span>
            <span className="font-bold text-amber-600">{venue.price}</span>
          </div>
          {venue.address && (
            <div className="flex items-center text-gray-700">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{venue.address}</span>
            </div>
          )}
        </div>
        <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
          <Star className="w-5 h-5 text-amber-400 mr-1" />
          <span className="font-bold text-amber-700">{venue.rating.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};