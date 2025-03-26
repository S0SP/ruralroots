import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grow } from '@mui/material';
import { CameraAlt, Upload, Category, Analytics, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StepIconBox = styled(Box)<{ active: boolean }>`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: ${props => props.active ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.active ? 'white' : '#2e7d32'};
  box-shadow: ${props => props.active ? '0 10px 20px rgba(46, 125, 50, 0.3)' : '0 6px 12px rgba(0, 0, 0, 0.1)'};
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 5px solid ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)'};
  transform: ${props => props.active ? 'scale(1.1)' : 'scale(1)'};
  cursor: pointer;
  
  &:hover {
    transform: ${props => props.active ? 'scale(1.15)' : 'scale(1.05)'};
  }
  
  & svg {
    font-size: 45px;
    transition: all 0.3s ease;
  }
`;

const StepTitle = styled(Typography)<{ active: boolean }>`
  font-weight: ${props => props.active ? 700 : 500};
  color: ${props => props.active ? '#2e7d32' : '#333'};
  font-size: 1rem;
  margin-top: 1rem;
  text-align: center;
  transition: all 0.3s ease;
`;

const StepDescription = styled(Typography)`
  color: #666;
  font-size: 0.85rem;
  text-align: center;
  max-width: 180px;
  margin: 0.5rem auto 0;
  height: 40px;
`;

const Arrow = styled(ArrowForward)<{ active: boolean }>`
  color: ${props => props.active ? '#2e7d32' : '#bdbdbd'};
  font-size: 30px;
  transform: ${props => props.active ? 'translateX(5px)' : 'translateX(0)'};
  transition: all 0.3s ease;
`;

const StyledPaper = styled(Paper)`
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #2e7d32, #1b5e20);
  }
`;

const ProcessFlow: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { 
      icon: <CameraAlt />, 
      title: 'Take Picture',
      description: 'Capture a clear image of the affected plant area' 
    },
    { 
      icon: <Upload />, 
      title: 'Upload Image',
      description: 'Upload your image to our AI analysis system' 
    },
    { 
      icon: <Category />, 
      title: 'Select Type',
      description: 'Choose between crop, soil, or plant analysis' 
    },
    { 
      icon: <Analytics />, 
      title: 'Get Analysis',
      description: 'Receive detailed disease diagnosis and treatment options' 
    },
  ];

  return (
    <StyledPaper elevation={3}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 4, 
          fontWeight: 700, 
          color: '#1b5e20',
          textAlign: 'center',
          position: 'relative',
          display: 'inline-block',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -10,
            left: '25%',
            width: '50%',
            height: 4,
            backgroundColor: '#2e7d32',
            borderRadius: 2
          }
        }}
      >
        How Disease Detection Works
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2, md: 4 },
          mb: 6,
          position: 'relative',
          pt: 2,
          pb: 3,
        }}
      >
        {steps.map((step, index) => (
          <Grow 
            in={true} 
            style={{ transformOrigin: '0 0 0' }}
            timeout={500 + (index * 100)} 
            key={index}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                position: 'relative',
                width: { xs: '40%', sm: 'auto' }
              }}
              onClick={() => setActiveStep(index)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StepIconBox active={activeStep === index}>
                  {step.icon}
                </StepIconBox>
                {index < steps.length - 1 && (
                  <Box sx={{ mx: { xs: 0, sm: 1 }, display: { xs: 'none', md: 'block' } }}>
                    <Arrow active={activeStep >= index} />
                  </Box>
                )}
              </Box>
              <StepTitle variant="body1" active={activeStep === index}>
                {step.title}
              </StepTitle>
              <StepDescription variant="body2">
                {step.description}
              </StepDescription>
            </Box>
          </Grow>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/aitools')}
          sx={{
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: '50px',
            boxShadow: '0 10px 20px rgba(46, 125, 50, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b5e20 0%, #0a3d0a 100%)',
              transform: 'translateY(-3px)',
              boxShadow: '0 15px 30px rgba(46, 125, 50, 0.4)',
            },
          }}
        >
          Try Disease Detection
        </Button>
      </Box>
    </StyledPaper>
  );
};

export default ProcessFlow; 