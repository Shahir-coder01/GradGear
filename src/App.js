import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LecturesPage from './pages/LecturesPage';
import NotesPage from './pages/NotesPage';
import PYQPage from './pages/PYQPage';
import GradeCalculatorPage from './pages/GradeCalculatorPage';
import GradePredictorPage from './pages/GradePredictorPage';
import GradeGarage from './pages/GradeGarage';
import PerformanceAnalyzer from './pages/PerformanceAnalyzer';
import AboutPage from './pages/AboutPage';
import GroupsPage from './pages/GroupsPage';
import AIPage from './pages/AIPage';
import AINotesGenerator from './pages/AINotesGenerator';
import AIQPSolver from './pages/AIQPSolver';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Function to handle login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <GoogleOAuthProvider clientId="259016879-t3ge8dijto13up6nlvdn486dvgedmk4t.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} onLogout={handleLogout} />} />
          <Route path="/login" element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          } />
          <Route path="/lectures" element={
            isAuthenticated ? 
            <LecturesPage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/notes" element={
            isAuthenticated ? 
            <NotesPage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/pyq" element={
            isAuthenticated ? 
            <PYQPage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/calculator" element={
            isAuthenticated ? 
            <GradeCalculatorPage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/predictor" element={
            isAuthenticated ? 
            <GradePredictorPage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/gg" element={
            isAuthenticated ? 
            <GradeGarage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/performance-analyzer" element={<PerformanceAnalyzer onLogout={handleLogout} />} />
          <Route path="/about" element={<AboutPage isAuthenticated={isAuthenticated} onLogout={handleLogout} />} />
          <Route path="/groups" element={
            isAuthenticated ? 
            <GroupsPage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />

          <Route path="/ai" element={
            isAuthenticated ? 
            <AIPage onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          } />
          <Route path="/ai/notes-generator" element={<AINotesGenerator />} />
          <Route path="/ai/qp-solver" element={<AIQPSolver />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              
                <AdminDashboard />
              
            } 
          />

        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;