import React, { useState } from 'react';
import { Calendar, CloudRain, Sun, Wind, Sunrise, Sunset, ArrowUp, ArrowDown, ChevronRight, X } from 'lucide-react';
import { DailyForecastItem, TemperatureUnit } from '../types/weather';
import { getWMOMeta, formatTempString, convertTemperature } from '../utils/wmoCodes';
import { WeatherIcon } from './WeatherIcon';

interface SevenDayForecastProps {
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({ daily, unit }) => {
  const [selectedDay, setSelectedDay] = useState<DailyForecastItem | null>(null);

  // Find min and max across all 7 days for relative range calculations
  const globalMin = Math.min(...daily.map((d) => convertTemperature(d.tempMin, unit)));
  const globalMax = Math.max(...daily.map((d) => convertTemperature(d.tempMax, unit)));
  const totalRange = globalMax - globalMin || 1;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-slate-100">7-Day Forecast Outlook</h3>
            <p className="text-xs text-slate-400">Daily min/max temperatures, precipitation risk, and sun details</p>
          </div>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">Click day for details</span>
      </div>

      {/* 7-Day Cards List */}
      <div className="mt-5 space-y-2.5">
        {daily.map((item, idx) => {
          const wmoMeta = getWMOMeta(item.weatherCode);
          const minVal = convertTemperature(item.tempMin, unit);
          const maxVal = convertTemperature(item.tempMax, unit);

          // Calculate bar offsets
          const leftPercent = Math.max(0, Math.min(100, ((minVal - globalMin) / totalRange) * 100));
          const widthPercent = Math.max(8, Math.min(100, ((maxVal - minVal) / totalRange) * 100));

          return (
            <div
              key={item.date}
              onClick={() => setSelectedDay(item)}
              className={`group relative p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                idx === 0 ? 'border-sky-500/40 bg-slate-900/60' : ''
              }`}
            >
              {/* Day & Condition Name */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  <WeatherIcon code={item.weatherCode} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">{item.dayName}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block truncate max-w-[120px]">{wmoMeta.label}</span>
                </div>
              </div>

              {/* Rain Chance */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-[90px]">
                <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-semibold text-blue-300">{item.precipitationProbabilityMax}%</span>
                {item.precipitationSum > 0 && (
                  <span className="text-[10px] text-slate-500">({item.precipitationSum.toFixed(1)}mm)</span>
                )}
              </div>

              {/* Temperature Bar Visualizer */}
              <div className="flex-1 flex items-center gap-3 max-w-xs">
                <span className="text-xs font-medium text-sky-400 w-10 text-right">
                  {formatTempString(item.tempMin, unit)}
                </span>

                <div className="relative flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-medium text-rose-400 w-10">
                  {formatTempString(item.tempMax, unit)}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all hidden sm:block" />
            </div>
          );
        })}
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <WeatherIcon code={selectedDay.weatherCode} className="w-8 h-8" />
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {selectedDay.dayName} Details ({selectedDay.date})
                  </h4>
                  <p className="text-xs text-sky-400">{getWMOMeta(selectedDay.weatherCode).label}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <ArrowUp className="w-3.5 h-3.5 text-rose-400" /> Max Temperature
                </span>
                <span className="text-lg font-bold text-slate-100">
                  {formatTempString(selectedDay.tempMax, unit)}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">Feels like {formatTempString(selectedDay.apparentMax, unit)}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <ArrowDown className="w-3.5 h-3.5 text-sky-400" /> Min Temperature
                </span>
                <span className="text-lg font-bold text-slate-100">
                  {formatTempString(selectedDay.tempMin, unit)}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">Feels like {formatTempString(selectedDay.apparentMin, unit)}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Precipitation
                </span>
                <span className="text-lg font-bold text-blue-300">
                  {selectedDay.precipitationProbabilityMax}%
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">Total: {selectedDay.precipitationSum} mm</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Max UV Index
                </span>
                <span className="text-lg font-bold text-amber-300">
                  {selectedDay.uvIndexMax.toFixed(1)}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">Peak midday intensity</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-400" /> Sunrise
                </span>
                <span className="text-base font-semibold text-slate-200">{selectedDay.sunrise}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 mb-1">
                  <Sunset className="w-3.5 h-3.5 text-orange-400" /> Sunset
                </span>
                <span className="text-base font-semibold text-slate-200">{selectedDay.sunset}</span>
              </div>
            </div>

            {/* Max Wind */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Wind className="w-4 h-4 text-cyan-400" /> Peak Daily Wind Speed
              </span>
              <span className="font-semibold text-slate-100">{Math.round(selectedDay.windSpeedMax)} km/h</span>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
