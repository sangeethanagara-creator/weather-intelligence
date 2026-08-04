import { LocationResult, FullWeatherData, DailyForecastItem, HourlyForecastItem, CurrentWeather } from '../types/weather';
import { generateRecommendations, calculateActivityScores } from '../utils/recommendations';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchLocations(query: string): Promise<LocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding server error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country || '',
    country_code: item.country_code || '',
    admin1: item.admin1 || '',
    timezone: item.timezone || 'auto',
    elevation: item.elevation,
  }));
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationResult> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision || 'Current Location';
      return {
        id: Math.round(latitude * 1000 + longitude),
        name: cityName,
        latitude,
        longitude,
        country: data.countryName || '',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
      };
    }
  } catch (err) {
    console.warn('Reverse geocode fallback failed:', err);
  }

  return {
    id: Math.round(latitude * 1000 + longitude),
    name: 'Current Location',
    latitude,
    longitude,
    country: '',
    country_code: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
  };
}

export async function fetchWeatherData(location: LocationResult): Promise<FullWeatherData> {
  const { latitude, longitude, timezone } = location;

  const url = `${FORECAST_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index,relative_humidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset,wind_speed_10m_max&timezone=${encodeURIComponent(timezone || 'auto')}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: status ${response.status}`);
  }

  const data = await response.json();

  if (!data.current && !data.current_weather) {
    throw new Error('Incomplete weather data received from server.');
  }

  // Parse current weather
  const currentRaw = data.current || data.current_weather || {};
  const current: CurrentWeather = {
    temperature: currentRaw.temperature_2m ?? currentRaw.temperature ?? 0,
    apparentTemperature: currentRaw.apparent_temperature ?? currentRaw.temperature_2m ?? 0,
    weatherCode: currentRaw.weather_code ?? currentRaw.weathercode ?? 0,
    windSpeed: currentRaw.wind_speed_10m ?? currentRaw.windspeed ?? 0,
    windDirection: currentRaw.wind_direction_10m ?? currentRaw.winddirection ?? 0,
    relativeHumidity: currentRaw.relative_humidity_2m ?? 50,
    precipitation: currentRaw.precipitation ?? 0,
    isDay: currentRaw.is_day !== undefined ? Boolean(currentRaw.is_day) : true,
    pressure: currentRaw.pressure_msl ?? 1013,
    cloudCover: currentRaw.cloud_cover ?? 0,
    uvIndex: data.hourly?.uv_index?.[0] ?? 3,
    time: currentRaw.time || new Date().toISOString(),
  };

  // Parse Daily Forecast (7 Days)
  const dailyRaw = data.daily || {};
  const daily: DailyForecastItem[] = [];
  const times: string[] = dailyRaw.time || [];

  for (let i = 0; i < Math.min(times.length, 7); i++) {
    const dateStr = times[i];
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    daily.push({
      date: dateStr,
      dayName,
      weatherCode: dailyRaw.weathercode?.[i] ?? 0,
      tempMax: dailyRaw.temperature_2m_max?.[i] ?? 20,
      tempMin: dailyRaw.temperature_2m_min?.[i] ?? 10,
      apparentMax: dailyRaw.apparent_temperature_max?.[i] ?? 20,
      apparentMin: dailyRaw.apparent_temperature_min?.[i] ?? 10,
      precipitationSum: dailyRaw.precipitation_sum?.[i] ?? 0,
      precipitationProbabilityMax: dailyRaw.precipitation_probability_max?.[i] ?? 0,
      uvIndexMax: dailyRaw.uv_index_max?.[i] ?? 3,
      sunrise: dailyRaw.sunrise?.[i] ? dailyRaw.sunrise[i].split('T')[1] : '06:00',
      sunset: dailyRaw.sunset?.[i] ? dailyRaw.sunset[i].split('T')[1] : '18:00',
      windSpeedMax: dailyRaw.wind_speed_10m_max?.[i] ?? 10,
    });
  }

  // Parse Hourly Forecast (Next 24 Hours)
  const hourlyRaw = data.hourly || {};
  const hourly: HourlyForecastItem[] = [];
  const hourlyTimes: string[] = hourlyRaw.time || [];

  // Find index closest to current hour
  const now = new Date();
  let startIndex = 0;
  for (let i = 0; i < hourlyTimes.length; i++) {
    if (new Date(hourlyTimes[i]).getTime() >= now.getTime() - 3600000) {
      startIndex = i;
      break;
    }
  }

  for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
    const rawTime = hourlyTimes[i];
    const d = new Date(rawTime);
    const hourLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

    hourly.push({
      time: rawTime,
      hourLabel: i === startIndex ? 'Now' : hourLabel,
      temp: hourlyRaw.temperature_2m?.[i] ?? 18,
      apparentTemp: hourlyRaw.apparent_temperature?.[i] ?? 18,
      precipitationProbability: hourlyRaw.precipitation_probability?.[i] ?? 0,
      weatherCode: hourlyRaw.weather_code?.[i] ?? 0,
      windSpeed: hourlyRaw.wind_speed_10m?.[i] ?? 5,
      uvIndex: hourlyRaw.uv_index?.[i] ?? 0,
      humidity: hourlyRaw.relative_humidity_2m?.[i] ?? 50,
    });
  }

  // Update UV index for current weather if available from hourly[0]
  if (hourly.length > 0 && hourly[0].uvIndex !== undefined) {
    current.uvIndex = hourly[0].uvIndex;
  }

  const recommendations = generateRecommendations(current, daily, hourly);
  const activities = calculateActivityScores(current, daily);

  return {
    location,
    current,
    daily,
    hourly,
    recommendations,
    activities,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}
