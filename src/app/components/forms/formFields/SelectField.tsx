// src/app/components/forms/formFields/SelectField.tsx
'use client';
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  icon?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  icon = ''
}) => {
  return (
    <div>
      <label className="block text-xl font-bold text-gray-900 mb-2">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg text-gray-900 bg-white placeholder-gray-400"
        required={required}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
