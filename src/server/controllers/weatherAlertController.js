/**
 * Weather Alert Controller
 * 
 * This controller handles the logic for detecting weather conditions
 * that require alerts and sending SMS notifications to subscribed users.
 */

const twilio = require('twilio');
const weatherApiService = require('../services/weatherApiService');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Check location for weather alerts and notify users if needed
 * 
 * @param {Object} location - Location coordinates {lat, lng}
 * @returns {Promise<Object>} - Result of alert processing
 */
const checkLocationForAlerts = async (location) => {
  try {
    // Get current weather and forecast data
    const [currentWeather, forecast, apiAlerts] = await Promise.all([
      weatherApiService.getCurrentWeather(location),
      weatherApiService.getHourlyForecast(location, 24), // Get 24-hour forecast
      weatherApiService.getWeatherAlerts(location)
    ]);

    // Combine current weather with precipitation forecast
    const weatherData = {
      ...currentWeather,
      // Calculate max precipitation for next 24 hours from forecast
      forecastMaxPrecipitation: Math.max(0, ...forecast.map(f => f.precipitation || 0)),
      // Calculate max wind speed for next 24 hours from forecast
      forecastMaxWindSpeed: Math.max(0, ...forecast.map(f => f.windSpeed || 0)),
      // Calculate min temperature for next 24 hours from forecast (for frost alerts)
      forecastMinTemperature: Math.min(...forecast.map(f => f.temperature || 100))
    };

    // Process alerts based on weather data
    const result = await processWeatherAlerts(weatherData, location);

    // Also process any alerts directly from the OpenWeather API
    if (apiAlerts && apiAlerts.length > 0) {
      const apiAlertResults = await processApiAlerts(apiAlerts, location);
      
      // Combine results
      return {
        ...result,
        apiAlertsProcessed: apiAlertResults.alertsSent,
        totalAlertsSent: (result.alertsSent || 0) + (apiAlertResults.alertsSent || 0)
      };
    }

    return result;
  } catch (error) {
    console.error('Error checking location for alerts:', error);
    return {
      error: error.message,
      alertsDetected: false
    };
  }
};

/**
 * Process alerts received directly from the OpenWeather API
 * 
 * @param {Array} alerts - Alerts from OpenWeather API
 * @param {Object} location - Location coordinates {lat, lng}
 * @returns {Promise<Object>} - Result of alert processing
 */
const processApiAlerts = async (alerts, location) => {
  try {
    if (!alerts || alerts.length === 0) {
      return { alertsDetected: false };
    }

    // Create a radius around the location (approximately 10km)
    const locationRadius = {
      lat: location.lat,
      lng: location.lng,
      radius: 0.1 // Approximately 10km in latitude/longitude units
    };

    // Format and send each alert
    const alertPromises = alerts.map(alert => {
      return fetch('http://localhost:3001/api/sms/send-weather-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationRadius,
          alertType: alert.event || 'Weather Alert',
          message: alert.description || 'Weather alert issued by meteorological service.'
        })
      }).then(res => res.json());
    });

    const results = await Promise.all(alertPromises);
    
    return {
      alertsDetected: true,
      alertsSent: results.reduce((acc, result) => {
        return acc + (result.notificationsSent || 0);
      }, 0),
      alerts: alerts.map(alert => ({
        type: alert.event,
        message: alert.description
      }))
    };
  } catch (error) {
    console.error('Error processing API alerts:', error);
    return {
      alertsDetected: false,
      error: error.message
    };
  }
};

/**
 * Process weather data and send alerts if conditions are concerning
 * 
 * @param {Object} weatherData - Weather data to process
 * @param {Object} location - Location coordinates {lat, lng}
 * @returns {Promise<Object>} - Result of alert processing
 */
const processWeatherAlerts = async (weatherData, location) => {
  try {
    // Define alert thresholds
    const ALERT_THRESHOLDS = {
      // Heavy rain conditions - current or forecast precipitation
      HEAVY_RAIN: {
        condition: weatherData.precipitation > 20 || weatherData.forecastMaxPrecipitation > 20, // mm of rain
        message: 'Heavy rain forecasted. Consider protecting delicate crops and ensuring proper drainage.',
        type: 'Heavy Rain Alert'
      },
      // High wind conditions - current or forecast wind speed
      HIGH_WIND: {
        condition: weatherData.windSpeed > 30 || weatherData.forecastMaxWindSpeed > 30, // km/h
        message: 'High winds forecasted. Secure loose items, protect young plants, and consider delaying spraying activities.',
        type: 'High Wind Alert'
      },
      // Frost conditions - either current or forecast minimum temperature
      FROST: {
        condition: weatherData.temperature < 2 || weatherData.forecastMinTemperature < 2, // Celsius
        message: 'Frost conditions forecasted. Protect sensitive crops with covers or other frost protection methods.',
        type: 'Frost Alert'
      },
      // Heat wave conditions
      HEAT_WAVE: {
        condition: weatherData.temperature > 35, // Celsius
        message: 'Heat wave conditions forecasted. Ensure adequate irrigation, consider adding shade for sensitive crops, and watch for heat stress.',
        type: 'Heat Wave Alert'
      },
      // Drought conditions (low humidity + high temp + no rain)
      DROUGHT: {
        condition: weatherData.humidity < 30 && weatherData.temperature > 28 && weatherData.precipitation < 1 && weatherData.forecastMaxPrecipitation < 5,
        message: 'Drought conditions developing. Consider implementing water conservation measures and prioritize irrigation.',
        type: 'Drought Alert'
      }
    };

    // Check for alert conditions
    const activeAlerts = [];
    
    Object.entries(ALERT_THRESHOLDS).forEach(([key, alert]) => {
      if (alert.condition) {
        activeAlerts.push({
          type: alert.type,
          message: alert.message
        });
      }
    });

    if (activeAlerts.length === 0) {
      return { alertsDetected: false };
    }

    // Create a radius around the location (approximately 10km)
    const locationRadius = {
      lat: location.lat,
      lng: location.lng,
      radius: 0.1 // Approximately 10km in latitude/longitude units
    };

    // Send alerts for each detected condition
    const alertPromises = activeAlerts.map(alert => {
      return fetch('http://localhost:3001/api/sms/send-weather-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationRadius,
          alertType: alert.type,
          message: alert.message
        })
      }).then(res => res.json());
    });

    const results = await Promise.all(alertPromises);
    
    return {
      alertsDetected: true,
      alertsSent: results.reduce((acc, result) => {
        return acc + (result.notificationsSent || 0);
      }, 0),
      alerts: activeAlerts
    };
  } catch (error) {
    console.error('Error processing weather alerts:', error);
    return {
      alertsDetected: false,
      error: error.message
    };
  }
};

module.exports = {
  processWeatherAlerts,
  checkLocationForAlerts,
  processApiAlerts
}; 