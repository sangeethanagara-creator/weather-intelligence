import React from 'react';
import { Activity, Compass, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { ActivityScore } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface ActivityScoresWidgetProps {
  activities: ActivityScore[];
}

export const ActivityScoresWidget: React.FC<ActivityScoresWidgetProps> = ({ activities }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-sky-500 text-sky-400 border-sky-500/30';
    if (score >= 40) return 'bg-amber-500 text-amber-400 border-amber-500/30';
    return 'bg-rose-500 text-rose-400 border-rose-500/30';
  };

  const getProgressGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 60) return 'from-sky-500 to-indigo-400';
    if (score >= 40) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-red-400';
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
      <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-medium text-slate-100">Outdoor Activity Index</h3>
          <p className="text-xs text-slate-400">
            Real-time outdoor suitability ratings calculated from temperature, rain, wind, and sky clarity
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activities.map((act) => {
          const badgeStyle = getScoreColor(act.score);
          return (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 transition-all flex flex-col justify-between gap-3 group hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <WeatherIcon iconName={act.iconName} className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{act.name}</span>
                </div>

                <div
                  className={`px-2 py-0.5 rounded text-xs font-bold border bg-opacity-10 ${badgeStyle}`}
                >
                  {act.score}%
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(act.score)} transition-all duration-500`}
                    style={{ width: `${act.score}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">{act.suitability}</span>
                  <span className="text-slate-500 truncate max-w-[150px]">{act.reason}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
