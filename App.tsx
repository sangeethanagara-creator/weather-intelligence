import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { PlanningRecommendations } from './components/PlanningRecommendations';
import { ActivityScoresWidget } from './components/ActivityScoresWidget';
import { HourlyForecastChart } from './components/HourlyForecastChart';
import { SevenDayForecast } from './components/SevenDayForecast';
import { WeatherDetailsGrid } from './components/WeatherDetailsGrid';
import { FavoritesBar } from './components/FavoritesBar';
import { ErrorBanner } from './components/ErrorBanner';
import { LocationResult, FullWeatherData, TemperatureUnit } from './types/weather';
import { fetchWeatherData, reverseGeocode } from './services/openMeteo';
import { Loader2, CloudLightning, Sparkles, RefreshCw } from 'lucide-react';

const DEFAULT_LOCATION: LocationResult = {
  id: 2643743,
  name: 'London',
  latitude: 51.5074,
  longitude: -0.1278,
  country: 'United Kingdom',
  country_code: 'GB',
  admin1: 'England',
  timezone: 'Europe/London',
};

export default function App() {
  const [location, setLocation] = useState<LocationResult>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [showFavoritesDrawer, setShowFavoritesDrawer] = useState<boolean>(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<LocationResult[]>(() => {
    try {
      const saved = localStorage.getItem('skyintel_favorites');
      return saved ? JSON.parse(saved) : [DEFAULT_LOCATION];
    } catch {
      return [DEFAULT_LOCATION];
    }
  });

  // Load weather data for location
  const loadWeather = useCallback(async (targetLoc: LocationResult, showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Check for intentional error trigger (e.g., latitude 999)
      if (targetLoc.latitude > 90 || targetLoc.latitude < -90) {
        throw new Error(`City not found. Please check spelling for "${targetLoc.name}".`);
      }

      const data = await fetchWeatherData(targetLoc);
      setWeatherData(data);
      setLocation(targetLoc);
    } catch (err: any) {
      console.error('Weather load error:', err);
      setError(err?.message || 'City not found. Please check spelling.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(location);
  }, []);

  // Geolocation trigger
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          await loadWeather(loc);
        } catch (err) {
          setError('Could not retrieve weather for your exact coordinates.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setIsLocating(false);
        setError('Location permission denied or unavailable. Please search for a city name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle favorite bookmark
  const isCurrentFavorite = favorites.some((f) => f.id === location.id);

  const toggleFavorite = () => {
    let updated: LocationResult[];
    if (isCurrentFavorite) {
      updated = favorites.filter((f) => f.id !== location.id);
    } else {
      updated = [...favorites, location];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('skyintel_favorites', JSON.stringify(updated));
    } catch (e) {
      // ignore quota
    }
  };

  const handleRemoveFavorite = (id: number) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    try {
      localStorage.setItem('skyintel_favorites', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      {/* Header Bar */}
      <Header
        unit={unit}
        onToggleUnit={() => setUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'))}
        onUseLocation={handleUseLocation}
        isLocating={isLocating}
        onRefresh={() => loadWeather(location, true)}
        isRefreshing={isRefreshing}
        favoritesCount={favorites.length}
        onToggleFavoritesDrawer={() => setShowFavoritesDrawer((prev) => !prev)}
        showFavoritesDrawer={showFavoritesDrawer}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Search Bar Section */}
        <section className="space-y-4">
          <SearchBar
            onSelectLocation={(loc) => loadWeather(loc)}
            isLoading={isLoading}
            currentCityName={location.name}
          />

          {/* Drawer for Saved Favorites */}
          {showFavoritesDrawer && (
            <FavoritesBar
              favorites={favorites}
              activeLocationId={location.id}
              onSelectFavorite={(loc) => {
                loadWeather(loc);
                setShowFavoritesDrawer(false);
              }}
              onRemoveFavorite={handleRemoveFavorite}
              onClose={() => setShowFavoritesDrawer(false)}
            />
          )}
        </section>

        {/* Loading Spinner State */}
        {isLoading && !weatherData && (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
            </div>
            <p className="text-sm font-medium animate-pulse">Retrieving weather intelligence from Open-Meteo...</p>
          </div>
        )}

        {/* Error State Banner */}
        {error && (
          <ErrorBanner
            message={error}
            onRetry={() => loadWeather(DEFAULT_LOCATION)}
            onSelectPopular={(loc) => loadWeather(loc)}
          />
        )}

        {/* Loaded Weather Dashboard Content */}
        {!isLoading && weatherData && !error && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Hero Current Weather Card */}
            <CurrentWeatherCard
              data={weatherData}
              unit={unit}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={toggleFavorite}
            />

            {/* 2. Atmospheric Visual Details Grid (Wind compass, humidity, UV gauge, sun arc) */}
            <WeatherDetailsGrid current={weatherData.current} todayDaily={weatherData.daily[0]} />

            {/* 3. Planning Recommendations Engine */}
            <PlanningRecommendations recommendations={weatherData.recommendations} />

            {/* 4. Outdoor Activity Index */}
            <ActivityScoresWidget activities={weatherData.activities} />

            {/* 5. Hourly Forecast Chart (Interactive Recharts curves) */}
            <HourlyForecastChart hourly={weatherData.hourly} unit={unit} />

            {/* 6. 7-Day Forecast Outlook */}
            <SevenDayForecast daily={weatherData.daily} unit={unit} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
          <CloudLightning className="w-4 h-4 text-sky-400" />
          <span>SkyIntel Weather Intelligence Dashboard</span>
        </div>
        <p>Powered by Open-Meteo Public Geocoding & High-Resolution Forecast APIs (No API keys required)</p>
        <p className="text-[11px] text-slate-600">Built with React, Vite & Tailwind CSS</p>
      </footer>
    </div>
  );
}
