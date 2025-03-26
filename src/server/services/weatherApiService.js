/**
 * Weather API Service
 * 
 * Handles interactions with the OpenWeather API to fetch current and forecast weather data
 */

const axios = require('axios');

// OpenWeather API configuration
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current weather data for a specific location
 * 
 * @param {Object} location - Location coordinates {lat, lng}
 * @returns {Promise<Object>} - Weather data
 */
const getCurrentWeather = async (location) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: API_KEY,
        units: 'metric', // Use metric units (Celsius, meters/sec)
      }
    });

    const data = response.data;
    
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      precipitation: data.rain ? data.rain['1h'] || 0 : 0, // mm of rain in last hour if available
      location: {
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lng: data.coord.lon
      },
      timestamp: new Date(data.dt * 1000)
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Failed to fetch current weather data');
  }
};

/**
 * Get hourly forecast data for a specific location
 * 
 * @param {Object} location - Location coordinates {lat, lng}
 * @param {number} hours - Number of hours to forecast (max 48)
 * @returns {Promise<Array>} - Array of hourly forecasts
 */
const getHourlyForecast = async (location, hours = 24) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: API_KEY,
        units: 'metric',
        cnt: Math.ceil(hours / 3) // OpenWeather provides 3-hour forecasts
      }
    });

    const data = response.data;
    const forecasts = [];
    
    // Process forecast data (3-hour intervals)
    for (let i = 0; i < Math.min(data.list.length, Math.ceil(hours / 3)); i++) {
      const forecast = data.list[i];
      
      forecasts.push({
        temperature: forecast.main.temp,
        feelsLike: forecast.main.feels_like,
        humidity: forecast.main.humidity,
        pressure: forecast.main.pressure,
        windSpeed: forecast.wind.speed,
        windDirection: forecast.wind.deg,
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        precipitation: forecast.rain ? forecast.rain['3h'] || 0 : 0, // mm of rain in 3 hours
        timestamp: new Date(forecast.dt * 1000)
      });
    }
    
    return forecasts;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw new Error('Failed to fetch forecast data');
  }
};

/**
 * Get severe weather alerts if available from OpenWeather API
 * 
 * @param {Object} location - Location coordinates {lat, lng}
 * @returns {Promise<Array>} - Array of alerts if any
 */
const getWeatherAlerts = async (location) => {
  try {
    // OpenWeather requires One Call API for alerts which is a paid feature
    const response = await axios.get(`${BASE_URL}/onecall`, {
      params: {
        lat: location.lat,
        lon: location.lng,
        appid: API_KEY,
        units: 'metric',
        exclude: 'minutely,hourly,daily' // Only get current and alerts
      }
    });

    const data = response.data;
    
    // Return alerts if available, or empty array
    return data.alerts || [];
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    // If it's a 401/403 error, it could be that the API key doesn't have One Call access
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('One Call API access may require a paid OpenWeather subscription');
    }
    
    // Return empty array instead of throwing error
    return [];
  }
};

module.exports = {
  getCurrentWeather,
  getHourlyForecast,
  getWeatherAlerts
}; 