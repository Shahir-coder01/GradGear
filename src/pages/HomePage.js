import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaSignOutAlt, FaRobot, FaTimes, FaBrain, FaMagic, FaStar, FaCheck } from 'react-icons/fa';
import './HomePage.css';

const Dashboard = ({ isAuthenticated, onLogout }) => {
  // State management
  const [showProPopup, setShowProPopup] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const navigate = useNavigate();
  
  // Check authentication status on component mount
  useEffect(() => {
    const proStatus = localStorage.getItem('proStatus');
    
    if (proStatus === 'true') {
      setIsProUser(true);
    }
  }, []);
  
  // Handle logout functionality
  const handleSignOut = (e) => {
    e.preventDefault();
    
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    
    // Call the onLogout prop if available
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to login page
    navigate('/login');
  };

  // Handle AI button click - Always show popup
  const handleAIButtonClick = () => {
    // Always show the popup, regardless of pro status
    setShowProPopup(true);
  };

  // Handle subscription purchase
  const handleSubscribe = () => {
    // Show success animation
    setShowSuccessAnimation(true);
    
    // Set timeout to allow animation to play before redirecting
    setTimeout(() => {
      // Update pro status
      localStorage.setItem('proStatus', 'true');
      setIsProUser(true);
      setShowProPopup(false);
      setShowSuccessAnimation(false);
      
      // Redirect to AI page
      navigate('/ai');
    }, 3000); // 3 seconds for animation
  };

  // Handle closing the popup
  const handleClosePopup = () => {
    setShowProPopup(false);
  };

  return (
    <div className="home-page-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="home-page-video">
        <source src="/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="home-page-overlay"></div>
      <div className="home-page-overlay"></div>
      
      <div className="dashboard">
        <nav className="main-nav">
          <div className="nav-container">
            <div className="nav-brand">
            <Link to="/" className="brand-link">
  <span className="brand-icon">
    <img src={require('../assets/logo.png')} alt="GradeGear Logo" />
  </span>
  <span className="brand-name">GradeGear</span>
</Link>
            </div>
            
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/lectures">Lectures</Link>
              <Link to="/notes">Notes</Link>
              <Link to="/pyq">PYQ</Link>
              <Link to="/groups">Groups</Link>
              <Link to="/gg">GradeGarage</Link>
              
              <div className="dropdown">
                <button className="dropdown-toggle">Tools </button>
                <div className="dropdown-menu">
                  <Link to="/calculator" className="dropdown-item">
                    Grade Calculator
                  </Link>
                  <Link to="/predictor" className="dropdown-item">
                    Grade Predictor
                  </Link>
                  <Link to="/gg" className="dropdown-item">
                    GradeGarage
                  </Link>
                  <Link to="/performance-analyzer" className="dropdown-item highlight-link">
                    Performance Analyzer
                  </Link>
                </div>
              </div>
              <Link to="/about">About</Link>
              
              {/* AI Pro button */}
              <button 
                type="button"
                className={`ai-nav-button ${isProUser ? 'ai-pro' : ''}`} 
                onClick={handleAIButtonClick}
              >
                <FaRobot className="ai-icon" />
                <span>AI{isProUser ? ' Pro' : ''}</span>
              </button>
            </div>
            
            <div className="nav-auth">
              {isAuthenticated ? (
                <button 
                  className="login-btn signout-btn"
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt className="signout-icon" />
                  Sign Out
                </button>
              ) : (
                <Link to="/login" className="login-btn">Log In</Link>
              )}
            </div>
          </div>
        </nav>
        
        <div className="hero-section">
          <h1 className="hero-title">
            <span className="typewriter-text">Gear Your Academics</span>
            <br />
            <span className="typewriter-text delayed">Track Your Progress</span>
            <br />
            <span className="typewriter-text delayed">Predict Your Future</span>
          </h1>
          
          <p className="hero-subtitle">
            Start your journey to smarter learning and academic success
          </p>
          
          {isAuthenticated ? (
            <Link to="/gg" className="cta-button">
              My Dashboard
              <span className="arrow-icon">
                <FaArrowRight />
              </span>
            </Link>
          ) : (
            <Link to="/login" className="cta-button">
              Get Started
              <span className="arrow-icon">
                <FaArrowRight />
              </span>
            </Link>
          )}
          
          <div className="hero-glow"></div>
        </div>
      </div>

      {/* Pro Subscription Popup */}
      {showProPopup && (
        <div className="pro-popup-overlay">
          <div className="pro-popup">
            <button 
              type="button" 
              className="close-popup" 
              onClick={handleClosePopup}
            >
              <FaTimes />
            </button>
            
            <div className="pro-popup-header">
              <FaStar className="pro-icon" />
              <h2>Upgrade to GradeGear AI Pro</h2>
            </div>
            
            <div className="pro-price">
              <span className="price-amount">FREE</span>
              <span className="price-period">Special CUSAT Student Offer</span>
            </div>
            
            <div className="pro-features">
              <h3>Premium Features:</h3>
              <ul>
                <li>
                  <FaBrain className="feature-icon" />
                  <span>AI-Powered Notes Generation</span>
                </li>
                <li>
                  <FaRobot className="feature-icon" />
                  <span>AI-Powered Question Paper Solver </span>
                </li>
                <li>
                  <FaMagic className="feature-icon" />
                  <span>Unlimited AI generations</span>
                </li>
                <li>
                  <FaStar className="feature-icon" />
                  <span>Exam Preparation Assistant</span>
                </li>
              </ul>
            </div>
            
            <div className="limited-offer">
              <span>⏰ Limited Time Offer!</span>
            </div>
            
            <button 
              type="button"
              className="subscribe-button" 
              onClick={handleSubscribe}
            >
              Activate Now
            </button>
          </div>
        </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="success-animation-overlay">
          <div className="success-animation">
            <div className="success-icon">
              <FaCheck />
            </div>
            <h2>Congratulations!</h2>
            <p>You've successfully activated GradeGear AI Pro</p>
            <div className="success-confetti"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;