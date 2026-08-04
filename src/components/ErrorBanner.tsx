import React from 'react';
import { AlertTriangle, RefreshCw, Search, MapPin, ArrowRight } from 'lucide-react';
import { LocationResult } from '../types/weather';

interface ErrorBannerProps {
  message?: string;
  onRetry: () => void;
  onSelectPopular: (loc: LocationResult) => void;
}

const DEFAULT_POPULAR: LocationResult[] = [
  { id: 5128581, name: 'New York', latitude: 40.7128, longitude: -74.006, country: 'United States', country_code: 'US', timezone: 'America/New_York' },
  { id: 2643743, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', country_code: 'JP', timezone: 'Asia/Tokyo' },
  { id: 2988507, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', country_code: 'FR', timezone: 'Europe/Paris' },
];

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message = 'City not found. Please check spelling.',
  onRetry,
  onSelectPopular,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-rose-500/30 p-6 sm:p-8 shadow-xl my-6 text-slate-100 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-rose-300 flex items-center gap-2">
            Weather Search Error
          </h3>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onRetry}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" /> Try one of these popular weather hubs instead:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {DEFAULT_POPULAR.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectPopular(loc)}
              className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-sky-400 border border-slate-800 font-medium text-left flex items-center justify-between transition-all group"
            >
              <span>{loc.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
