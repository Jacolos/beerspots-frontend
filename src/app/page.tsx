'use client';

import { useState, useEffect, useCallback } from 'react';
import { BeerMap } from './components/map/BeerMap';
import { VenueList } from './components/venues/VenueList';
import { AddVenueForm } from './components/forms/AddVenueForm';
import { useVenues } from './hooks/useVenues';
import { useNearbyVenues } from './hooks/useNearbyVenues';
import { useGeolocation } from './hooks/useGeolocation';
import { DEFAULT_OPENING_HOURS } from './utils/constants';
import { AddPlaceFormData } from './types';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './hooks/useAuth';
import FavoritesList from './components/favorites/FavoritesList';
import { useFavoritesStore } from './stores/useFavoritesStore';
import { 
  Menu, X, Map, ListOrdered, PlusCircle, Search, UserCircle, Heart, LogOut 
} from 'lucide-react';

const ProfileDropdown = ({ isProfileOpen, user, handleLogout, openAuthModal }: {
  isProfileOpen: boolean;
  user: { name: string; email: string } | null;
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const { latitude, longitude, error: geoError, source: geoSource } = useGeolocation();
  
  // Hook do mapy
  const { 
    venues: mapVenues, 
    setSearchTerm: setMapSearchTerm, 
    handleMapChange 
  } = useVenues(latitude, longitude);

  // Hook do listy lokali
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

  // W page.tsx, na początku komponentu Home:
useEffect(() => {
  if (isAuthenticated) {
    // Inicjujemy pobieranie ulubionych w tle
    useFavoritesStore.getState().fetchFavorites();
  }
}, [isAuthenticated]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setMapSearchTerm(value);
    searchVenues(value);
  };

  const navItems = [
    { id: 'map', label: 'Mapa', icon: <Map size={20} /> },
    { id: 'list', label: 'Lista lokali', icon: <ListOrdered size={20} /> },
    ...(isAuthenticated ? [
      { id: 'add', label: 'Dodaj lokal', icon: <PlusCircle size={20} /> },
      { id: 'favorites', label: 'Ulubione', icon: <Heart size={20} /> }
    ] : [])
  ];

  const [formData, setFormData] = useState<AddPlaceFormData>({
    name: '',
    address: '',
    description: '',
    latitude: null,
    longitude: null,
    beerName: '',
    beerPrice: null,
    beerType: 'lager',
    alcoholPercentage: null,
    openingHours: DEFAULT_OPENING_HOURS
  });

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (activeTab === 'add' && isAuthenticated) {
      e.originalEvent.preventDefault();
      const { lat, lng } = e.latlng;
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    }
  };

  const handleMapMoveEnd = useCallback((center: { 
    latitude: number; 
    longitude: number; 
    zoom: number; 
  }) => {
    handleMapChange(center);
  }, [handleMapChange]);

  const handleFormSuccess = () => {
    setFormData({
      name: '',
      address: '',
      description: '',
      latitude: null,
      longitude: null,
      beerName: '',
      beerPrice: null,
      beerType: 'lager',
      alcoholPercentage: null,
      openingHours: DEFAULT_OPENING_HOURS
    });
    window.location.reload();
    setActiveTab('map');
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    if (activeTab === 'add' || activeTab === 'report') {
      setActiveTab('map');
    }
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

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        initialMode={authModalMode}
      />

      <nav className={`fixed top-0 left-0 h-full bg-white w-64 shadow-lg transform lg:translate-x-0 transition-transform duration-200 ease-in-out z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🍺</span>
              <h1 className="text-2xl font-bold text-amber-600">BeerSpots</h1>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === item.id
                    ? 'bg-amber-50 text-amber-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="lg:pl-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b z-40">
          <div className="flex items-center justify-between h-12 px-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex-1 max-w-2xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  value={localSearchTerm}
                  onChange={handleSearchChange}
                  placeholder="Szukaj lokalu, piwa lub adresu..."
                  className="w-full pl-10 pr-4 py-1.5 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-gray-900 placeholder-gray-500"
                />
                <Search className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="relative ml-4">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
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

        <main className="pt-12">
          {activeTab === 'map' && (
            <div className="h-[calc(100vh-3rem)]">
              <BeerMap
                venues={mapVenues}
                onMapClick={handleMapClick}
                isAddMode={false}
                onBoundsChanged={handleMapMoveEnd}
              />
            </div>
          )}
          
          {activeTab === 'list' && (
            <div className="p-4">
              <VenueList
                venues={listVenues}
                isLoading={isListLoading}
                error={listError || (geoError && geoSource === 'default' ? 'Nie można załadować lokali - problem z lokalizacją' : null)}
              />
            </div>
          )}
          
          {activeTab === 'add' && isAuthenticated && (
            <div>
              <div className="h-[50vh]">
                <BeerMap
                  venues={mapVenues}
                  onMapClick={handleMapClick}
                  isAddMode={true}
                  onBoundsChanged={handleMapMoveEnd}
                />
              </div>
              <div className="p-4">
                <AddVenueForm
                  formData={formData}
                  setFormData={setFormData}
                  onSuccess={handleFormSuccess}
                />
              </div>
            </div>
          )}

{activeTab === 'favorites' && isAuthenticated && (
  <div className="p-4">
    <FavoritesList />
  </div>
)}

        </main>
      </div>
    </div>
  );
}