import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaRobot, FaBookOpen, FaFileAlt, FaArrowRight, FaBrain, FaGraduationCap, FaLightbulb, FaArrowLeft } from 'react-icons/fa';
import './AIPage.css';

const AIPage = () => {
  const navigate = useNavigate();

  // Handle card click for feature selection
  const handleFeatureSelect = (feature) => {
    if (feature === 'notes') {
      navigate('/ai/notes-generator');
    } else if (feature === 'solver') {
      navigate('/ai/qp-solver');
    }
  };

  return (
    <div className="ai-page-container">
      {/* Back Button */}
      <div className="back-button-container">
        <Link to="/" className="back-button">
          <FaArrowLeft className="back-icon" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* AI Page Header */}
      <div className="ai-header">
        <div className="ai-title-container">
          <div className="ai-icon-container">
            <FaRobot className="ai-main-icon" />
            <div className="pulse-effect"></div>
          </div>
          <div className="ai-title-text">
            <h1>GradeGear AI</h1>
            <p>Intelligent tools to enhance your academic performance</p>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="ai-features-container">
        <h2 className="features-title">
          <FaBrain className="section-icon" />
          <span>AI-Powered Tools</span>
        </h2>
        
        <div className="features-grid">
          {/* AI Notes Generator Card */}
          <div 
            className="feature-card" 
            onClick={() => handleFeatureSelect('notes')}
          >
            <div className="card-header notes-gradient">
              <FaBookOpen className="card-icon" />
            </div>
            <div className="card-body">
              <h3>AI Notes Generator</h3>
              <p>Transform lecture content into comprehensive, structured notes with our AI engine.</p>
              <ul className="feature-list">
                <li>
                  <FaLightbulb className="list-icon" />
                  <span>Smart summarization of lecture content</span>
                </li>
                <li>
                  <FaLightbulb className="list-icon" />
                  <span>Key concepts highlighted automatically</span>
                </li>
                <li>
                  <FaLightbulb className="list-icon" />
                  <span>Generates notes based on References</span>
                </li>
              </ul>
              <button className="feature-button">
                Generate Notes
                <FaArrowRight className="button-icon" />
              </button>
            </div>
          </div>

          {/* AI QP Solver Card */}
          <div 
            className="feature-card" 
            onClick={() => handleFeatureSelect('solver')}
          >
            <div className="card-header solver-gradient">
              <FaFileAlt className="card-icon" />
            </div>
            <div className="card-body">
              <h3>AI QP Solver</h3>
              <p>Get instant solutions and explanations for past question papers and practice problems.</p>
              <ul className="feature-list">
                <li>
                  <FaLightbulb className="list-icon" />
                  <span>Step-by-step problem solutions</span>
                </li>
                <li>
                  <FaLightbulb className="list-icon" />
                  <span>Upload question paper images</span>
                </li>
                <li>
                  <FaLightbulb className="list-icon" />
                  <span>Detailed explanations of concepts</span>
                </li>
              </ul>
              <button className="feature-button">
                Solve Questions
                <FaArrowRight className="button-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h2 className="section-title">
          <FaGraduationCap className="section-icon" />
          <span>How It Works</span>
        </h2>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Select an AI Tool</h3>
            <p>Choose between Notes Generator or QP Solver based on your needs</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Provide Input</h3>
            <p>Upload lecture content or question papers for AI processing</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Review & Download</h3>
            <p>Get instant results that you can edit, save, or share</p>
          </div>
        </div>
      </div>

      {/* Pro Benefits Banner */}
      <div className="pro-benefits-banner">
        <div className="pro-benefits-content">
          <h2>GradeGear AI Pro Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <FaRobot className="benefit-icon" />
              <span>Unlimited AI generations</span>
            </div>
            <div className="benefit-item">
              <FaRobot className="benefit-icon" />
              <span>Priority processing</span>
            </div>
            <div className="benefit-item">
              <FaRobot className="benefit-icon" />
              <span>Simple and user-friendly interface</span>
            </div>
            <div className="benefit-item">
              <FaRobot className="benefit-icon" />
              <span>Download the content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
