// src/app/components/forms/formFields/InputField.tsx
'use client';
import React from 'react';

interface InputFieldProps {
  label: string;
  type: 'text' | 'number';
  value: string | number | '';
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  icon?: string;
  step?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  icon = '',
  step
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' 
      ? e.target.value === '' ? 0 : Number(e.target.value)
      : e.target.value;
    onChange(newValue);
  };

  return (
    <div>
      <label className="block text-xl font-bold text-gray-900 mb-2">
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg text-gray-900 bg-white placeholder-gray-400"
        placeholder={placeholder}
        required={required}
        step={step}
      />
    </div>
  );
};