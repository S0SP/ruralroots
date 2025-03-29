import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logoImage from '../../assets/images/logo.png';

// Create a wrapper to provide consistent spacing for content
export const HeaderSpacing = styled.div`
  height: 26px;
  width: 100%;
  background: transparent;
`;

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0.5rem 4rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0.5rem 2rem;
    height: 60px;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  margin-right: 25%;
  height: 100%;
  padding: 0;

  @media (max-width: 768px) {
    margin-right: 1rem;
  }
`;

const Logo = styled.img`
  height: 85px;
  width: auto;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 30px;
  }
`;

const Navigation = styled.nav`
  display: flex;
  margin-left: auto;
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2.5rem;
  align-items: center;
`;

const NavItem = styled.li`
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #333;
  position: relative;
  padding: 0.5rem 0;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #577a34;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #577a34;
    &:after {
      width: 100%;
    }
  }
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-left: 2rem;
  align-items: center;
`;

const IconWrapper = styled.div`
  cursor: pointer;
  color: #444;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    color: #577a34;
    background-color: rgba(87, 122, 52, 0.1);
  }
`;

const pages = ['Home', 'Services', 'Community' ,'FarmDashboard' , 'SchemesPage'];

const Header: React.FC = () => {
  return (
    <>
      <HeaderContainer>
        <LogoContainer to="/">
          <Logo src={logoImage} alt="RealRoots Logo" />
        </LogoContainer>
        
        <Navigation>
          <NavLinks>
            {pages.map((page) => (
              <NavItem key={page}>
                <StyledLink to={page === 'Home' ? '/' : `/${page.toLowerCase()}`}>
                  {page}
                </StyledLink>
              </NavItem>
            ))}
            <NavItem>
              <StyledLink to="/aitools">AITools</StyledLink>
            </NavItem>
            <IconsContainer>
              <IconWrapper>
                <SearchIcon />
              </IconWrapper>
              <IconWrapper>
                <AccountCircleIcon />
              </IconWrapper>
            </IconsContainer>
          </NavLinks>
        </Navigation>
      </HeaderContainer>
      <HeaderSpacing />
    </>
  );
};

export default Header; 
