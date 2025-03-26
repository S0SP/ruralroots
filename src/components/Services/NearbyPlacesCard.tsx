import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Language,
  AccessTime,
  Store,
  School,
  Refresh,
  Info,
  Close
} from '@mui/icons-material';
import { getNearbyPlaces } from '../../services/placesService';
import { Place } from '../../types/places';
import 'leaflet/dist/leaflet.css';

// Separate Map component using direct Leaflet implementation
const PlacesMap = React.memo(({ userLocation, places }: { userLocation: { lat: number; lng: number }, places: Place[] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet dynamically to avoid SSR issues
    const loadMap = async () => {
      try {
        // Dynamic import of Leaflet
        const L = await import('leaflet');
        
        // Wait until the ref is available
        if (!mapContainerRef.current || mapInstanceRef.current) return;
        
        // Create map instance with a specific ID to prevent duplication
        const mapId = `map-${Math.random().toString(36).substring(2, 9)}`;
        mapContainerRef.current.id = mapId;
        
        // Initialize map
        mapInstanceRef.current = L.map(mapId).setView(
          [userLocation.lat, userLocation.lng], 
          13
        );
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstanceRef.current);
        
        // Fix icon paths (a common issue with webpack and leaflet)
        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        // Add markers for places
        places.forEach(place => {
          const marker = L.marker(
            [place.location.lat, place.location.lng],
            { icon }
          ).addTo(mapInstanceRef.current);
          
          marker.bindPopup(`
            <div>
              <strong>${place.name}</strong><br/>
              ${place.address}
            </div>
          `);
        });
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };
    
    loadMap();
    
    // Cleanup function - critical for preventing the "already initialized" error
    return () => {
      if (mapInstanceRef.current) {
        // Make sure we remove all tile layers and event handlers
        mapInstanceRef.current.eachLayer((layer: any) => {
          mapInstanceRef.current.removeLayer(layer);
        });
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, places]);
  
  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
});

const NearbyPlacesCard: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapKey, setMapKey] = useState(0);

  const fetchPlaces = async (location: { lat: number; lng: number }) => {
    try {
      setLoading(true);
      const data = await getNearbyPlaces(location);
      setPlaces(data);
      setError(null);
      setMapKey(prev => prev + 1);
    } catch (err) {
      setError('Failed to fetch nearby places');
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getLocation = async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          if (mounted) {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            await fetchPlaces(location);
          }
        } catch (error) {
          if (mounted) {
            setError('Unable to get your location. Please enable location services.');
            setLoading(false);
          }
        }
      } else {
        if (mounted) {
          setError('Geolocation is not supported by your browser');
          setLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = () => {
    if (userLocation) {
      fetchPlaces(userLocation);
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setDialogOpen(true);
  };

  return (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2" gutterBottom>
            Nearby Places
          </Typography>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : places.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No places found near your location
          </Alert>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {userLocation && (
                <div key={`map-container-${mapKey}`} style={{ height: '400px', width: '100%' }}>
                  <PlacesMap userLocation={userLocation} places={places} />
                </div>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                {places.map((place) => (
                  <ListItem
                    key={place.id}
                    disablePadding
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handlePlaceClick(place)}
                  >
                    <ListItemIcon>
                      {place.type === 'shop' ? <Store /> : <School />}
                    </ListItemIcon>
                    <ListItemText
                      primary={place.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {place.address}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Distance: {place.distance.toFixed(1)} km
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        )}
      </CardContent>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPlace && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedPlace.name}</Typography>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {selectedPlace.type === 'shop' ? 'Agricultural Shop' : 'Training Center'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Distance: {selectedPlace.distance.toFixed(1)} km
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" display="flex" alignItems="center">
                  <LocationOn sx={{ mr: 1 }} />
                  {selectedPlace.address}
                </Typography>
                <Typography variant="body2" display="flex" alignItems="center">
                  <Phone sx={{ mr: 1 }} />
                  {selectedPlace.phone}
                </Typography>
                {selectedPlace.website && (
                  <Typography variant="body2" display="flex" alignItems="center">
                    <Language sx={{ mr: 1 }} />
                    <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer">
                      {selectedPlace.website}
                    </a>
                  </Typography>
                )}
                <Typography variant="body2" display="flex" alignItems="center">
                  <AccessTime sx={{ mr: 1 }} />
                  {selectedPlace.openingHours}
                </Typography>
              </Box>
              {selectedPlace.type === 'shop' && selectedPlace.products && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Products:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedPlace.products.map((product) => (
                      <Chip key={product} label={product} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              {selectedPlace.type === 'training' && selectedPlace.courses && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Courses:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedPlace.courses.map((course) => (
                      <Chip key={course} label={course} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};

export default NearbyPlacesCard; 