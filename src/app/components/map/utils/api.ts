// src/app/components/map/utils/api.ts
interface ApiReview {
    id: number;
    rating: number;
    comment: string;
    visit_date: string;
    created_at: string;
    user: {
      id: number;
      name: string;
    };
  }
  
  interface ApiResponse {
    data: {
      spot_id: number;
      spot_name: string;
      average_rating: number;
      total_reviews: number;
      reviews: ApiReview[];
    };
  }
  
  export const fetchReviews = async (venueId: number, token: string | null) => {
    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${venueId}/spot-reviews`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) throw new Error('Nie udało się pobrać opinii');
      const responseData: ApiResponse = await response.json();
      
      return responseData.data.reviews;
    } catch (err) {
      console.error('Error fetching reviews:', err);
      throw err;
    }
  };