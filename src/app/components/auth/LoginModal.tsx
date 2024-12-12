import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const handleRegisterClick = () => {
    // TODO: Implement navigation to registration or open register modal
    console.log('Register clicked');
  };

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
          
          <LoginForm 
            onClose={onClose} 
            onRegisterClick={handleRegisterClick} 
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};