'use client';

import { useState, useEffect } from 'react';
import { BeerMap } from './components/map/BeerMap';
import { VenueList } from './components/venues/VenueList';
import { useVenues } from './hooks/useVenues';
import { useNearbyVenues } from './hooks/useNearbyVenues';
import { useGeolocation } from './hooks/useGeolocation';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './hooks/useAuth';
import FavoritesList from './components/favorites/FavoritesList';
import { useFavoritesStore } from './stores/useFavoritesStore';
import { toast } from 'react-hot-toast';
import { Map, ListOrdered, Heart, Plus, UserCircle, LogOut, Search } from 'lucide-react';
import { addBeerSpot, addBeerToBeerSpot } from './services/api';
import type { Map as LeafletMap } from 'leaflet';
import NewVenueForm from './components/forms/NewVenueForm';

// Bottom Navigation Component
const BottomNavigation = ({
  activeTab,
  onTabChange,
  isAuthenticated
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAuthenticated: boolean;
}) => {
  const navItems = [
    { id: 'map', label: 'Mapa', icon: <Map size={20} /> },
    { id: 'list', label: 'Lista', icon: <ListOrdered size={20} /> },
    { id: 'add', label: 'Dodaj', icon: <Plus size={20} /> },
    ...(isAuthenticated ? [{ id: 'favorites', label: 'Ulubione', icon: <Heart size={20} /> }] : [])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'text-amber-600'
                  : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Profile Dropdown Component
const ProfileDropdown = ({ 
  isProfileOpen,
  user,
  handleLogout,
  openAuthModal
}: {
  isProfileOpen: boolean;
  user: { name: string; email: string; } | null;
  handleLogout: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}) => {
  if (!isProfileOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
      {user ? (
        <>
          <div className="px-4 py-2 text-sm border-b">
            <div className="text-gray-900 font-medium">Witaj {user.name}!</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} className="mr-2" />
            Wyloguj się
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Zaloguj się
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Zarejestruj się
          </button>
        </>
      )}
    </div>
  );
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  const { latitude, longitude, error: geoError, source: geoSource } = useGeolocation();
  
  const { 
    venues: mapVenues, 
    setSearchTerm: setMapSearchTerm, 
    handleMapChange 
  } = useVenues(latitude, longitude);

  const {
    venues: listVenues,
    isLoading: isListLoading,
    error: listError,
    searchVenues
  } = useNearbyVenues(latitude, longitude);

  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      useFavoritesStore.getState().fetchFavorites();
    }
  }, [isAuthenticated]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setMapSearchTerm(value);
    searchVenues(value);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setSelectedLocation(null);
    if (activeTab === 'favorites' || activeTab === 'add') {
      setActiveTab('map');
    }

    if (mapInstance) {
      mapInstance.closePopup();
    }
  };

  const handleTabChange = (tabId: string) => {
    if (mapInstance) {
      mapInstance.closePopup();
    }
  
    if (tabId === 'add') {
      if (!isAuthenticated) {
        openAuthModal('login');
        return;
      }
      setSelectedLocation(null);
      toast.success('Kliknij na mapie, aby wybrać lokalizację', {
        duration: 3000,
        icon: '📍',
        style: {
          border: '1px solid #34D399',
          padding: '12px',
          color: '#065F46',
        },
      });
    } else {
      setSelectedLocation(null);
    }
    
    setActiveTab(tabId);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setIsProfileOpen(false);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalMode('login');
  };

  const handleMapReady = (map: LeafletMap) => {
    setMapInstance(map);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleVenueSubmit = async (formData: any) => {
    if (!selectedLocation) return;
    
    try {
      const spotId = await addBeerSpot({
        name: formData.name,
        address: formData.address,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        description: '',
        opening_hours: {
          monday: { open: '12:00', close: '23:00' },
          tuesday: { open: '12:00', close: '23:00' },
          wednesday: { open: '12:00', close: '23:00' },
          thursday: { open: '12:00', close: '23:00' },
          friday: { open: '12:00', close: '23:00' },
          saturday: { open: '12:00', close: '23:00' },
          sunday: { open: '12:00', close: '23:00' }
        }
      });
  
      await addBeerToBeerSpot(spotId, {
        name: formData.beerName,
        price: Number(formData.beerPrice),
        type: formData.beerType || 'lager',
        alcohol_percentage: Number(formData.alcoholPercentage || 0),
        status: 'available'
      });
  
      toast.success('Miejsce zostało dodane!');
      setSelectedLocation(null);
      setActiveTab('map');
      window.location.reload();
    } catch (error) {
      console.error('Error adding venue:', error);
      toast.error('Wystąpił błąd podczas dodawania miejsca');
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        initialMode={authModalMode}
      />

      {isClient && (
        <header className="fixed top-0 right-0 left-0 bg-white border-b z-40">
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🍺</span>
              <h1 className="text-xl font-bold text-amber-600 hidden sm:block">BeerSpots</h1>
            </div>
            
            <div className="flex-1 max-w-2xl mx-auto px-4">
              <div className="relative">
                <input
                  type="text"
                  value={localSearchTerm}
                  onChange={handleSearchChange}
                  placeholder="Szukaj lokalu, piwa lub adresu..."
                  className="w-full pl-10 pr-4 py-1.5 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
                <Search className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="relative ml-4">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <UserCircle className="w-6 h-6 text-gray-600" />
              </button>

              <ProfileDropdown 
                isProfileOpen={isProfileOpen}
                user={user}
                handleLogout={handleLogout}
                openAuthModal={openAuthModal}
              />
            </div>
          </div>
        </header>
      )}

      <main className="relative h-[calc(100vh-4rem)]">
        <div className="h-full">
          <BeerMap
            venues={mapVenues}
            onMapClick={(e) => {
              if (activeTab === 'add') {
                setSelectedLocation({
                  lat: e.latlng.lat,
                  lng: e.latlng.lng
                });
              } else {
                setSelectedLocation(null);
              }
            }}
            isAddMode={activeTab === 'add'}
            selectedLocation={selectedLocation}
            onBoundsChanged={handleMapChange}
            onMapReady={handleMapReady}
          />
        </div>
        
        {activeTab === 'list' && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-white overflow-y-auto pb-0 z-[30]"> 
            <div className="p-4 min-h-full bg-white">
              <VenueList
                venues={listVenues}
                isLoading={isListLoading}
                error={listError || (geoError && geoSource === 'default' ? 'Nie można załadować lokali - problem z lokalizacją' : null)}
              />
            </div>
          </div>
        )}

        {activeTab === 'favorites' && isAuthenticated && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-white overflow-y-auto pb-0 z-[30]">
            <div className="p-4 min-h-full bg-white">
              <FavoritesList />
            </div>
          </div>
        )}

        {activeTab === 'add' && selectedLocation && (
          <div className="fixed inset-x-0 bottom-16 bg-white border-t rounded-t-xl shadow-lg z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <NewVenueForm
                selectedLocation={selectedLocation}
                onSubmit={handleVenueSubmit}
                onCancel={() => {
                  setSelectedLocation(null);
                  setActiveTab('map');
                }}
              />
            </div>
          </div>
        )}  
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}