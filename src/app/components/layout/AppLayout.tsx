'use client';

import React, { useState } from 'react';
import { Map, ListOrdered, Heart, UserCircle, Search, LogOut, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../../hooks/useAuth';

interface TopNavigationProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAuthModalOpen: (mode: 'login' | 'register') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  onAuthModalOpen
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-40">
      {/* Top Bar */}
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍺</span>
          <h1 className="text-xl font-bold text-amber-600 hidden sm:block">BeerSpots</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Szukaj lokalu, piwa lub adresu..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === item.id
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <UserCircle className="w-6 h-6 text-gray-600" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm border-b">
                      <div className="font-medium text-gray-900">
                        {user?.name}
                      </div>
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
                      onClick={() => onAuthModalOpen('login')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Zaloguj się
                    </button>
                    <button
                      onClick={() => onAuthModalOpen('register')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Zarejestruj się
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'map', label: 'Mapa', icon: <Map size={20} /> },
  { id: 'list', label: 'Lista', icon: <ListOrdered size={20} /> },
  { id: 'favorites', label: 'Ulubione', icon: <Heart size={20} /> }
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
//  const { isAuthenticated } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleAuthModalOpen = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAuthModalOpen={handleAuthModalOpen}
      />

      <main className="pt-14 pb-16 md:pb-0">
        {children}
      </main>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold">
                {authModalMode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
              </Dialog.Title>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}