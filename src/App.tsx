import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header/Header';
import Home from './pages/Home';
import Services from './pages/Services';
import Community from './pages/Community';
import DiseaseDetection from './components/DiseaseDetection/DiseaseDetection';
import FarmDashboard from './pages/FarmDashboard';
import Schemes from './pages/SchemesPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.main`
  flex: 1;
`;

// AI Tools page component
const AITools = () => {
  return (
    <DiseaseDetection />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Header />
          <ContentContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={
                
                  <Services />
                
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/farmdashboard" element={
                <ProtectedRoute>
                  <FarmDashboard />
                </ProtectedRoute>
              } />
              <Route path="/schemespage" element={
                <ProtectedRoute>
                  <Schemes />
                </ProtectedRoute>
              } />
              <Route path="/aitools" element={
                <ProtectedRoute>
                  <AITools />
                </ProtectedRoute>
              } />
            </Routes>
          </ContentContainer>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;
