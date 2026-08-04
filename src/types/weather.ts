export interface LocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  timezone: string;
  elevation?: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  relativeHumidity: number;
  precipitation: number;
  isDay: boolean;
  pressure: number;
  cloudCover: number;
  uvIndex: number;
  time: string;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentMax: number;
  apparentMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
}

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  temp: number;
  apparentTemp: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
  humidity: number;
}

export type RecommendationSeverity = 'info' | 'warning' | 'alert' | 'success';
export type RecommendationCategory = 'clothing' | 'activity' | 'alert' | 'health' | 'travel';

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  iconName: string;
  severity: RecommendationSeverity;
}

export interface ActivityScore {
  id: string;
  name: string;
  iconName: string;
  score: number; // 0 to 100
  suitability: 'Ideal' | 'Good' | 'Moderate' | 'Poor' | 'Not Recommended';
  reason: string;
}

export interface FullWeatherData {
  location: LocationResult;
  current: CurrentWeather;
  daily: DailyForecastItem[];
  hourly: HourlyForecastItem[];
  recommendations: Recommendation[];
  activities: ActivityScore[];
  lastUpdated: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
