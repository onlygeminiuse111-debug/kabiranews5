import React, { useState } from 'react';
import { MapPin, X, Building, Check } from 'lucide-react';
import { INDIAN_STATES, POPULAR_CITIES } from '../data/categories';
import { useLanguage } from '../contexts/LanguageContext';

interface StateModalProps {
  onClose: () => void;
  onSelectStateCity: (state: string, city?: string) => void;
  currentState?: string;
  currentCity?: string;
}

export const StateModal: React.FC<StateModalProps> = ({
  onClose,
  onSelectStateCity,
  currentState = 'मध्य प्रदेश',
  currentCity,
}) => {
  const { language } = useLanguage();
  const [selectedState, setSelectedState] = useState(currentState);

  const cities = POPULAR_CITIES[selectedState] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {language === 'hi' ? 'अपना राज्य और शहर चुनें' : 'Select State & City'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* States Grid */}
        <div className="my-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            राज्य (State)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {INDIAN_STATES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between ${
                  selectedState === st
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{st}</span>
                {selectedState === st && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Cities */}
        {cities.length > 0 && (
          <div className="my-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              प्रमुख शहर ({selectedState})
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onSelectStateCity(selectedState);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 transition"
              >
                संपूर्ण {selectedState}
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onSelectStateCity(selectedState, city);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-amber-950 hover:text-amber-700 transition"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              onSelectStateCity(selectedState);
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
          >
            लागू करें (Apply)
          </button>
        </div>
      </div>
    </div>
  );
};
