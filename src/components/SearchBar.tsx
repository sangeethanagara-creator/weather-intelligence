import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, X, MapPin, Loader2, History, TrendingUp, Sparkles } from 'lucide-react';
import { LocationResult } from '../types/weather';
import { searchLocations } from '../services/openMeteo';

interface SearchBarProps {
  onSelectLocation: (loc: LocationResult) => void;
  isLoading: boolean;
  currentCityName?: string;
}

const POPULAR_CITIES: { name: string; country: string; lat: number; lon: number; tz: string }[] = [
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectLocation, isLoading, currentCityName }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recents, setRecents] = useState<LocationResult[]>(() => {
    try {
      const saved = localStorage.getItem('skyintel_recents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced Geocoding Search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (err) {
        console.error('Search error:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationResult) => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);

    // Save to recents
    const updatedRecents = [loc, ...recents.filter((r) => r.id !== loc.id)].slice(0, 5);
    setRecents(updatedRecents);
    try {
      localStorage.setItem('skyintel_recents', JSON.stringify(updatedRecents));
    } catch (e) {
      // ignore quota
    }

    onSelectLocation(loc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else if (query.trim()) {
      // Direct search trigger
      searchLocations(query).then((results) => {
        if (results.length > 0) {
          handleSelect(results[0]);
        } else {
          // Fake location trigger that will trigger openMeteo error handling
          onSelectLocation({
            id: 0,
            name: query.trim(),
            latitude: 999, // Intentional invalid lat to provoke "City not found"
            longitude: 999,
            country: '',
            country_code: '',
            timezone: 'auto',
          });
        }
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      {/* Input Group */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search city, region, or country (e.g., Tokyo, London, Sydney)..."
            className="w-full pl-12 pr-24 py-3 bg-slate-900 focus:bg-slate-950 text-slate-100 placeholder-slate-500 rounded-lg border border-slate-800 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm outline-none"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-slate-500 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || isSearching}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading || isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Popular Cities Pills */}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1 mr-1">
          <TrendingUp className="w-3 h-3 text-sky-400" /> Popular:
        </span>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() =>
              handleSelect({
                id: Math.round(city.lat * 100),
                name: city.name,
                latitude: city.lat,
                longitude: city.lon,
                country: city.country,
                country_code: '',
                timezone: city.tz,
              })
            }
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 transition-all"
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Autocomplete & Recents Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
          {isSearching && (
            <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              Searching geocoding database...
            </div>
          )}

          {!isSearching && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" /> Matching Locations
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full px-4 py-2 text-left flex items-center justify-between transition-colors ${
                    idx === selectedIndex ? 'bg-sky-500/10 text-sky-300' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="font-medium text-sm text-slate-100">{item.name}</span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        {[item.admin1, item.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching cities found for &quot;{query}&quot;. Try checking spelling.
            </div>
          )}

          {!query.trim() && recents.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <History className="w-3 h-3 text-amber-400" /> Recent Searches
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecents([]);
                    localStorage.removeItem('skyintel_recents');
                  }}
                  className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Clear history
                </button>
              </div>
              {recents.map((item) => (
                <button
                  key={`recent-${item.id}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-medium text-slate-200">{item.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
