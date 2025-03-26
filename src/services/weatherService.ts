interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface ForecastData extends WeatherData {
  time: string;
}

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherData = async (city: string = 'Delhi'): Promise<WeatherData> => {
  try {
    if (!API_KEY) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const getForecastData = async (city: string = 'Delhi'): Promise<ForecastData[]> => {
  try {
    if (!API_KEY) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    const response = await fetch(
      `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const data = await response.json();
    
    // Get next 6 hours of forecast data
    const hourlyData = data.list.slice(0, 2).reduce((acc: any[], item: any) => {
      // Each item represents 3 hours, so we'll interpolate to get hourly data
      const baseTemp = item.main.temp;
      const baseHumidity = item.main.humidity;
      const baseWindSpeed = item.wind.speed;
      const baseTime = item.dt;

      // Create 3 hourly points between each 3-hour forecast
      for (let i = 0; i < 3; i++) {
        if (acc.length < 6) { // Only take first 6 hours
          acc.push({
            temperature: Math.round(baseTemp),
            humidity: Math.round(baseHumidity),
            windSpeed: Math.round(baseWindSpeed * 3.6),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            time: new Date((baseTime + (i * 3600)) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
      return acc;
    }, []);

    return hourlyData;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
}; 