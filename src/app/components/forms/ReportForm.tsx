import React, { useState } from 'react';
import { Flag, AlertCircle, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';

const REPORT_REASONS = [
  { value: 'incorrect_price', label: 'Nieprawidłowa cena' },
  { value: 'incorrect_info', label: 'Błędne informacje' },
  { value: 'closed', label: 'Lokal zamknięty' },
  { value: 'inappropriate', label: 'Nieodpowiednia treść' },
  { value: 'spam', label: 'Spam' },
  { value: 'duplicate', label: 'Duplikat' },
  { value: 'other', label: 'Inny powód' }
];

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  spotId: number;
  venueName: string;
}

const ReportForm: React.FC<ReportFormProps> = ({
  isOpen,
  onClose,
  spotId,
  venueName
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Musisz być zalogowany, aby zgłosić problem');
      setIsSubmitting(false);
      return;
    }

    const reportData = {
      reason,
      description,
      spot_id: spotId
    };

    try {
      const response = await fetch('https://piwo.jacolos.pl/api/reports', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setShowSuccess(true);
      setReason('');
      setDescription('');

      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas wysyłania zgłoszenia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-start justify-center p-4 sm:items-center">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full mt-16 sm:mt-0">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Zgłoś problem
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">
                  {venueName}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            )}

            {showSuccess && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                Dziękujemy za zgłoszenie! Sprawdzimy je jak najszybciej.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-900 mb-1">
                  Powód zgłoszenia
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Wybierz powód...</option>
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-900 mb-1">
                  Opis problemu
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-base focus:ring-2 focus:ring-red-500 focus:border-red-500 h-32 resize-none"
                  placeholder="Opisz dokładnie na czym polega problem..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-base font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <Flag size={18} />
                  {isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ReportForm;