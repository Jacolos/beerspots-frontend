import React, { useState } from 'react';
import { register } from '../../services/auth';

interface RegisterFormProps {
  onClose: () => void;
  onLoginClick: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onClose, 
  onLoginClick 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(formData);
      window.location.reload();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas rejestracji');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Zarejestruj się</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Imię i nazwisko
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-gray-900"
            placeholder="Wprowadź imię i nazwisko"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-gray-900"
            placeholder="Wprowadź adres email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Hasło
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-gray-900"
            placeholder="Wprowadź hasło"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Potwierdź hasło
          </label>
          <input
            type="password"
            name="password_confirmation"
            required
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-gray-900"
            placeholder="Potwierdź hasło"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
        >
          {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
        </button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Masz już konto? </span>
          <button
            type="button"
            onClick={onLoginClick}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Zaloguj się
          </button>
        </div>
      </form>
    </div>
  );
};