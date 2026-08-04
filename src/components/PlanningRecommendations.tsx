import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Shirt,
  Umbrella,
  Activity,
  HeartPulse,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Recommendation, RecommendationSeverity } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface PlanningRecommendationsProps {
  recommendations: Recommendation[];
}

export const PlanningRecommendations: React.FC<PlanningRecommendationsProps> = ({ recommendations }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Advice' },
    { id: 'clothing', label: 'Gear & Apparel' },
    { id: 'health', label: 'Health & Sun' },
    { id: 'alert', label: 'Alerts & Safety' },
    { id: 'activity', label: 'Outdoors' },
  ];

  const filtered = filterCategory === 'all'
    ? recommendations
    : recommendations.filter((r) => r.category === filterCategory);

  const getSeverityBadge = (severity: RecommendationSeverity) => {
    switch (severity) {
      case 'alert':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
          label: 'CRITICAL ALERT',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          label: 'ADVISORY',
        };
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          label: 'OPTIMAL',
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          icon: <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
          label: 'GUIDANCE',
        };
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-slate-100 flex items-center gap-2">
              Planning Recommendations Engine
            </h3>
            <p className="text-xs text-slate-400">
              Automated weather insights, clothing gear advice, and health precautions
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap border transition-all ${
                filterCategory === cat.id
                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-sm'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rec) => {
          const badge = getSeverityBadge(rec.severity);
          return (
            <div
              key={rec.id}
              className="group relative rounded-xl bg-slate-950 border border-slate-800 p-4 transition-all hover:border-slate-700 flex items-start gap-4"
            >
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                <WeatherIcon iconName={rec.iconName} className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">
                  {rec.title}
                </h4>

                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
            No specific recommendations for this filter category under current conditions.
          </div>
        )}
      </div>
    </div>
  );
};
