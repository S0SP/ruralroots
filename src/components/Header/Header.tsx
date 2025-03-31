import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logoImage from '../../assets/images/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

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

// Add these styled components
const UserMenuDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 0.5rem 0;
  display: ${props => props.isOpen ? 'block' : 'none'};
  min-width: 200px;
`;

const MenuItem = styled.div`
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #f5f5f5;
  }
`;

const Header: React.FC = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    if (user) {
      setIsMenuOpen(!isMenuOpen);
    } else {
      signInWithGoogle();
    }
  };

  // Update IconsContainer section
  return (
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
            <IconWrapper ref={menuRef} style={{ position: 'relative' }}>
              {user ? (
                <>
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt="Profile"
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                    onClick={handleAvatarClick}
                  />
                  <UserMenuDropdown isOpen={isMenuOpen}>
                    <MenuItem>
                      <img
                        src={user.photoURL || '/default-avatar.png'}
                        alt="Profile"
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      />
                      <div>
                        <div>{user.displayName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                      </div>
                    </MenuItem>
                    <MenuItem onClick={logout}>Sign Out</MenuItem>
                  </UserMenuDropdown>
                </>
              ) : (
                <AccountCircleIcon onClick={handleAvatarClick} />
              )}
            </IconWrapper>
          </IconsContainer>
        </NavLinks>
      </Navigation>
    </HeaderContainer>
  );
};

export default Header;

// Add these styled components if you don't have them
const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const UserName = styled.span`
  font-size: 14px;
  color: #333;
  margin-left: 8px;
`;
