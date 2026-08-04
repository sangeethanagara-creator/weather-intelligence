import React from 'react';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudHail,
  Snowflake,
  CloudLightning,
  Zap,
  Sparkles,
  Wind,
  Umbrella,
  ThermometerSun,
  ShieldAlert,
  Home,
  Shirt,
  Footprints,
  Bike,
  Utensils,
  Moon,
  Waves,
  Compass,
  Camera,
  Flower2,
  LucideProps,
} from 'lucide-react';
import { getWMOMeta } from '../utils/wmoCodes';

interface WeatherIconProps extends LucideProps {
  code?: number;
  iconName?: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, iconName, className = 'w-6 h-6', ...props }) => {
  let name = iconName;
  if (code !== undefined && !name) {
    name = getWMOMeta(code).iconName;
  }

  switch (name) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400 animate-pulse`} {...props} />;
    case 'SunMedium':
      return <SunMedium className={`${className} text-amber-400`} {...props} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-300`} {...props} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-300`} {...props} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-teal-300`} {...props} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-blue-300`} {...props} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-400`} {...props} />;
    case 'CloudRainWind':
      return <CloudRainWind className={`${className} text-indigo-400`} {...props} />;
    case 'CloudHail':
      return <CloudHail className={`${className} text-cyan-300`} {...props} />;
    case 'Snowflake':
      return <Snowflake className={`${className} text-sky-200 animate-spin-slow`} {...props} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-purple-400`} {...props} />;
    case 'Zap':
      return <Zap className={`${className} text-yellow-400`} {...props} />;
    case 'Sparkles':
      return <Sparkles className={`${className} text-emerald-400`} {...props} />;
    case 'Wind':
      return <Wind className={`${className} text-cyan-300`} {...props} />;
    case 'Umbrella':
      return <Umbrella className={`${className} text-rose-400`} {...props} />;
    case 'ThermometerSun':
      return <ThermometerSun className={`${className} text-orange-400`} {...props} />;
    case 'ShieldAlert':
      return <ShieldAlert className={`${className} text-amber-400`} {...props} />;
    case 'Home':
      return <Home className={`${className} text-indigo-300`} {...props} />;
    case 'Shirt':
      return <Shirt className={`${className} text-violet-300`} {...props} />;
    case 'Footprints':
      return <Footprints className={`${className} text-emerald-400`} {...props} />;
    case 'Bike':
      return <Bike className={`${className} text-sky-400`} {...props} />;
    case 'Utensils':
      return <Utensils className={`${className} text-amber-300`} {...props} />;
    case 'Moon':
      return <Moon className={`${className} text-indigo-300`} {...props} />;
    case 'Waves':
      return <Waves className={`${className} text-cyan-400`} {...props} />;
    case 'Compass':
      return <Compass className={`${className} text-violet-400`} {...props} />;
    case 'Camera':
      return <Camera className={`${className} text-pink-400`} {...props} />;
    case 'Flower2':
      return <Flower2 className={`${className} text-lime-400`} {...props} />;
    default:
      return <Cloud className={`${className} text-slate-300`} {...props} />;
  }
};
