// src/app/types/index.ts
export interface Venue {
  id: number;
  name: string;
  beer: string;
  price: string;
  rating: number;
  lat: number;
  lng: number;
  address?: string;
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
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}