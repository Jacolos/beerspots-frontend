import { AddPlaceFormData } from '../types';
import { getAuthToken } from './auth';

const API_URL = 'https://piwo.jacolos.pl/api';

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const fetchNearbyVenues = async (lat: number, lng: number, radius: number) => {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      radius: radius.toString()
    });
    
    const response = await fetch(`${API_URL}/beer-spots/nearbywithbeers?${params}`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in fetchNearbyVenues:', error);
    throw error;
  }
};

export const addBeerSpot = async (data: AddPlaceFormData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Musisz być zalogowany, aby dodać lokal');
  }

  const beerSpotResponse = await fetch(`${API_URL}/beer-spots`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      opening_hours: data.openingHours
    })
  });

  if (!beerSpotResponse.ok) throw new Error('Nie udało się dodać lokalu');
  const beerSpotData = await beerSpotResponse.json();
  return beerSpotData.data.id;
};

export const addBeerToBeerSpot = async (spotId: number, data: AddPlaceFormData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Musisz być zalogowany, aby dodać piwo');
  }

  const response = await fetch(`${API_URL}/beer-spots/${spotId}/beers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      name: data.beerName,
      price: Number(data.beerPrice).toFixed(2),
      type: data.beerType,
      alcohol_percentage: data.alcoholPercentage,
      status: 'available'
    })
  });

  if (!response.ok) throw new Error('Nie udało się dodać piwa');
  return response.json();
};