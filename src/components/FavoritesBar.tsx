import React from 'react';
import { Bookmark, MapPin, X, Trash2, ArrowRight } from 'lucide-react';
import { LocationResult } from '../types/weather';

interface FavoritesBarProps {
  favorites: LocationResult[];
  activeLocationId?: number;
  onSelectFavorite: (loc: LocationResult) => void;
  onRemoveFavorite: (id: number) => void;
  onClose: () => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favorites,
  activeLocationId,
  onSelectFavorite,
  onRemoveFavorite,
  onClose,
}) => {
  if (favorites.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Saved Favorite Locations</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 text-center py-2">
          No saved cities yet. Click &quot;Save City&quot; on any weather card to bookmark your favorite places!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Bookmark className="w-4 h-4 text-amber-400" />
          <span>Saved Favorite Locations ({favorites.length})</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {favorites.map((item) => {
          const isActive = activeLocationId === item.id;
          return (
            <div
              key={item.id}
              className={`group relative p-3 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                isActive
                  ? 'bg-sky-500/10 border-sky-500/40 text-white'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectFavorite(item)}
                className="flex-1 text-left flex items-center gap-2 truncate"
              >
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <div className="truncate">
                  <p className="text-xs font-semibold truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{item.country}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFavorite(item.id);
                }}
                title="Remove from saved"
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
