import { getAuthToken } from './auth';

const API_URL = 'https://piwo.jacolos.pl/api';

// Interfaces
interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface FetchVenuesOptions {
  latitude: number;
  longitude: number;
  radius?: number;
  bounds?: MapBounds;
  zoom?: number;
}

interface ReviewData {
  rating: number;
  comment: string;
  visit_date: string;
}

interface CreateBeerSpotData {
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

interface AddBeerData {
  name: string;
  price: number;
  type: string;
  alcohol_percentage: number;
  status: string;
}

interface BeerData {
  price: number;
  type: string;
  alcohol_percentage: number;
  status: string;
  name: string;
}

// Helper Functions
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const calculateRadius = (zoom: number): number => {
  if (zoom >= 15) return 5;    // bardzo blisko
  if (zoom >= 13) return 10;   // miasto
  if (zoom >= 11) return 25;   // region
  if (zoom >= 9) return 50;    // województwo
  return 100;                  // cały kraj
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'Wystąpił błąd podczas komunikacji z serwerem';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Jeśli nie możemy sparsować JSON, używamy domyślnej wiadomości
    }
    throw new Error(errorMessage);
  }
  return response;
};

// Beer Spots API Functions
export const fetchNearbyVenues = async (options: FetchVenuesOptions) => {
  try {
    const radius = options.radius || calculateRadius(options.zoom || 13);
    
    const params = new URLSearchParams({
      latitude: options.latitude.toString(),
      longitude: options.longitude.toString(),
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

export const fetchBeerSpot = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/beer-spots/${id}`, {
      headers: getHeaders()
    }).then(handleApiError);
    
    return response.json();
  } catch (error) {
    console.error('Error fetching beer spot:', error);
    throw error;
  }
};

export const addBeerSpot = async (data: CreateBeerSpotData): Promise<number> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Musisz być zalogowany, aby dodać lokal');
  }

  try {
    const response = await fetch(`${API_URL}/beer-spots`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleApiError);

    const responseData = await response.json();
    return responseData.data.id;
  } catch (error) {
    console.error('Error adding beer spot:', error);
    throw error;
  }
};

export const updateBeerSpot = async (id: number, data: Partial<CreateBeerSpotData>) => {
  try {
    const response = await fetch(`${API_URL}/beer-spots/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error updating beer spot:', error);
    throw error;
  }
};

export const deleteBeerSpot = async (id: number) => {
  try {
    await fetch(`${API_URL}/beer-spots/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleApiError);
  } catch (error) {
    console.error('Error deleting beer spot:', error);
    throw error;
  }
};

// Beers API Functions
export const fetchBeers = async (spotId: number) => {
  try {
    const response = await fetch(`${API_URL}/beer-spots/${spotId}/beers`, {
      headers: getHeaders()
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error fetching beers:', error);
    throw error;
  }
};

export const addBeerToBeerSpot = async (spotId: number, data: AddBeerData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Musisz być zalogowany, aby dodać piwo');
  }

  const response = await fetch(`${API_URL}/beer-spots/${spotId}/beers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Nie udało się dodać piwa');
  return response.json();
};

export const updateBeer = async (beerId: number, data: Partial<BeerData>) => {
  try {
    const response = await fetch(`${API_URL}/beers/${beerId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error updating beer:', error);
    throw error;
  }
};

export const deleteBeer = async (beerId: number) => {
  try {
    await fetch(`${API_URL}/beers/${beerId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleApiError);
  } catch (error) {
    console.error('Error deleting beer:', error);
    throw error;
  }
};

// Reviews API Functions
export const fetchReviews = async (spotId: number) => {
  try {
    const response = await fetch(`${API_URL}/beer-spots/${spotId}/reviews`, {
      headers: getHeaders()
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const fetchSpotReviews = async (spotId: number) => {
  try {
    const response = await fetch(`${API_URL}/beer-spots/${spotId}/spot-reviews`, {
      headers: getHeaders()
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error fetching spot reviews:', error);
    throw error;
  }
};

export const addReview = async (spotId: number, data: ReviewData) => {
  try {
    const response = await fetch(`${API_URL}/beer-spots/${spotId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: number, data: Partial<ReviewData>) => {
  try {
    const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: number) => {
  try {
    await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleApiError);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Profile API Functions
export const fetchProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      headers: getHeaders()
    }).then(handleApiError);

    return response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const checkAuth = async () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    await fetchProfile();
    return true;
  } catch {
    return false;
  }
};