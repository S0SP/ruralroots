import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Card, Typography, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface ShopCardProps {
  location: { lat: number; lng: number } | null;
}

interface Shop {
  id: string;
  name: string;
  image: string;
  location: string;
  distance: number;
  categories: string[];
  coordinates: { lat: number; lng: number };
}

const StyledCard = styled(Card)`
  && {
    min-width: 300px;
    max-width: 350px;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-4px);
    }
  }
`;

const ImageContainer = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
`;

const ShopImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ContentContainer = styled.div`
  padding: 1rem;
`;

const ShopName = styled(Typography)`
  && {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #666;
`;

const CategoryContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const StyledChip = styled(Chip)`
  && {
    background-color: rgba(87, 122, 52, 0.1);
    color: #577a34;
  }
`;

// Mock data - Replace with actual API call
const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Krishna Agricultural Store',
    image: 'https://example.com/shop1.jpg',
    location: 'Sector 12, Market Complex',
    distance: 2.5,
    categories: ['Fertilizers', 'Seeds', 'Tools'],
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  {
    id: '2',
    name: 'Farmers Supply Center',
    image: 'https://example.com/shop2.jpg',
    location: 'Main Road, Near Bus Stand',
    distance: 3.8,
    categories: ['Pesticides', 'Fertilizers'],
    coordinates: { lat: 28.6129, lng: 77.2295 }
  },
  // Add more mock shops
];

const ShopCard: React.FC<ShopCardProps> = ({ location }) => {
  const [shops, setShops] = useState<Shop[]>(mockShops);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch nearby shops
    // This would use the location prop to fetch shops within 20km radius
    if (location) {
      // Fetch shops using Google Places API
      console.log('Fetching shops near:', location);
    }
  }, [location]);

  const handleCardClick = (shop: Shop) => {
    // Open Google Maps with the shop location
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${shop.coordinates.lat},${shop.coordinates.lng}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <>
      {shops.map((shop) => (
        <StyledCard key={shop.id} onClick={() => handleCardClick(shop)}>
          <ImageContainer>
            <ShopImage src={shop.image} alt={shop.name} />
          </ImageContainer>
          
          <ContentContainer>
            <ShopName variant="h6">{shop.name}</ShopName>
            
            <LocationInfo>
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2">
                {shop.location} • {shop.distance} km away
              </Typography>
            </LocationInfo>

            <CategoryContainer>
              {shop.categories.map((category, index) => (
                <StyledChip
                  key={index}
                  label={category}
                  size="small"
                  icon={<StorefrontIcon />}
                />
              ))}
            </CategoryContainer>
          </ContentContainer>
        </StyledCard>
      ))}
    </>
  );
};

export default ShopCard; 