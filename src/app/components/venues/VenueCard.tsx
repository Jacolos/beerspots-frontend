import React, { useState } from 'react';
import { MapPin, Beer, Star, MessageSquare } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ReviewForm } from '../reviews/ReviewForm';

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

interface Venue {
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

export const VenueCard: React.FC<{ venue: Venue }> = ({ venue }) => {
  const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${venue.id}/spot-reviews`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Nie udało się pobrać opinii');
      const responseData: ApiResponse = await response.json();
      
      if (responseData.data && Array.isArray(responseData.data.reviews)) {
        setReviews(responseData.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania opinii');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewsClick = () => {
    setReviewsModalOpen(true);
    fetchReviews();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReviewsCount = (count: number) => {
    if (count === 1) return '1 opinia';
    if (count === 0) return '0 opinii';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return `${count} opinie`;
    return `${count} opinii`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {venue.name}
            </h3>
            <div className="flex items-center text-gray-900 mb-2">
              <Beer className="w-4 h-4 mr-2" />
              <span className="font-medium">Piwo: {venue.beer}</span>
              <span className="mx-2">•</span>
              <span className="font-bold text-amber-600">{venue.price}</span>
            </div>
            <div className="flex items-center text-gray-700 gap-4">
              {venue.address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{venue.address}</span>
                </div>
              )}
              <div className="flex items-center text-amber-600 font-medium">
                <span>{formatDistance(venue.distance)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
              <Star className="w-5 h-5 text-amber-400 mr-1" />
              <span className="font-bold text-amber-700">{venue.rating.toFixed(1)}</span>
            </div>
            <button
              onClick={handleReviewsClick}
              className="flex items-center px-3 py-1 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{getReviewsCount(venue.reviewCount)}</span>
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isReviewsModalOpen} onClose={() => setReviewsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    Opinie o {venue.name}
                  </Dialog.Title>
                  <p className="text-gray-600 mt-1">
                    {getReviewsCount(reviews.length)}
                  </p>
                </div>
                <button
                  onClick={() => setReviewsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 p-4">
                  {error}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  Brak opinii dla tego miejsca
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="bg-amber-50 px-3 py-1 rounded-full flex items-center">
                            <Star className="w-4 h-4 text-amber-400 mr-1" />
                            <span className="font-bold text-amber-700">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.visit_date)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {review.user.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              <ReviewForm 
                spotId={venue.id}
                token={token}
                onSuccess={() => {
                  fetchReviews();
                }}
              />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};