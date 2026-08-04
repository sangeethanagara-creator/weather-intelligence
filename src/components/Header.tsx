import React from 'react';
import { CloudLightning, MapPin, RefreshCw, Bookmark, Sparkles } from 'lucide-react';
import { TemperatureUnit } from '../types/weather';

interface HeaderProps {
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  onUseLocation: () => void;
  isLocating: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  favoritesCount: number;
  onToggleFavoritesDrawer: () => void;
  showFavoritesDrawer: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  onUseLocation,
  isLocating,
  onRefresh,
  isRefreshing,
  favoritesCount,
  onToggleFavoritesDrawer,
  showFavoritesDrawer,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-light tracking-wider text-white">
              METEORA<span className="font-bold text-sky-400">INTEL</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              ATMOSPHERIC INTELLIGENCE ENGINE
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Geolocation button */}
          <button
            onClick={onUseLocation}
            disabled={isLocating}
            title="Use current location"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 hover:text-white border border-slate-700/60 transition-all disabled:opacity-50"
          >
            <MapPin className={`w-3.5 h-3.5 text-sky-400 ${isLocating ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh weather data"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Favorites Toggle */}
          <button
            onClick={onToggleFavoritesDrawer}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showFavoritesDrawer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/90 text-slate-300 hover:text-white border-slate-700/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Unit Toggle Switcher */}
          <div className="flex items-center p-0.5 bg-slate-800/90 border border-slate-700/60 rounded-lg text-xs font-medium">
            <button
              onClick={() => unit !== 'celsius' && onToggleUnit()}
              className={`px-2.5 py-1 rounded-md transition-all ${
                unit === 'celsius'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => unit !== 'fahrenheit' && onToggleUnit()}
              className={`px-2.5 py-1 rounded-md transition-all ${
                unit === 'fahrenheit'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
