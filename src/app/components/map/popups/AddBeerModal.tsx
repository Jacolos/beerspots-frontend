// app/components/map/popups/AddBeerModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Beer, X } from 'lucide-react';

interface AddBeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  spotId: number;
}

const AddBeerModal: React.FC<AddBeerModalProps> = ({ 
  isOpen, 
  onClose, 
  venueName, 
  spotId 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Musisz być zalogowany, aby dodać piwo');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`https://piwo.jacolos.pl/api/beer-spots/${spotId}/beers`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Wystąpił błąd podczas dodawania piwa');
      }

      setShowSuccess(true);
      setFormData({
        name: '',
        price: ''
      });

      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas dodawania piwa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Dodaj piwo
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">{venueName}</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {showSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
                Piwo zostało dodane pomyślnie!
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-900">
                Nazwa piwa
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="np. Tyskie Gronie"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-900">
                Cena (zł)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-base font-medium"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-base font-medium flex items-center"
              >
                <Beer size={18} className="mr-2" />
                <span>{isSubmitting ? 'Dodawanie...' : 'Dodaj piwo'}</span>
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddBeerModal;