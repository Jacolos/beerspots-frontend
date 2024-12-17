// app/components/map/popups/ReviewModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Star, X } from 'lucide-react';

interface Review {
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

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  spotId: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  venueName, 
  spotId 
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      setReviewsError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Musisz być zalogowany, aby zobaczyć opinie');

        const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/spot-reviews`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Nie udało się pobrać opinii');
        
        const data = await response.json();
        setReviews(data.data.reviews || []);
      } catch (err) {
        setReviewsError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania opinii');
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [isOpen, spotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Musisz być zalogowany, aby dodać opinię');
      setIsSubmitting(false);
      return;
    }

    const reviewData = {
      rating: Number(rating),
      comment: comment.trim(),
      visit_date: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/reviews`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Wystąpił błąd podczas dodawania opinii');
      }

      setShowSuccess(true);
      setComment('');
      setRating(5);
      
      // Refresh reviews list
      const reviewsResponse = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/spot-reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (reviewsResponse.ok) {
        const newData = await reviewsResponse.json();
        setReviews(newData.data.reviews || []);
      }

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas dodawania opinii');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                Opinie dla {venueName}
              </Dialog.Title>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Existing Reviews Section */}
            <div className="mb-6">
              {isLoadingReviews ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
                </div>
              ) : reviewsError ? (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                  {reviewsError}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="bg-amber-50 px-2 py-1 rounded-full">
                            <div className="flex items-center">
                              <Star size={16} className="text-amber-400" />
                              <span className="ml-1 font-medium text-amber-700">
                                {review.rating}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {review.user.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.visit_date)}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-2">
                  Brak opinii dla tego miejsca
                </p>
              )}
            </div>

            {/* Add Review Form */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dodaj swoją opinię
              </h3>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              {showSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
                  Dziękujemy za opinię! Została wysłana do moderacji.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-900">
                    Ocena
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="p-1 rounded-full hover:bg-amber-50 transition-colors"
                      >
                        <Star 
                          size={28} 
                          className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} 
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({rating}/5)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-900">
                    Twój komentarz
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-32 resize-none"
                    placeholder="Opisz swoje doświadczenia..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-base font-medium"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-base font-medium"
                  >
                    {isSubmitting ? 'Wysyłanie...' : 'Wyślij opinię'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ReviewModal;