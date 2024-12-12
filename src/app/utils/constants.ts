// src/app/utils/constants.ts
export const DEFAULT_OPENING_HOURS = {
  monday: { open: '12:00', close: '23:00' },
  tuesday: { open: '12:00', close: '23:00' },
  wednesday: { open: '12:00', close: '23:00' },
  thursday: { open: '12:00', close: '23:00' },
  friday: { open: '12:00', close: '23:00' },
  saturday: { open: '14:00', close: '24:00' },
  sunday: { open: '14:00', close: '22:00' }
};

export const BEER_TYPES = [
  { value: 'lager', label: 'Lager' },
  { value: 'pilsner', label: 'Pilsner' },
  { value: 'ale', label: 'Ale' },
  { value: 'ipa', label: 'IPA' },
  { value: 'stout', label: 'Stout' },
  { value: 'porter', label: 'Porter' },
  { value: 'wheat', label: 'Pszeniczne' },
  { value: 'other', label: 'Inne' }
];