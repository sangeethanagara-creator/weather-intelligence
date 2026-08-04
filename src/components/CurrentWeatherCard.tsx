import React from 'react';
import {
  MapPin,
  Wind,
  Droplets,
  Gauge,
  Sun,
  Eye,
  Bookmark,
  BookmarkCheck,
  Clock,
  ArrowUp,
  ArrowDown,
  Cloud,
} from 'lucide-react';
import { FullWeatherData, TemperatureUnit } from '../types/weather';
import { getWMOMeta, formatTempString } from '../utils/wmoCodes';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  data: FullWeatherData;
  unit: TemperatureUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  unit,
  isFavorite,
  onToggleFavorite,
}) => {
  const { location, current, daily, lastUpdated } = data;
  const wmoMeta = getWMOMeta(current.weatherCode);
  const todayDaily = daily[0];

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl transition-all"
    >
      {/* Decorative Weather Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400 shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-white flex items-center gap-2">
              {location.name}
              {location.country_code && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 uppercase tracking-wider">
                  {location.country_code}
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-400 ml-7 mt-0.5">
            {[location.admin1, location.country].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Favorite Bookmark Button & Last Updated Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isFavorite
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            {isFavorite ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Save City</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Updated {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Temperature & Condition Grid */}
      <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Big Temperature Display */}
        <div className="md:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
            <WeatherIcon code={current.weatherCode} className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-extralight tracking-tight text-white">
                {formatTempString(current.temperature, unit)}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {wmoMeta.label}
              </span>
              <span className="text-xs text-slate-400">
                Feels like <strong className="text-slate-200 font-semibold">{formatTempString(current.apparentTemperature, unit)}</strong>
              </span>
            </div>

            {todayDaily && (
              <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-0.5 text-rose-400 font-medium">
                  <ArrowUp className="w-3.5 h-3.5" /> High: {formatTempString(todayDaily.tempMax, unit)}
                </span>
                <span className="flex items-center gap-0.5 text-sky-400 font-medium">
                  <ArrowDown className="w-3.5 h-3.5" /> Low: {formatTempString(todayDaily.tempMin, unit)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Atmospheric Stats Badges */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800 md:pl-6">
          {/* Wind */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Wind Speed</p>
              <p className="text-sm font-semibold text-slate-200">{Math.round(current.windSpeed)} km/h</p>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Humidity</p>
              <p className="text-sm font-semibold text-slate-200">{current.relativeHumidity}%</p>
            </div>
          </div>

          {/* UV Index */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">UV Index</p>
              <p className="text-sm font-semibold text-slate-200">{current.uvIndex.toFixed(1)}</p>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Pressure</p>
              <p className="text-sm font-semibold text-slate-200">{Math.round(current.pressure)} hPa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Footer */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <p className="flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5 text-slate-400" />
          {wmoMeta.description}
        </p>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          Source: Open-Meteo High-Resolution Global Forecast
        </span>
      </div>
    </div>
  );
};
