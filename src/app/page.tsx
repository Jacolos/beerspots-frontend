'use client';
import { useState } from 'react';
import { BeerMap } from './components/map/BeerMap';
import { VenueList } from './components/venues/VenueList';
import { AddVenueForm } from './components/forms/AddVenueForm';
import { useVenues } from './hooks/useVenues';
import { useGeolocation } from './hooks/useGeolocation';
import { DEFAULT_OPENING_HOURS } from './utils/constants';
import { AddPlaceFormData } from './types';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './hooks/useAuth';
import { 
  Menu, X, Map, ListOrdered, PlusCircle, 
  AlertTriangle, Search, UserCircle, LogOut 
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
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('map');
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
        
    const { latitude, longitude, error: geoError, source: geoSource } = useGeolocation();
    const { venues, isLoading, error, setSearchTerm } = useVenues(latitude, longitude);
    const { isAuthenticated, user, logout } = useAuth();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearchTerm(value);
      setSearchTerm(value);
    };

    // Filter nav items based on authentication
    const navItems = [
      { id: 'map', label: 'Mapa', icon: <Map size={20} /> },
      { id: 'list', label: 'Lista lokali', icon: <ListOrdered size={20} /> },
      ...(isAuthenticated ? [
        { id: 'add', label: 'Dodaj lokal', icon: <PlusCircle size={20} /> },
        { id: 'report', label: 'Zgłoś problem', icon: <AlertTriangle size={20} /> }
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

    const handleFormSuccess = () => {
      setFormData({
        ...formData,
        name: '',
        address: '',
        description: '',
        latitude: null,
        longitude: null,
        beerName: '',
        beerPrice: null,
        beerType: 'lager',
        alcoholPercentage: null
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
      setAuthModalMode('login'); // Reset to default mode
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleCloseAuthModal}
          initialMode={authModalMode}
        />

        {/* Sidebar */}
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

        {/* Main content wrapper */}
        <div className="lg:pl-64">
          {/* Top bar */}
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

              {/* Profile button */}
              <div className="relative ml-4">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <UserCircle className="w-6 h-6 text-gray-600" />
                </button>

                {/* Profile dropdown */}
                <ProfileDropdown 
                  isProfileOpen={isProfileOpen}
                  user={user}
                  handleLogout={handleLogout}
                  openAuthModal={openAuthModal}
                />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="pt-12">
            {activeTab === 'map' && (
              <div className="h-[calc(100vh-3rem)]">
                <BeerMap
                  venues={venues}
                  onMapClick={handleMapClick}
                  isAddMode={false}
                />
              </div>
            )}
            
            {activeTab === 'list' && (
              <div className="p-4">
                <VenueList
                  venues={venues}
                  isLoading={isLoading}
                  error={error || (geoError && geoSource === 'default' ? 'Nie można załadować lokali - problem z lokalizacją' : null)}
                />
              </div>
            )}
            
            {activeTab === 'add' && isAuthenticated && (
              <div>
                <div className="h-[50vh]">
                  <BeerMap
                    venues={venues}
                    onMapClick={handleMapClick}
                    isAddMode={true}
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

            {activeTab === 'report' && isAuthenticated && (
              <div className="p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Zgłoś problem</h2>
                  <p className="text-gray-700">Funkcja zgłaszania problemów będzie dostępna wkrótce.</p>
                </div>
              </div>
            )}

            {/* Not authenticated message */}
            {(activeTab === 'add' || activeTab === 'report') && !isAuthenticated && (
              <div className="p-4">
                <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-6 text-center">
                  <h2 className="text-xl font-bold text-amber-800 mb-4">Wymagane logowanie</h2>
                  <p className="text-amber-700 mb-4">
                    Aby uzyskać dostęp do tej funkcji, musisz być zalogowany.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Zaloguj się
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
}