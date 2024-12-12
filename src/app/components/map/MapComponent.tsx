// src/app/components/map/MapComponent.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, LeafletMouseEvent, Marker } from 'leaflet';
import { Venue } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAuth } from '../../hooks/useAuth';
import { Dialog } from '@headlessui/react';
import { X, Star } from 'lucide-react';
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

interface MapComponentProps {
  venues: Venue[];
  onMapClick?: (e: LeafletMouseEvent) => void;
  isAddMode?: boolean;
}

const createPriceMarker = (price: string, isTemp = false) => {
  const L = window.L;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${isTemp ? '#FCD34D' : '#D97706'};
        color: white;
        border-radius: 20px;
        padding: 6px 12px;
        font-weight: bold;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 2px solid white;
        white-space: nowrap;
      ">
        ${price}
      </div>
    `,
    iconSize: [40, 20],
    iconAnchor: [20, 10],
    popupAnchor: [0, -10]
  });
};

const createUserLocationMarker = () => {
  const L = window.L;
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="position: relative;">
        <div style="
          position: absolute;
          top: -12px;
          left: -12px;
          background-color: #3B82F6;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          border: 2px solid white;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const getReviewsCount = (count: number) => {
  if (count === 1) return '1 opinia';
  if (count === 0) return '0 opinii';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return `${count} opinie`;
  return `${count} opinii`;
};

const MapComponent: React.FC<MapComponentProps> = ({ venues, onMapClick, isAddMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const tempMarkerRef = useRef<Marker | null>(null);
  const userLocationMarkerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { latitude, longitude, isLoading, error, isDefault } = useGeolocation();
  const { token } = useAuth();

  // States for reviews modal
  const [isReviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const fetchReviews = async (venueId: number) => {
    setIsLoadingReviews(true);
    setReviewsError(null);
    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${venueId}/spot-reviews`, {
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
      setReviewsError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania opinii');
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReviewsClick = useCallback((venue: Venue) => {
    setSelectedVenue(venue);
    setReviewsModalOpen(true);
    fetchReviews(venue.id);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      if (typeof window === 'undefined' || !window.L) return;

      const mapElement = mapRef.current;
      if (!mapElement) return;

      const L = window.L;
      mapInstance.current = L.map(mapElement, {
        zoomControl: true,
        dragging: true,
        maxZoom: 19
      }).setView([latitude, longitude], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance.current);

      if (!isDefault) {
        const userMarker = L.marker([latitude, longitude], {
          icon: createUserLocationMarker()
        })
          .bindPopup('Twoja lokalizacja')
          .addTo(mapInstance.current);
        
        userLocationMarkerRef.current = userMarker;
      }

      try {
        // @ts-expect-error - Leaflet.Locate plugin is loaded dynamically
        const lc = new L.Control.Locate({
          position: 'bottomright',
          strings: {
            title: 'Pokaż moją lokalizację'
          },
          flyTo: true,
          initialZoomLevel: 16,
          showPopup: false,
          showCompass: true,
          locateOptions: {
            enableHighAccuracy: true,
            maxZoom: 19
          }
        });
        lc.addTo(mapInstance.current);
      } catch (e) {
        console.warn('Locate control is not available:', e);
      }

      setMapReady(true);
    };

    if (typeof window !== 'undefined' && window.L) {
      initMap();
    } else {
      const leafletCheck = setInterval(() => {
        if (typeof window !== 'undefined' && window.L) {
          clearInterval(leafletCheck);
          initMap();
        }
      }, 100);

      return () => clearInterval(leafletCheck);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        setMapReady(false);
      }
    };
  }, [latitude, longitude, isDefault]);

  // Handle venue markers
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;

      const marker = window.L.marker([venue.lat, venue.lng], {
        icon: createPriceMarker(venue.price)
      })
        .bindPopup(`
          <div class="venue-popup">
            <h3 class="text-lg font-bold mb-2">${venue.name}</h3>
            <p class="mb-1">🍺 ${venue.beer}</p>
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-3">
                <div class="flex items-center">
                  <span class="mr-1">⭐</span>
                  <span class="font-medium">${venue.rating.toFixed(1)}</span>
                </div>
                <button 
                  class="show-reviews-btn px-3 py-1.5 text-sm bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors flex items-center"
                  data-venue-id="${venue.id}"
                >
                  <span class="mr-1">📝</span>
                  <span>${getReviewsCount(venue.reviewCount)}</span>
                </button>
              </div>
            </div>
            <p class="flex items-center text-gray-600">
              <span class="mr-1">📍</span>
              ${venue.address || 'Brak adresu'}
            </p>
          </div>
        `)
        .addTo(mapInstance.current!);

      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        if (!popup) return;
        
        const container = popup.getElement();
        if (!container) return;

        const reviewsBtn = container.querySelector('.show-reviews-btn');
        if (!reviewsBtn) return;

        reviewsBtn.addEventListener('click', (e) => {
          e.preventDefault();
          handleReviewsClick(venue);
          marker.closePopup();
        });
      });

      markersRef.current.push(marker);
    });
  }, [venues, mapReady, handleReviewsClick]);

  // Handle map clicks
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;

    const handleClick = (e: LeafletMouseEvent) => {
      if (!isAddMode || !onMapClick) return;

      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }

      const L = window.L;
      tempMarkerRef.current = L.marker(e.latlng, {
        icon: createPriceMarker('Nowa', true)
      })
        .bindPopup('Nowa lokalizacja')
        .addTo(mapInstance.current!)
        .openPopup();

      onMapClick(e);
    };

    mapInstance.current.on('click', handleClick);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleClick);
      }
    };
  }, [isAddMode, onMapClick, mapReady]);

  // Update map view when location changes
  useEffect(() => {
    if (!mapInstance.current || !mapReady || isDefault) return;

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, mapReady, isDefault]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full z-0" />
      
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md z-[400]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
            <span>Ustalanie twojej lokalizacji...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 right-4 bg-white px-4 py-3 rounded-lg shadow-md z-[400] max-w-md">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-amber-600">
              <svg className="w-5 h-5" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span className="font-medium">Informacja o lokalizacji</span>
            </div>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {selectedVenue && (
        <Dialog 
          open={isReviewsModalOpen} 
          onClose={() => setReviewsModalOpen(false)} 
          className="relative z-[500]"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      Opinie o {selectedVenue.name}
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
                {isLoadingReviews ? (
                  <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
                </div>
              ) : reviewsError ? (
                <div className="text-center text-red-600 p-4">
                  {reviewsError}
                </div>
              ) : (
                <>
                  {reviews.length === 0 ? (
                    <div className="text-center text-gray-500 p-4 mb-6">
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
                    spotId={selectedVenue.id}
                    token={token}
                    onSuccess={() => {
                      fetchReviews(selectedVenue.id);
                    }}
                  />
                </>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    )}
  </div>
);
};

export default MapComponent;