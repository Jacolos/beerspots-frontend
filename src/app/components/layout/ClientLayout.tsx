// src/app/components/layout/ClientLayout.tsx
'use client';
import { useState } from 'react';
import { Menu, X, UserCircle, Bell } from 'lucide-react';
import { Navigation } from '../layout/Navigation';
import { Header } from '../layout/Header';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-amber-600 ml-3">🍺 BeerSpots</h1>
            </div>

            {/* Center - Search Bar */}
            <div className="hidden md:block flex-1 max-w-2xl mx-4">
              <div className="relative">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Szukaj lokalu, piwa lub adresu..."
                  className="w-full px-4 py-2 rounded-full border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-gray-50"
                />
              </div>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                >
                  <UserCircle size={24} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                      Zaloguj się
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                      Zarejestruj się
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search - Visible only on mobile */}
      <div className="lg:hidden fixed top-16 left-0 right-0 p-4 bg-white border-b z-40">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Szukaj lokalu, piwa lub adresu..."
          className="w-full px-4 py-2 rounded-full border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-gray-50"
        />
      </div>

      {/* Sidebar Navigation */}
      <nav className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out z-30`}>
        <div className="p-4">
          <a href="#" className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg mb-1">
            <span className="text-xl">🗺️</span>
            <span className="ml-3">Mapa</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg mb-1">
            <span className="text-xl">📝</span>
            <span className="ml-3">Lista lokali</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg mb-1">
            <span className="text-xl">➕</span>
            <span className="ml-3">Dodaj lokal</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg mb-1">
            <span className="text-xl">⚠️</span>
            <span className="ml-3">Zgłoś problem</span>
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`pt-32 lg:pt-24 ${isSidebarOpen ? 'lg:ml-64' : ''} transition-margin duration-200 ease-in-out`}>
        <div className="max-w-7xl mx-auto px-4 pb-8">
          {children}
        </div>
      </main>
    </>
  );
};