import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onClose: () => void;
  onRegisterClick?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onClose, 
  onRegisterClick = () => {} 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err) {
      console.error(err);  // Log the actual error for debugging
      setError('Nieprawidłowy email lub hasło');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Zaloguj się</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-gray-900"
            placeholder="Wprowadź hasło"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
        >
          {isLoading ? 'Logowanie...' : 'Zaloguj się'}
        </button>

        {onRegisterClick && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Nie masz jeszcze konta? </span>
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Zarejestruj się
            </button>
          </div>
        )}
      </form>
    </div>
  );
};