import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import { Info, Close, CheckCircle, Warning, Cancel } from '@mui/icons-material';
import { getWeatherData, getForecastData } from '../../services/weatherService';
import { determineSprayingCondition } from '../../utils/sprayingConditions';

interface ForecastData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  time: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Ideal':
    case 'Good':
      return <CheckCircle sx={{ color: '#4CAF50', fontSize: 32 }} />;
    case 'Fair':
    case 'Poor':
      return <Warning sx={{ color: '#FF9800', fontSize: 32 }} />;
    case 'Avoid':
      return <Cancel sx={{ color: '#F44336', fontSize: 32 }} />;
    default:
      return null;
  }
};

const SprayingCard: React.FC = () => {
  const [currentCondition, setCurrentCondition] = useState<any>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weather, forecast] = await Promise.all([
          getWeatherData(),
          getForecastData()
        ]);
        
        const condition = determineSprayingCondition(weather);
        setCurrentCondition(condition);
        setForecastData(forecast);
        setError(null);
      } catch (err) {
        setError('Failed to load spraying conditions');
        console.error('Error fetching spraying conditions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          bgcolor: '#ffffff',
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" color="#333">
              Spraying Conditions
            </Typography>
            <IconButton onClick={handleOpenDialog} size="small">
              <Info />
            </IconButton>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : currentCondition && (
            <Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: `${currentCondition.color}15`
                }}
              >
                {getStatusIcon(currentCondition.status)}
                <Typography 
                  variant="h4" 
                  component="span" 
                  fontWeight="bold"
                  sx={{ color: currentCondition.color, mt: 1 }}
                >
                  {currentCondition.status}
                </Typography>
              </Box>

              <Typography variant="body1" color="#666" gutterBottom align="center">
                {currentCondition.message}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Spraying Guide & Forecast</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={4}>
            <Typography variant="h6" gutterBottom color="#333" fontWeight="bold">
              Perfect Spraying Conditions Guide
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <CheckCircle sx={{ color: '#4CAF50', fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Ideal Conditions
                  </Typography>
                  <Typography variant="body2" color="#666">
                    Temperature: 10-25°C<br />
                    Wind: 3-10 km/h<br />
                    Humidity: 40-70%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Warning sx={{ color: '#FF9800', fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Moderate Conditions
                  </Typography>
                  <Typography variant="body2" color="#666">
                    Temperature: 25-30°C<br />
                    Wind: 10-15 km/h<br />
                    Humidity: 30-40% or 70-80%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Cancel sx={{ color: '#F44336', fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Unfavorable Conditions
                  </Typography>
                  <Typography variant="body2" color="#666">
                    Temperature: {'<10°C or >30°C'}<br />
                    Wind: {'<3 or >15 km/h'}<br />
                    Humidity: {'<30% or >80%'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom color="#333" fontWeight="bold">
            6-Hour Forecast
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {forecastData.map((forecast, index) => {
              const condition = determineSprayingCondition(forecast);
              return (
                <Card 
                  key={index} 
                  sx={{ 
                    minWidth: 200,
                    bgcolor: `${condition.color}15`,
                    flexShrink: 0
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom align="center">
                      {forecast.time}
                    </Typography>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
                      <img 
                        src={`http://openweathermap.org/img/w/${forecast.icon}.png`}
                        alt="Weather icon"
                        style={{ width: 40, height: 40 }}
                      />
                      <Typography variant="h6" component="span">
                        {forecast.temperature}°C
                      </Typography>
                      {getStatusIcon(condition.status)}
                    </Box>
                    <Typography variant="body2" color="#666" align="center">
                      Wind: {forecast.windSpeed} km/h<br />
                      Humidity: {forecast.humidity}%
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SprayingCard; 