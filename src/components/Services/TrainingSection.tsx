import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Card, 
  Typography, 
  Tabs, 
  Tab, 
  Grid,
  Collapse,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

interface TrainingCenter {
  id: string;
  name: string;
  location: string;
  phone: string;
  description: string;
  image: string;
}

interface TrainingCategory {
  id: string;
  name: string;
  centers: TrainingCenter[];
}

const Container = styled.div`
  margin-top: 1rem;
`;

const ExpandButton = styled(IconButton)`
  && {
    color: #577a34;
    margin-left: auto;
    display: block;
  }
`;

const StyledCard = styled(Card)`
  && {
    padding: 1.5rem;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledTabs = styled(Tabs)`
  && {
    margin-bottom: 2rem;
    
    .MuiTab-root {
      text-transform: none;
      font-size: 1rem;
      
      &.Mui-selected {
        color: #577a34;
      }
    }
    
    .MuiTabs-indicator {
      background-color: #577a34;
    }
  }
`;

const CenterImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: #666;
`;

// Mock data
const trainingCategories: TrainingCategory[] = [
  {
    id: '1',
    name: 'Mushroom Farming',
    centers: [
      {
        id: 'm1',
        name: 'Mushroom Training Institute',
        location: 'Agricultural Complex, Sector 15',
        phone: '+91 98765 43210',
        description: 'Comprehensive training in mushroom cultivation techniques',
        image: 'https://example.com/mushroom.jpg'
      },
      // Add more centers
    ]
  },
  {
    id: '2',
    name: 'Flower Farming',
    centers: [
      {
        id: 'f1',
        name: 'Floriculture Training Center',
        location: 'Horticulture Park, West Zone',
        phone: '+91 98765 43211',
        description: 'Expert guidance in commercial flower cultivation',
        image: 'https://example.com/flower.jpg'
      },
      // Add more centers
    ]
  },
  // Add more categories
];

const TrainingSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Container>
      <CategoryHeader>
        <Typography variant="h6" color="textSecondary">
          Explore Training Programs
        </Typography>
        <ExpandButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ExpandButton>
      </CategoryHeader>

      <Collapse in={expanded}>
        <StyledTabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {trainingCategories.map((category) => (
            <Tab key={category.id} label={category.name} />
          ))}
        </StyledTabs>

        <Grid container spacing={3}>
          {trainingCategories[selectedTab].centers.map((center) => (
            <Grid item xs={12} md={6} key={center.id}>
              <StyledCard>
                <CenterImage src={center.image} alt={center.name} />
                
                <Typography variant="h6" gutterBottom>
                  {center.name}
                </Typography>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {center.description}
                </Typography>

                <ContactInfo>
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">{center.location}</Typography>
                </ContactInfo>

                <ContactInfo>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">{center.phone}</Typography>
                </ContactInfo>

                <ContactInfo>
                  <SchoolIcon fontSize="small" />
                  <Typography variant="body2">
                    {trainingCategories[selectedTab].name} Training
                  </Typography>
                </ContactInfo>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Container>
  );
};

export default TrainingSection; 