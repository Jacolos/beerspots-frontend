export interface Venue {
  id: number;
  name: string;
  lat: number;
  lng: number;
  price?: string;
  beer?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  distance?: number;
} 