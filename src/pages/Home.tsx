import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/images/background.jpg';
import Header from '../components/Header/Header';

const HomeContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  margin-top: 60px; // Match header height
`;

const BackgroundImage = styled.div`
  position: fixed;
  top: 60px; // Match header height
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.35;
  z-index: -1;
  height: calc(100vh - 60px); // Subtract header height

  @media (max-width: 768px) {
    top: 60px; // Match mobile header height
    height: calc(100vh - 60px);
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 60px); // Subtract header height
  width: 100%;
  padding: 2rem 4rem;
  color: #333;
  position: relative;
  z-index: 0;

  @media (max-width: 768px) {
    min-height: calc(100vh - 60px); // Match mobile header height
    padding: 2rem;
  }
`;

const Heading = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  max-width: 60%;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    max-width: 100%;
  }
`;

const Subheading = styled.h2`
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 2rem;
  max-width: 60%;
  color: #444;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    max-width: 100%;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: #577a34;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #465f2a;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(87, 122, 52, 0.2);
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0) translateX(-50%);
    }
    40% {
      transform: translateY(-20px) translateX(-50%);
    }
    60% {
      transform: translateY(-10px) translateX(-50%);
    }
  }
`;

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <HomeContainer>
        <BackgroundImage />
        <HeroContent>
          <Heading>Helping farmers, empowering Kisan</Heading>
          <Subheading>
            "Empower farmers to diagnose crop issues, boost yields, and gain expert agricultural guidance."
          </Subheading>
          <CTAButton to="/services">Get Started</CTAButton>
        </HeroContent>
        <ScrollIndicator>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10L12 15L17 10" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ScrollIndicator>
      </HomeContainer>
    </>
  );
};

export default Home; 