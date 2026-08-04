import React, { useState } from 'react';
import { Clock, Thermometer, CloudRain, Wind } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HourlyForecastItem, TemperatureUnit } from '../types/weather';
import { formatTempString, convertTemperature } from '../utils/wmoCodes';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastChartProps {
  hourly: HourlyForecastItem[];
  unit: TemperatureUnit;
}

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({ hourly, unit }) => {
  const [activeTab, setActiveTab] = useState<'temp' | 'rain' | 'wind'>('temp');

  const chartData = hourly.map((item) => ({
    time: item.hourLabel,
    tempRaw: item.temp,
    temp: convertTemperature(item.temp, unit),
    apparentTemp: convertTemperature(item.apparentTemp, unit),
    rainProb: item.precipitationProbability,
    windSpeed: Math.round(item.windSpeed),
    weatherCode: item.weatherCode,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
            <span>{label}</span>
            <WeatherIcon code={data.weatherCode} className="w-4 h-4" />
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Temperature:</span>
            <span className="font-bold text-sky-400">{data.temp}°{unit === 'fahrenheit' ? 'F' : 'C'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Feels Like:</span>
            <span className="font-bold text-slate-200">{data.apparentTemp}°{unit === 'fahrenheit' ? 'F' : 'C'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Rain Prob:</span>
            <span className="font-bold text-blue-400">{data.rainProb}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Wind:</span>
            <span className="font-bold text-cyan-300">{data.windSpeed} km/h</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-slate-100">Hourly Forecast (Next 24 Hours)</h3>
            <p className="text-xs text-slate-400">Detailed hourly trends for temperature, precipitation probability, and wind</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'temp'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'rain'
                ? 'bg-blue-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation %</span>
          </button>
          <button
            onClick={() => setActiveTab('wind')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'wind'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>
        </div>
      </div>

      {/* Hourly Quick Scroll Cards */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin">
        {hourly.slice(0, 16).map((item, idx) => (
          <div
            key={`hourly-chip-${idx}`}
            className="flex-shrink-0 w-20 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between gap-1.5 text-center transition-all hover:border-slate-700"
          >
            <span className="text-[11px] font-medium text-slate-400">{item.hourLabel}</span>
            <WeatherIcon code={item.weatherCode} className="w-6 h-6 my-0.5" />
            <span className="text-sm font-semibold text-slate-100">
              {formatTempString(item.temp, unit)}
            </span>
            <span className="text-[10px] font-medium text-blue-400 flex items-center gap-0.5">
              <CloudRain className="w-3 h-3" /> {item.precipitationProbability}%
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Chart */}
      <div className="mt-4 h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />

            {activeTab === 'temp' && (
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGradient)"
                name="Temp"
              />
            )}

            {activeTab === 'rain' && (
              <Bar dataKey="rainProb" fill="url(#rainGradient)" radius={[4, 4, 0, 0]} name="Rain Prob %" />
            )}

            {activeTab === 'wind' && (
              <Area
                type="monotone"
                dataKey="windSpeed"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#windGradient)"
                name="Wind"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
