interface SprayingCondition {
  status: 'Ideal' | 'Good' | 'Fair' | 'Poor' | 'Avoid';
  color: string;
  message: string;
}

interface WeatherParams {
  temperature: number;
  windSpeed: number;
  humidity: number;
  description: string;
}

export const determineSprayingCondition = (weather: WeatherParams): SprayingCondition => {
  // Check for rain conditions
  const hasRain = weather.description.toLowerCase().includes('rain') ||
                 weather.description.toLowerCase().includes('drizzle') ||
                 weather.description.toLowerCase().includes('thunderstorm');

  // Temperature ranges (in Celsius)
  const isTempIdeal = weather.temperature >= 10 && weather.temperature <= 25;
  const isTempGood = weather.temperature > 25 && weather.temperature <= 30;
  const isTempPoor = weather.temperature < 10 || weather.temperature > 30;

  // Wind speed ranges (in km/h)
  const isWindIdeal = weather.windSpeed >= 3 && weather.windSpeed <= 10;
  const isWindGood = weather.windSpeed > 10 && weather.windSpeed <= 15;
  const isWindPoor = weather.windSpeed > 15 || weather.windSpeed < 3;

  // Humidity ranges
  const isHumidityIdeal = weather.humidity >= 40 && weather.humidity <= 70;
  const isHumidityGood = (weather.humidity > 70 && weather.humidity <= 80) ||
                        (weather.humidity >= 30 && weather.humidity < 40);
  const isHumidityPoor = weather.humidity > 80 || weather.humidity < 30;

  // Determine overall condition
  if (hasRain) {
    return {
      status: 'Avoid',
      color: '#d32f2f',
      message: 'Spraying not recommended due to rain/wet conditions'
    };
  }

  if (isWindPoor && weather.windSpeed > 15) {
    return {
      status: 'Avoid',
      color: '#d32f2f',
      message: 'Wind speed too high, risk of spray drift'
    };
  }

  if (isTempIdeal && isWindIdeal && isHumidityIdeal) {
    return {
      status: 'Ideal',
      color: '#2e7d32',
      message: 'Perfect conditions for spraying'
    };
  }

  if ((isTempGood && isWindIdeal && isHumidityIdeal) ||
      (isTempIdeal && isWindGood && isHumidityIdeal) ||
      (isTempIdeal && isWindIdeal && isHumidityGood)) {
    return {
      status: 'Good',
      color: '#4caf50',
      message: 'Good conditions for spraying'
    };
  }

  if (isTempPoor || isWindPoor || isHumidityPoor) {
    return {
      status: 'Poor',
      color: '#f57c00',
      message: `Caution: ${
        isTempPoor ? 'Temperature outside ideal range. ' : ''
      }${
        isWindPoor ? 'Wind conditions not favorable. ' : ''
      }${
        isHumidityPoor ? 'Humidity levels not optimal.' : ''
      }`
    };
  }

  return {
    status: 'Fair',
    color: '#ffd700',
    message: 'Acceptable conditions, but monitor closely'
  };
}; 