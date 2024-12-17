// src/app/types/index.ts
export interface Venue {
  id: number;
  name: string;
  beer: string;
  price: string;
  rating: number;
  reviewCount: number; 
  lat: number;
  lng: number;
  address?: string;
  distance: number;
}

export interface AddPlaceFormData {
  name: string;
  address: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  beerName: string;
  beerPrice: number | null;
  beerType: string;
  alcoholPercentage: number | null;
}

export interface CreateBeerSpotData {
  name: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  opening_hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export interface AddBeerData {
  name: string;
  price: number;
  type: string;
  alcohol_percentage: number;
  status: string;
}

export interface BeerData {
  price: number;
  type: string;
  alcohol_percentage: number;
  status: string;
  name: string;
}