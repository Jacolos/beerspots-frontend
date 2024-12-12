// src/app/components/forms/AddVenueForm.tsx
'use client';
import React from 'react';
import { InputField } from './formFields/InputField';
import { SelectField } from './formFields/SelectField';
import { AddPlaceFormData } from '../../types';
import { BEER_TYPES } from '../../utils/constants';
import { addBeerSpot, addBeerToBeerSpot } from '../../services/api';

interface AddVenueFormProps {
  formData: AddPlaceFormData;
  setFormData: (data: AddPlaceFormData) => void;
  onSuccess: () => void;
}

export const AddVenueForm: React.FC<AddVenueFormProps> = ({
  formData,
  setFormData,
  onSuccess
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Upewnijmy się, że to też jest
    
    try {
      const spotId = await addBeerSpot(formData);
      await addBeerToBeerSpot(spotId, formData);
      onSuccess();
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Wystąpił błąd podczas dodawania miejsca');
    }
  };

  const updateFormData = (key: keyof AddPlaceFormData, value: string | number | null) => {
    setFormData({...formData, [key]: value});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        label="Nazwa lokalu"
        type="text"
        value={formData.name}
        onChange={(value) => updateFormData('name', value as string)}
        placeholder="np. Piwiarnia Pod Żółwiem"
        required
        icon="📍"
      />

      <InputField
        label="Adres"
        type="text"
        value={formData.address}
        onChange={(value) => updateFormData('address', value as string)}
        placeholder="ul. Piwna 1, Warszawa"
        required
        icon="📍"
      />

      <div>
        <label className="block text-xl font-bold text-gray-900 mb-2">
          📝 Opis
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg text-gray-900 bg-white placeholder-gray-400"
          placeholder="Krótki opis miejsca..."
          rows={3}
        />
      </div>

      <InputField
        label="Nazwa piwa"
        type="text"
        value={formData.beerName}
        onChange={(value) => updateFormData('beerName', value as string)}
        placeholder="np. Tyskie"
        required
        icon="🍺"
      />

      <InputField
        label="Cena piwa"
        type="number"
        value={formData.beerPrice ?? ''}  // używamy nullish coalescing
        onChange={(value) => updateFormData('beerPrice', value as number)}
        placeholder="0.00"
        required
        icon="💰"
        step="0.01"
      />

      <SelectField
        label="Typ piwa"
        value={formData.beerType}
        onChange={(value) => updateFormData('beerType', value)}
        options={BEER_TYPES}
        required
        icon="🍺"
      />

      <InputField
        label="Zawartość alkoholu (%)"
        type="number"
        value={formData.alcoholPercentage ?? ''}  // używamy nullish coalescing
        onChange={(value) => updateFormData('alcoholPercentage', value as number)}
        placeholder="5.0"
        required
        icon="🎯"
        step="0.1"
      />

      <div className="bg-amber-50 p-4 rounded-lg">
        <label className="block text-xl font-bold text-gray-900 mb-2">
          📍 Lokalizacja
        </label>
        {formData.latitude && formData.longitude ? (
          <p className="text-lg text-gray-900">
            Wybrana lokalizacja: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
          </p>
        ) : (
          <p className="text-lg text-gray-700">
            Kliknij na mapie powyżej, aby wybrać lokalizację
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-amber-600 text-white py-4 px-6 rounded-lg text-xl font-bold hover:bg-amber-700 transition-colors"
      >
        Dodaj lokal 🍺
      </button>
    </form>
  );
};