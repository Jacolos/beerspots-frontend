// src/app/components/auth/AuthModal.tsx

import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Add this useEffect to update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
          
          {mode === 'login' ? (
            <LoginForm 
              onClose={onClose} 
              onRegisterClick={() => setMode('register')}
            />
          ) : (
            <RegisterForm 
              onClose={onClose} 
              onLoginClick={() => setMode('login')}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};