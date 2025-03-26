import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Typography, Box, CircularProgress, Chip } from '@mui/material';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThermostatIcon from '@mui/icons-material/Thermostat';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  weatherType: string;
  humidity: number;
}

const StyledCard = styled(Card)`
  padding: 2rem;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #e6f0ff 0%, #d4e7ff 100%);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: #1E88E5;
  }
`;

const WeatherTypeChip = styled(Chip)`
  && {
    position: absolute;
    top: 15px;
    right: 15px;
    font-weight: 500;
    background: rgba(30, 136, 229, 0.15);
    color: #1E88E5;
    border-radius: 12px;
  }
`;

const TemperatureDisplay = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
`;

const TemperatureValue = styled(Typography)`
  && {
    font-size: 4.5rem;
    font-weight: 300;
    color: #333;
    line-height: 1;
    position: relative;
    margin-left: 1rem;
    
    &::after {
      content: '°C';
      position: absolute;
      top: 8px;
      right: -30px;
      font-size: 1.5rem;
      font-weight: 500;
      color: #1E88E5;
    }
  }
`;

const InfoContainer = styled(Box)`
  display: flex;
  justify-content: space-around;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const InfoItem = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  & svg {
    color: #1E88E5;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
`;

const TemperatureIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(30, 136, 229, 0.1);
  margin: 0 auto 1rem;
  
  & svg {
    font-size: 35px;
    color: #1E88E5;
  }
`;

const WeatherCard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // TODO: Replace with actual weather API call
      // This is mock data for now
      setWeatherData({
        temperature: 28,
        windSpeed: 12,
        weatherType: 'Sunny',
        humidity: 65
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getWeatherIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <WbSunnyIcon fontSize="large" />;
      default:
        return <CloudIcon fontSize="large" />;
    }
  };

  if (loading) {
    return (
      <StyledCard>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress color="primary" />
        </Box>
      </StyledCard>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <StyledCard>
      <WeatherTypeChip 
        icon={getWeatherIcon(weatherData.weatherType)} 
        label={weatherData.weatherType} 
      />
      
      <Typography variant="h5" fontWeight="bold" mt={1} align="center">
        Weather
      </Typography>
      
      <TemperatureDisplay>
        <TemperatureIcon>
          <ThermostatIcon style={{ fontSize: 35 }} />
        </TemperatureIcon>
        <TemperatureValue>
          {weatherData.temperature}
        </TemperatureValue>
      </TemperatureDisplay>
      
      <InfoContainer>
        <InfoItem>
          <AirIcon />
          <Typography variant="body1" fontWeight="500">
            {weatherData.windSpeed} km/h
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Wind
          </Typography>
        </InfoItem>
        
        <InfoItem>
          <WaterDropIcon />
          <Typography variant="body1" fontWeight="500">
            {weatherData.humidity}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Humidity
          </Typography>
        </InfoItem>
      </InfoContainer>
    </StyledCard>
  );
};

export default WeatherCard; 