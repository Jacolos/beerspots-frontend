import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Flag, Beer, X, Camera, Upload } from 'lucide-react';

const VenuePopupActions = () => {
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isAddBeerModalOpen, setAddBeerModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button 
          onClick={() => setAddBeerModalOpen(true)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Beer size={18} />
          <span>Dodaj piwo</span>
        </button>

        <button 
          onClick={() => setReportModalOpen(true)}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
        >
          <Flag size={18} />
        </button>
      </div>

      {/* Report Modal */}
      <Dialog open={isReportModalOpen} onClose={() => setReportModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Zgłoś problem
                </Dialog.Title>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Co jest nie tak?
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-32 resize-none text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="Opisz problem który zauważyłeś..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-xl hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-md hover:shadow-lg transition-all font-medium"
                >
                  Wyślij zgłoszenie
                </button>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Beer Modal */}
      <Dialog open={isAddBeerModalOpen} onClose={() => setAddBeerModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Dodaj nowe piwo
                </Dialog.Title>
                <button
                  onClick={() => setAddBeerModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nazwa piwa
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="np. Tyskie Gronie"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Cena (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Zdjęcie (opcjonalne)
                  </label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-4 text-center ${
                      isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {previewImage ? (
                      <div className="relative">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImage(null)}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <Camera className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Przeciągnij zdjęcie lub</p>
                        <label className="cursor-pointer">
                          <span className="bg-white px-4 py-2 rounded-lg text-sm text-amber-600 hover:text-amber-700 font-medium">
                            Wybierz plik
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 px-4 rounded-xl hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-md hover:shadow-lg transition-all font-medium"
                >
                  Dodaj piwo
                </button>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default VenuePopupActions;