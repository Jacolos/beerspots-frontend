// src/app/components/reviews/ReviewsModal.tsx
import { Dialog } from '@headlessui/react';
import { X, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Review {
  id: number;
  rating: number;
  comment: string;
  visit_date: string;
  user: {
    name: string;
  };
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotId: number;
  spotName: string;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  spotId,
  spotName
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/spot-reviews`);
        if (!response.ok) throw new Error('Nie udało się pobrać opinii');
        
        const data = await response.json();
        setReviews(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania opinii');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [spotId, isOpen]);

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
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-900">
                  Opinie o {spotName}
                </Dialog.Title>
                <p className="text-gray-600 mt-1">
                  {reviews.length} {reviews.length === 1 ? 'opinia' : 'opinii'}
                </p>
              </div>
              <button
                onClick={onClose}
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
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};