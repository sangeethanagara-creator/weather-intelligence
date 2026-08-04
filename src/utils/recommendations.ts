import { CurrentWeather, DailyForecastItem, HourlyForecastItem, Recommendation, ActivityScore } from '../types/weather';
import { getWMOMeta } from './wmoCodes';

export function generateRecommendations(
  current: CurrentWeather,
  daily: DailyForecastItem[],
  hourly: HourlyForecastItem[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const temp = current.temperature;
  const apparentTemp = current.apparentTemperature;
  const wind = current.windSpeed;
  const rainProb = daily[0]?.precipitationProbabilityMax || current.precipitation;
  const uv = current.uvIndex;
  const weatherMeta = getWMOMeta(current.weatherCode);

  // 1. Clothing & Gear Recommendations
  if (temp < 5) {
    recommendations.push({
      id: 'gear-heavy-coat',
      category: 'clothing',
      title: 'Heavy Winter Apparel Required',
      description: `Freezing temps (${Math.round(temp)}°C, feels like ${Math.round(apparentTemp)}°C). Wear thermal base layers, a heavy insulated coat, gloves, and a beanie.`,
      iconName: 'Shirt',
      severity: 'warning',
    });
  } else if (temp < 15) {
    recommendations.push({
      id: 'gear-layers',
      category: 'clothing',
      title: 'Light Jackets & Layers Suggested',
      description: `Crisp weather at ${Math.round(temp)}°C. A sweater, windbreaker, or light coat is ideal for comfortable warmth throughout the day.`,
      iconName: 'Shirt',
      severity: 'info',
    });
  } else if (temp > 28) {
    recommendations.push({
      id: 'gear-breathable',
      category: 'clothing',
      title: 'Breathable, Lightweight Clothing',
      description: `Warm conditions (${Math.round(temp)}°C). Wear light linen or cotton attire and stay well ventilated.`,
      iconName: 'Sun',
      severity: 'info',
    });
  }

  // Umbrella / Rain Advice
  if (rainProb > 50 || current.precipitation > 0.5 || weatherMeta.category === 'rain' || weatherMeta.category === 'drizzle') {
    recommendations.push({
      id: 'umbrella-alert',
      category: 'clothing',
      title: 'Carry an Umbrella & Waterproof Footwear',
      description: `High precipitation likelihood (${Math.round(rainProb)}% rain chance). Keep compact rain gear or a raincoat nearby.`,
      iconName: 'Umbrella',
      severity: 'alert',
    });
  } else if (rainProb > 25) {
    recommendations.push({
      id: 'umbrella-standby',
      category: 'clothing',
      title: 'Keep Rain Gear Handy',
      description: `Moderate precipitation chance (${Math.round(rainProb)}%). An umbrella in your bag is recommended for unexpected drizzles.`,
      iconName: 'CloudRain',
      severity: 'info',
    });
  } else {
    recommendations.push({
      id: 'umbrella-not-needed',
      category: 'clothing',
      title: 'No Umbrella Needed',
      description: `Low precipitation chance (${Math.round(rainProb)}%). Enjoy clear, rain-free conditions!`,
      iconName: 'Sun',
      severity: 'success',
    });
  }

  // 2. Health & Sun Care
  if (uv >= 6) {
    recommendations.push({
      id: 'health-uv-high',
      category: 'health',
      title: `High UV Index (${uv.toFixed(1)}) Alert`,
      description: 'Strong ultraviolet radiation. Apply SPF 30+ sunscreen every 2 hours, wear UV-blocking sunglasses, and seek shade during midday.',
      iconName: 'ShieldAlert',
      severity: 'warning',
    });
  } else if (uv >= 3) {
    recommendations.push({
      id: 'health-uv-moderate',
      category: 'health',
      title: `Moderate UV Exposure (${uv.toFixed(1)})`,
      description: 'Sun protection is advised if outdoors for more than 30 minutes during peak afternoon hours.',
      iconName: 'Sun',
      severity: 'info',
    });
  }

  // Hydration & Heat Warning
  if (temp > 32 || apparentTemp > 35) {
    recommendations.push({
      id: 'health-heat-alert',
      category: 'health',
      title: 'Extreme Heat & Hydration Advisory',
      description: `Heat index feels like ${Math.round(apparentTemp)}°C. Drink plenty of water and electrolytes, limit strenuous outdoors, and stay in air-conditioned spaces.`,
      iconName: 'ThermometerSun',
      severity: 'alert',
    });
  }

  // 3. Wind & Travel Alerts
  if (wind > 35) {
    recommendations.push({
      id: 'alert-high-wind',
      category: 'alert',
      title: `Breezy/High Wind Gusts (${Math.round(wind)} km/h)`,
      description: 'Strong wind gusts detected. Secure loose outdoor furniture, take care when opening doors, and avoid umbrella usage.',
      iconName: 'Wind',
      severity: 'warning',
    });
  }

  // Severe Thunderstorm or Snow Alerts
  if (weatherMeta.category === 'thunderstorm') {
    recommendations.push({
      id: 'alert-thunderstorm',
      category: 'alert',
      title: 'Thunderstorm & Lightning Warning',
      description: 'Active electrical storm in the region. Stay indoors away from windows and avoid elevated open terrain.',
      iconName: 'Zap',
      severity: 'alert',
    });
  } else if (weatherMeta.category === 'snow') {
    recommendations.push({
      id: 'alert-snow-ice',
      category: 'alert',
      title: 'Snow & Icy Road Advisory',
      description: 'Snow accumulation on roads and sidewalks. Drive with extra caution, check tire traction, and walk carefully.',
      iconName: 'Snowflake',
      severity: 'warning',
    });
  }

  // 4. Activity & Outdoor Recommendations
  if (temp >= 18 && temp <= 26 && wind < 20 && rainProb < 20 && current.cloudCover < 60) {
    recommendations.push({
      id: 'activity-optimal',
      category: 'activity',
      title: 'Ideal Weather for Outdoor Recreation',
      description: 'Pristine atmospheric conditions for hiking, outdoor dining, sports, jogging, and scenic photography.',
      iconName: 'Sparkles',
      severity: 'success',
    });
  } else if (rainProb > 60 || weatherMeta.category === 'rain' || temp < 0) {
    recommendations.push({
      id: 'activity-indoor',
      category: 'activity',
      title: 'Indoor Activities Recommended',
      description: 'Unfavorable outdoor weather. Perfect time for indoor museum visits, cozy reading, gym workouts, or cafes.',
      iconName: 'Home',
      severity: 'info',
    });
  }

  return recommendations;
}

export function calculateActivityScores(
  current: CurrentWeather,
  daily: DailyForecastItem[]
): ActivityScore[] {
  const temp = current.temperature;
  const wind = current.windSpeed;
  const rainProb = daily[0]?.precipitationProbabilityMax || 0;
  const clouds = current.cloudCover;
  const uv = current.uvIndex;
  const isNight = !current.isDay;

  // Running
  let runningScore = 100;
  if (temp < 5) runningScore -= 20;
  else if (temp < 12) runningScore -= 5;
  else if (temp > 24) runningScore -= 25;
  else if (temp > 32) runningScore -= 50;

  if (rainProb > 40) runningScore -= 30;
  if (rainProb > 70) runningScore -= 40;
  if (wind > 25) runningScore -= 20;
  runningScore = Math.max(10, Math.min(100, Math.round(runningScore)));

  // Cycling
  let cyclingScore = 100;
  if (wind > 20) cyclingScore -= (wind - 20) * 2.5;
  if (rainProb > 30) cyclingScore -= 35;
  if (temp < 8) cyclingScore -= 25;
  if (temp > 30) cyclingScore -= 30;
  cyclingScore = Math.max(5, Math.min(100, Math.round(cyclingScore)));

  // Outdoor Dining
  let diningScore = 100;
  if (temp < 16) diningScore -= (16 - temp) * 6;
  if (temp > 28) diningScore -= (temp - 28) * 5;
  if (rainProb > 20) diningScore -= rainProb * 0.8;
  if (wind > 18) diningScore -= 30;
  diningScore = Math.max(0, Math.min(100, Math.round(diningScore)));

  // Stargazing
  let stargazingScore = 100;
  if (!isNight) {
    stargazingScore = 20; // Daylight
  } else {
    if (clouds > 20) stargazingScore -= clouds * 0.8;
    if (rainProb > 20) stargazingScore -= 40;
  }
  stargazingScore = Math.max(0, Math.min(100, Math.round(stargazingScore)));

  // Photography
  let photoScore = 100;
  if (clouds > 85) photoScore -= 25;
  if (rainProb > 60) photoScore -= 35;
  if (temp < 0 || temp > 35) photoScore -= 20;
  photoScore = Math.max(15, Math.min(100, Math.round(photoScore)));

  // Beach / Pool
  let beachScore = 100;
  if (isNight) beachScore = 10;
  else {
    if (temp < 22) beachScore -= (22 - temp) * 7;
    if (clouds > 40) beachScore -= (clouds - 40) * 0.8;
    if (rainProb > 20) beachScore -= 40;
    if (wind > 25) beachScore -= 20;
  }
  beachScore = Math.max(0, Math.min(100, Math.round(beachScore)));

  // Flying Drone
  let droneScore = 100;
  if (wind > 20) droneScore -= (wind - 15) * 3.5;
  if (rainProb > 20) droneScore -= 50;
  if (clouds > 90) droneScore -= 20;
  droneScore = Math.max(0, Math.min(100, Math.round(droneScore)));

  // Gardening
  let gardenScore = 100;
  if (temp < 8) gardenScore -= 30;
  if (temp > 30) gardenScore -= 30;
  if (rainProb > 70) gardenScore -= 40;
  if (wind > 30) gardenScore -= 25;
  gardenScore = Math.max(10, Math.min(100, Math.round(gardenScore)));

  const getSuitability = (score: number): 'Ideal' | 'Good' | 'Moderate' | 'Poor' | 'Not Recommended' => {
    if (score >= 85) return 'Ideal';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Moderate';
    if (score >= 25) return 'Poor';
    return 'Not Recommended';
  };

  return [
    {
      id: 'act-running',
      name: 'Running & Jogging',
      iconName: 'Footprints',
      score: runningScore,
      suitability: getSuitability(runningScore),
      reason: runningScore > 75 ? 'Optimal temps and low wind.' : rainProb > 40 ? 'Risk of slippery wet tracks.' : 'Temperature or wind slightly non-ideal.',
    },
    {
      id: 'act-cycling',
      name: 'Outdoor Cycling',
      iconName: 'Bike',
      score: cyclingScore,
      suitability: getSuitability(cyclingScore),
      reason: wind > 25 ? 'High drag from head/cross winds.' : cyclingScore > 75 ? 'Smooth riding conditions.' : 'Caution with road slickness.',
    },
    {
      id: 'act-dining',
      name: 'Patio & Outdoor Dining',
      iconName: 'Utensils',
      score: diningScore,
      suitability: getSuitability(diningScore),
      reason: diningScore > 75 ? 'Comfortable patio climate.' : temp < 16 ? 'Chilly for outdoor seated dining.' : 'Risk of rain interrupting meal.',
    },
    {
      id: 'act-stargazing',
      name: 'Night Stargazing',
      iconName: 'Moon',
      score: stargazingScore,
      suitability: getSuitability(stargazingScore),
      reason: !isNight ? 'Requires darkness after sunset.' : clouds < 25 ? 'Crisp clear dark skies.' : 'Cloud cover obscuring stars.',
    },
    {
      id: 'act-beach',
      name: 'Beach & Swimming',
      iconName: 'Waves',
      score: beachScore,
      suitability: getSuitability(beachScore),
      reason: temp >= 25 && clouds < 40 ? 'Warm sun and great beach vibes.' : 'Requires warmer sun and clear skies.',
    },
    {
      id: 'act-drone',
      name: 'Drone Flying',
      iconName: 'Compass',
      score: droneScore,
      suitability: getSuitability(droneScore),
      reason: wind > 20 ? 'Wind speeds exceed safe flight margins.' : 'Stable air for smooth aerial video.',
    },
    {
      id: 'act-photography',
      name: 'Outdoor Photography',
      iconName: 'Camera',
      score: photoScore,
      suitability: getSuitability(photoScore),
      reason: photoScore > 75 ? 'Great natural lighting and atmospheric dynamics.' : 'Flat lighting or high precipitation.',
    },
    {
      id: 'act-gardening',
      name: 'Gardening & Yard Work',
      iconName: 'Flower2',
      score: gardenScore,
      suitability: getSuitability(gardenScore),
      reason: gardenScore > 75 ? 'Pleasant soil and plant working environment.' : 'Extreme temps or heavy rain.',
    },
  ];
}
