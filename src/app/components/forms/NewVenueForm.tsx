import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  address: string;
  streetNumber: string;
  city: string;
  beerName: string;
  beerPrice: string;
  image: File | null;
}

interface NewVenueFormProps {
  selectedLocation: { lat: number; lng: number };
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const NewVenueForm: React.FC<NewVenueFormProps> = ({
  selectedLocation,
  onSubmit,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    streetNumber: '',
    city: '',
    beerName: '',
    beerPrice: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch and format address when location is selected
  React.useEffect(() => {
    setIsLoadingAddress(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectedLocation.lat}&lon=${selectedLocation.lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        const address = data.address;
        const street = address.road || '';
        const number = address.house_number || '';
        const city = address.city || address.town || '';
        
        setFormData(prev => ({
          ...prev,
          address: `${street} ${number}, ${city}`,
          streetNumber: `${street} ${number}`,
          city: city
        }));
      })
      .catch(() => {
        setFormData(prev => ({
          ...prev,
          address: 'Nie udało się pobrać adresu'
        }));
      })
      .finally(() => setIsLoadingAddress(false));
  }, [selectedLocation]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleNext = () => {
    if (formData.name && formData.address) {
      setStep(2);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-t-xl shadow-lg">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">
          {step === 1 ? 'Dodaj nowe miejsce' : 'Dodaj piwo'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <div className="p-6">
        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Nazwa lokalu
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm text-gray-900 font-medium placeholder-gray-500"
                placeholder="np. Piwiarnia Pod Żółwiem"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Adres
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-300 rounded-lg font-medium text-gray-900 shadow-sm"
                />
                {isLoadingAddress && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNext}
                disabled={!formData.name || !formData.address}
                className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
              >
                Dalej
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Nazwa piwa
              </label>
              <input
                type="text"
                value={formData.beerName}
                onChange={(e) => setFormData({ ...formData, beerName: e.target.value })}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm text-gray-900 font-medium placeholder-gray-500"
                placeholder="np. Tyskie"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Cena (zł)
              </label>
              <input
                type="number"
                value={formData.beerPrice}
                onChange={(e) => setFormData({ ...formData, beerPrice: e.target.value })}
                className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm text-gray-900 font-medium placeholder-gray-500"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Zdjęcie (opcjonalne)
              </label>
              {previewImage ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition-colors">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">Kliknij aby dodać zdjęcie</span>
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

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-lg shadow-sm"
              >
                Wstecz
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.beerName || !formData.beerPrice}
                className="flex-1 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
              >
                Dodaj miejsce
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewVenueForm;