// src/app/services/api.ts
import { AddPlaceFormData } from '../types';

const API_URL = 'https://piwo.jacolos.pl/api';
const API_TOKEN = '7|X8xytykqdQehV1qrCLnrAhcBJd4NAwcwc1s0psCr7c77d038';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_TOKEN}`
};

export const fetchNearbyVenues = async (lat: number, lng: number, radius: number) => {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      radius: radius.toString()
    });

    console.log('Fetching venues from:', `${API_URL}/beer-spots/nearbywithbeers?${params}`);
    
    const response = await fetch(`${API_URL}/beer-spots/nearbywithbeers?${params}`, {
      headers: headers
    });

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchNearbyVenues:', error);
    throw error;
  }
};

export const addBeerSpot = async (data: AddPlaceFormData) => {
  const beerSpotResponse = await fetch(`${API_URL}/beer-spots`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      opening_hours: data.openingHours
    })
  });

  if (!beerSpotResponse.ok) throw new Error('Failed to add beer spot');
  const beerSpotData = await beerSpotResponse.json();
  return beerSpotData.data.id;
};

export const addBeerToBeerSpot = async (spotId: number, data: AddPlaceFormData) => {
  const response = await fetch(`${API_URL}/beer-spots/${spotId}/beers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: data.beerName,
      price: Number(data.beerPrice).toFixed(2),
      type: data.beerType,
      alcohol_percentage: data.alcoholPercentage,
      status: 'available'
    })
  });

  if (!response.ok) throw new Error('Failed to add beer');
  return response.json();
};