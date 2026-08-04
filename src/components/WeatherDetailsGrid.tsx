import React from 'react';
import {
  Wind,
  Compass,
  Droplets,
  Sun,
  Gauge,
  Cloud,
  Sunrise,
  Sunset,
  Eye,
  Thermometer,
} from 'lucide-react';
import { CurrentWeather, DailyForecastItem } from '../types/weather';

interface WeatherDetailsGridProps {
  current: CurrentWeather;
  todayDaily?: DailyForecastItem;
}

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({ current, todayDaily }) => {
  // Convert wind direction degrees to compass label
  const getWindDirectionLabel = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  // UV level text
  const getUVStatus = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-amber-400' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400' };
    if (uv <= 10) return { text: 'Very High', color: 'text-rose-400' };
    return { text: 'Extreme', color: 'text-purple-400' };
  };

  const uvStatus = getUVStatus(current.uvIndex);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Wind & Compass */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Wind className="w-4 h-4 text-cyan-400" /> Wind & Direction
          </span>
          <span className="font-semibold text-slate-200">{getWindDirectionLabel(current.windDirection)}</span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div>
            <span className="text-3xl font-extralight text-white">{Math.round(current.windSpeed)}</span>
            <span className="text-xs text-slate-400 ml-1">km/h</span>
            <p className="text-[10px] text-slate-500 mt-1">
              Max gust: {Math.round(todayDaily?.windSpeedMax || current.windSpeed * 1.3)} km/h
            </p>
          </div>

          {/* Compass Icon Rotator */}
          <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
            <Compass
              className="w-8 h-8 text-cyan-400 transition-transform duration-700"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Humidity & Dew Point */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Droplets className="w-4 h-4 text-blue-400" /> Humidity
          </span>
          <span className="text-blue-400 font-semibold">{current.relativeHumidity}%</span>
        </div>

        <div className="space-y-2 my-1">
          <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${current.relativeHumidity}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {current.relativeHumidity < 30
              ? 'Dry air conditions. Hydration recommended.'
              : current.relativeHumidity > 70
              ? 'High moisture & muggy atmosphere.'
              : 'Comfortable relative humidity level.'}
          </p>
        </div>
      </div>

      {/* 3. UV Index Gauge */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Sun className="w-4 h-4 text-amber-400" /> UV Radiation
          </span>
          <span className={`font-semibold ${uvStatus.color}`}>{uvStatus.text}</span>
        </div>

        <div className="space-y-2 my-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extralight text-white">{current.uvIndex.toFixed(1)}</span>
            <span className="text-xs text-slate-500">/ 12</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (current.uvIndex / 12) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Sunrise & Sunset */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Sunrise className="w-4 h-4 text-orange-400" /> Sun Arc
          </span>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider">{current.isDay ? 'Daytime' : 'Nighttime'}</span>
        </div>

        {todayDaily ? (
          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Sunrise className="w-3 h-3 text-amber-400" /> Sunrise
              </span>
              <span className="text-sm font-semibold text-slate-200 block mt-0.5">{todayDaily.sunrise}</span>
            </div>

            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Sunset className="w-3 h-3 text-orange-400" /> Sunset
              </span>
              <span className="text-sm font-semibold text-slate-200 block mt-0.5">{todayDaily.sunset}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Sunrise/Sunset schedule available in forecast</div>
        )}
      </div>
    </div>
  );
};
