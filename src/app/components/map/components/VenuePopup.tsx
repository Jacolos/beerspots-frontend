import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
// Camera
import { Star, Heart, Beer, Clock, MapPin, Flag, X } from 'lucide-react';
import { useFavoritesStore } from '../../../stores/useFavoritesStore';
import ReportForm from '../../forms/ReportForm';

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

interface VenuePopupProps {
  spotId: number;
  name: string;
  beer?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  openingStatus?: 'open' | 'closed' | 'unknown';
  latitude: number;
  longitude: number;
}

// Review Modal Component
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

// Main VenuePopup Component
const VenuePopup: React.FC<VenuePopupProps> = ({
  spotId,
  name,
  beer = 'Nieznane',
  price = 'Brak ceny',
  rating = 0,
  reviewCount = 0,
  address,
  openingStatus = 'unknown',
  latitude,
  longitude
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isAddBeerModalOpen, setAddBeerModalOpen] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFavoriteLocal(isFavorite(spotId));
  }, [spotId, isFavorite]);

  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Musisz być zalogowany, aby dodać do ulubionych');
      return;
    }

    setIsLoading(true);
    try {
      const spotData = {
        id: spotId,
        name,
        address: address || '',
        latitude,
        longitude,
        average_rating: rating,
        beers: [{
          name: beer,
          price: parseFloat(price.replace(/[^\d.-]/g, '')) || 0
        }]
      };

      const newIsFavorite = await toggleFavorite(spotId, spotData);
      setIsFavoriteLocal(newIsFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  const getOpeningStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="text-green-600 font-medium">Otwarte</span>;
      case 'closed':
        return <span className="text-red-600 font-medium">Zamknięte</span>;
      default:
        return <span className="text-gray-600">Godziny nieznane</span>;
    }
  };

  return (
    <>
      <div 
        className="w-72 bg-white rounded-lg overflow-hidden shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <button 
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className={`p-1.5 rounded-full transition-colors ${
                isHovered ? 'bg-gray-100' : ''
              }`}
            >
              <Heart 
                size={20} 
                className={`transition-colors ${
                  isFavoriteLocal ? 'fill-red-500 text-red-500' : 'text-gray-400'
                } ${isLoading ? 'opacity-50' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-900">
              <Beer size={18} className="mr-2 text-gray-800" />
              <span className="font-medium">{beer}</span>
            </div>
            <span className="font-bold text-amber-600">{price}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
            <Star size={16} className="text-amber-400 mr-1" />
              <span className="font-medium text-amber-700">{rating.toFixed(1)}</span>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="text-sm text-gray-900 hover:text-amber-600 transition-colors font-medium"
            >
              {reviewCount} {reviewCount === 1 ? 'opinia' : 'opinii'}
            </button>
          </div>

          <div className="flex items-center text-gray-900">
            <Clock size={16} className="mr-2 text-gray-800" />
            {getOpeningStatusLabel(openingStatus)}
          </div>

          <div className="flex items-center text-gray-900">
            <MapPin size={16} className="mr-2 text-gray-800 flex-shrink-0" />
            <span className="line-clamp-2">{address}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 bg-gray-50 border-t grid grid-cols-3 gap-2">
          <button
            onClick={() => setAddBeerModalOpen(true)}
            className="flex items-center justify-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            <Beer size={16} className="mr-1" />
            <span>Dodaj piwo</span>
          </button>
          
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
              window.open(url, '_blank');
            }}
            className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <MapPin size={16} className="mr-1" />
            <span>Nawiguj</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <Flag size={16} className="mr-1" />
            <span>Zgłoś</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        venueName={name}
        spotId={spotId}
      />

      <AddBeerModal
        isOpen={isAddBeerModalOpen}
        onClose={() => setAddBeerModalOpen(false)}
        venueName={name}
        spotId={spotId}
      />

      <ReportForm 
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        spotId={spotId}
        venueName={name}
      />
    </>
  );
};

// Add Beer Modal Component
interface AddBeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  spotId: number;
}

const AddBeerModal: React.FC<AddBeerModalProps> = ({ 
  isOpen, 
  onClose, 
  venueName, 
  spotId 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
//  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Musisz być zalogowany, aby dodać piwo');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/beers`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Wystąpił błąd podczas dodawania piwa');
      }

      setShowSuccess(true);
      setFormData({
        name: '',
        price: ''
      });

      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas dodawania piwa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Dodaj piwo
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">{venueName}</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {showSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
                Piwo zostało dodane pomyślnie!
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-900">
                Nazwa piwa
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="np. Tyskie Gronie"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-900">
                Cena (zł)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
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
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-base font-medium flex items-center"
              >
                <Beer size={18} className="mr-2" />
                <span>{isSubmitting ? 'Dodawanie...' : 'Dodaj piwo'}</span>
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VenuePopup;