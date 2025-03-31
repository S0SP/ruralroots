import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import WeatherCard from '../components/Services/WeatherCard';
import SprayingCard from '../components/Services/SprayingCard';
import ProcessFlow from '../components/Services/ProcessFlow';
import ShopCard from '../components/Services/ShopCard';
import TrainingSection from '../components/Services/TrainingSection';
import NearbyPlacesCard from '../components/Services/NearbyPlacesCard';
import SmsAlertCard from '../components/Services/SmsAlertCard';
import { Container, Typography, Grid, Box, Card, CardContent, CircularProgress } from '@mui/material';
import { WbSunny, Opacity, Air } from '@mui/icons-material';
import { getWeatherData } from '../services/weatherService';

const PageContainer = styled(Container)`
  && {
    padding-top: 95px;
    padding-bottom: 4rem;
  }
`;

const SectionTitle = styled(Typography)`
  && {
    font-size: 2rem;
    color: #333;
    margin-bottom: 2rem;
    font-weight: 600;
    position: relative;
    padding-bottom: 0.5rem;

    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background-color: #577a34;
      border-radius: 2px;
    }
  }
`;

const CardGrid = styled(Grid)`
  && {
    margin-bottom: 4rem;
  }
`;

const CardContainer = styled(Grid)`
  && {
    height: 40vh;
    min-height: 280px;
    max-height: 400px;
  }
`;

const Section = styled(Box)`
  && {
    margin-bottom: 4rem;
  }
`;

const ShopContainer = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding: 1rem 0;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #577a34;
    border-radius: 4px;
    
    &:hover {
      background: #465f2a;
    }
  }

  @media (max-width: 768px) {
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    const fetchWeatherData = async () => {
      try {
        const data = await getWeatherData();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load weather data');
        console.error('Error fetching weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <>
      <Header />
      <PageContainer maxWidth="lg">
        {/* Weather and Spraying Cards Section */}
        <Section>
          <SectionTitle variant="h2">Weather & Spraying</SectionTitle>
          <CardGrid container spacing={3}>
            <CardContainer item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  bgcolor: '#ffffff',
                  color: '#333333',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: '#1a237e',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold" color="#333">
                    Weather Forecast
                  </Typography>

                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Typography color="error">{error}</Typography>
                  ) : weatherData && (
                    <Box>
                      <Box display="flex" alignItems="center" mb={3}>
                        <img 
                          src={`http://openweathermap.org/img/w/${weatherData.icon}.png`}
                          alt="Weather icon"
                          style={{ width: 50, height: 50, marginRight: 16 }}
                        />
                        <Typography variant="h3" component="span" fontWeight="bold" color="#333">
                          {weatherData.temperature}°C
                        </Typography>
                      </Box>

                      <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize', color: '#666' }}>
                        {weatherData.description}
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Opacity sx={{ mr: 1, color: '#1a237e' }} />
                            <Typography color="#666">
                              Humidity: {weatherData.humidity}%
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center">
                            <Air sx={{ mr: 1, color: '#1a237e' }} />
                            <Typography color="#666">
                              Wind: {weatherData.windSpeed} km/h
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </CardContainer>
            <CardContainer item xs={12} md={6}>
              <SprayingCard />
            </CardContainer>
          </CardGrid>
          
          {/* SMS Alert Card */}
          <CardGrid container spacing={3}>
            <Grid item xs={12}>
              <SmsAlertCard userLocation={userLocation} />
            </Grid>
          </CardGrid>
        </Section>

        {/* Disease Detection Process Section */}
        <Section>
          <SectionTitle variant="h2">Disease Detection System</SectionTitle>
          <ProcessFlow />
        </Section>

        {/* Nearby Places Section */}
        <Section>
          <SectionTitle variant="h2">Nearby Agriculture Shops & Training Centers</SectionTitle>
          <CardGrid container spacing={3}>
            <Grid item xs={12}>
              <NearbyPlacesCard />
            </Grid>
          </CardGrid>
        </Section>

        
  
      </PageContainer>
    </>
  );
};

export default Services; 