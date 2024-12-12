import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  spotId: number;
  token: string | null;
  onSuccess: () => void;
  onClose?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ spotId, token, onSuccess, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

// Check if user has already reviewed this spot
useEffect(() => {
    const checkExistingReview = async () => {
      if (!token) return;
  
      try {
        const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/spot-reviews`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) return;
        
        const data = await response.json();
  
        let userId: string | null = null;
        try {
          const payload = token.split('.')[1];
          if (payload) {
            userId = JSON.parse(atob(payload)).sub || null;
          }
        } catch {
          console.error('Error decoding token');
        }
  
        if (userId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userReviews = data.data.reviews.filter((review: any) => review.user.id === userId);
          setHasExistingReview(userReviews.length > 0);
        }
      } catch (err) {
        console.error('Error checking existing review:', err);
      }
    };
  
    checkExistingReview();
  }, [spotId, token]);  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Musisz być zalogowany, aby dodać opinię');
      return;
    }

    if (hasExistingReview) {
      setError('Już dodałeś opinię dla tego miejsca, jeśli jeszcze jej nie widać, poczekaj na akceptacje.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment,
          visit_date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        throw new Error('Już dodałeś opinię dla tego miejsca, jeśli jeszcze jej nie widać, poczekaj na akceptacje.');
      }

      setShowSuccess(true);
      setComment('');
      setRating(5);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas dodawania opinii');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasExistingReview) {
    return (
      <div className="border-t border-gray-200 mt-6 pt-6">
        <div className="bg-amber-50 text-amber-800 p-4 rounded-md">
          Już dodałeś opinię dla tego miejsca. Możesz dodać tylko jedną opinię.
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 mt-6 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodaj swoją opinię</h3>
      
      {showSuccess ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
          Dziękujemy za opinię! Została wysłana do moderacji.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Ocena
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`p-1 rounded-full hover:bg-amber-50 transition-colors ${
                    value <= rating ? 'text-amber-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-gray-900">({rating}/5)</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Komentarz
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500"
              rows={4}
              placeholder="Napisz swoją opinię..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || hasExistingReview}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij opinię'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;