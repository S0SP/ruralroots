import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';

const CardsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 70%;
  margin: 2rem auto;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 90%;
  }
`;

const Card = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  min-height: 25vh;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const LocationName = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const DateDisplay = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const WeatherCondition = styled.p`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const WeatherDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const Temperature = styled.span`
  font-size: 1.8rem;
  font-weight: 700;
`;

const RainProbability = styled.span`
  font-size: 1rem;
  color: #4a90e2;
`;

const SprayingStatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const SprayingStatus = styled.div<{ status: 'favorable' | 'unfavorable' | 'moderate' }>`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${props => 
    props.status === 'favorable' ? '#4caf50' : 
    props.status === 'unfavorable' ? '#f44336' : '#ff9800'};
`;

const HourlyForecastContainer = styled.div`
  margin-top: 1.5rem;
  display: ${props => props.className === 'visible' ? 'block' : 'none'};
`;

const HourlyForecastTitle = styled.h4`
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const HourlyForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const HourlyForecastItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #f5f5f5;
`;

const HourTime = styled.p`
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
`;

const WeatherCards: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sprayingStatus, setSprayingStatus] = useState<'favorable' | 'unfavorable' | 'moderate'>('moderate');
  const [showHourlyForecast, setShowHourlyForecast] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Replace with actual coordinates for your area
        const lat = '28.6139';
        const lon = '77.2090';
        const apiKey = 'c2d1ebfac3b64219ba740601bcbd0eef';
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`
        );
        
        setWeatherData(response.data);
        
        // Calculate spraying conditions based on humidity and temperature
        const currentTemp = response.data.current.temp;
        const currentHumidity = response.data.current.humidity;
        const delta = Math.abs(currentTemp - currentHumidity / 2);
        
        if (delta >= 2 && delta <= 8) {
          setSprayingStatus('favorable');
        } else if (delta > 8 && delta <= 10) {
          setSprayingStatus('moderate');
        } else {
          setSprayingStatus('unfavorable');
        }
      } catch (err) {
        setError('Failed to fetch weather data. Please try again later.');
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, []);
  
  // Format date
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  // Calculate hourly spraying conditions
  const calculateHourlySpraying = (hour: any) => {
    const temp = hour.temp;
    const humidity = hour.humidity;
    const delta = Math.abs(temp - humidity / 2);
    
    if (delta >= 2 && delta <= 8) {
      return 'favorable';
    } else if ((delta > 0 && delta < 2) || (delta > 8 && delta <= 10)) {
      return 'moderate';
    } else {
      return 'unfavorable';
    }
  };
  
  // Format hour
  const formatHour = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
  };
  
  return (
    <CardsContainer>
      <Card>
        <CardTitle>Weather Data</CardTitle>
        {loading ? (
          <p>Loading weather data...</p>
        ) : error ? (
          <p>{error}</p>
        ) : weatherData ? (
          <>
            <LocationName>Delhi, India</LocationName>
            <DateDisplay>{formatDate()}</DateDisplay>
            <WeatherCondition>{weatherData.current.weather[0].main}</WeatherCondition>
            <WeatherDetails>
              <Temperature>{Math.round(weatherData.current.temp)}°C</Temperature>
              <RainProbability>
                Rain: {Math.round(weatherData.hourly[0].pop * 100)}%
              </RainProbability>
            </WeatherDetails>
          </>
        ) : null}
      </Card>
      
      <Card onClick={() => setShowHourlyForecast(!showHourlyForecast)} style={{ cursor: 'pointer' }}>
        <CardTitle>Spraying Conditions</CardTitle>
        {loading ? (
          <p>Loading spraying conditions...</p>
        ) : error ? (
          <p>{error}</p>
        ) : weatherData ? (
          <>
            <SprayingStatusContainer>
              {sprayingStatus === 'favorable' && (
                <>
                  <CheckCircleIcon style={{ color: '#4caf50', fontSize: '2rem' }} />
                  <SprayingStatus status={sprayingStatus}>Favorable</SprayingStatus>
                </>
              )}
              {sprayingStatus === 'moderate' && (
                <>
                  <WarningIcon style={{ color: '#ff9800', fontSize: '2rem' }} />
                  <SprayingStatus status={sprayingStatus}>Moderate</SprayingStatus>
                </>
              )}
              {sprayingStatus === 'unfavorable' && (
                <>
                  <CancelIcon style={{ color: '#f44336', fontSize: '2rem' }} />
                  <SprayingStatus status={sprayingStatus}>Unfavorable</SprayingStatus>
                </>
              )}
            </SprayingStatusContainer>
            
            <HourlyForecastContainer className={showHourlyForecast ? 'visible' : ''}>
              <HourlyForecastTitle>Hourly Forecast</HourlyForecastTitle>
              <HourlyForecastGrid>
                {weatherData.hourly.slice(0, 7).map((hour: any, index: number) => {
                  const condition = calculateHourlySpraying(hour);
                  return (
                    <HourlyForecastItem key={index}>
                      <HourTime>{formatHour(hour.dt)}</HourTime>
                      {condition === 'favorable' && (
                        <CheckCircleIcon style={{ color: '#4caf50', fontSize: '1.5rem' }} />
                      )}
                      {condition === 'moderate' && (
                        <WarningIcon style={{ color: '#ff9800', fontSize: '1.5rem' }} />
                      )}
                      {condition === 'unfavorable' && (
                        <CancelIcon style={{ color: '#f44336', fontSize: '1.5rem' }} />
                      )}
                    </HourlyForecastItem>
                  );
                })}
              </HourlyForecastGrid>
            </HourlyForecastContainer>
          </>
        ) : null}
      </Card>
    </CardsContainer>
  );
};

export default WeatherCards; 