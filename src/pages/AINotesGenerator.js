// src/pages/AINotesGenerator.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaFileAlt, FaDownload, FaEye, FaRobot } from 'react-icons/fa';
import './AINotesGenerator.css';

const AINotesGenerator = () => {
  const [syllabus, setSyllabus] = useState('');
  const [referenceBooks, setReferenceBooks] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPdf, setGeneratedPdf] = useState(null);
  const [viewPdf, setViewPdf] = useState(false);

  const handleGenerateNotes = async () => {
    if (!syllabus) {
      alert('Please enter the syllabus');
      return;
    }
  
    setLoading(true);
    setProgress(0);
  
    // Start with initial progress
    setProgress(10);
    
    // Clear any existing interval
    if (window.progressInterval) {
      clearInterval(window.progressInterval);
    }
    
    // Set slower progress increment for longer operations
    window.progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Move slower as we get closer to 90%
        if (prev < 30) return prev + 3;
        if (prev < 60) return prev + 2;
        if (prev < 85) return prev + 0.5;
        return prev;
      });
    }, 500);
  
    try {
      // Set progress to indicate request is being sent
      setProgress(20);
      
      const response = await axios.post('http://localhost:8000/api/generate', {
        syllabus,
        referenceBooks,
      });
  
      // Set progress to indicate processing is nearly complete
      setProgress(95);
      
      setGeneratedPdf(response.data.pdf);
  
      // Complete the progress bar when response is received
      setProgress(100);
    } catch (error) {
      console.error('Error generating notes:', error);
      alert('Failed to generate notes');
      setProgress(0);
    } finally {
      // Clear the interval
      if (window.progressInterval) {
        clearInterval(window.progressInterval);
        window.progressInterval = null;
      }
      
      setTimeout(() => {
        setLoading(false);
      }, 500); // Small delay to smoothly transition off the loading bar
    }
  };

  useEffect(() => {
    if (generatedPdf) {
      console.log('PDF generated successfully');
    }
  }, [generatedPdf]);

  const handleViewPdf = () => {
    setViewPdf(true);
  };

  return (
    <div className="notes-generator-container">
      <div className="notes-generator-header">
        <Link to="/ai" className="back-button">
          <FaArrowLeft /> Back to AI Hub
        </Link>
        <h1 className="notes-generator-title">
          <FaRobot className="title-icon" />
          AI Notes Generator
        </h1>
      </div>

      <div className="notes-generator-content">
        <div className="input-section">
          <div className="form-group">
            <label>Syllabus Content</label>
            <textarea
              placeholder="Paste your syllabus content here..."
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="syllabus-textarea"
            />
            <p className="input-tip">
              For best results, include detailed syllabus points or lecture content
            </p>
          </div>

          <div className="form-group">
            <label>Reference Materials (Optional)</label>
            <textarea
              placeholder="Enter reference books, URLs, or additional materials..."
              value={referenceBooks}
              onChange={(e) => setReferenceBooks(e.target.value)}
              className="reference-textarea"
            />
            <p className="input-tip">
              Adding reference materials helps generate more comprehensive notes
            </p>
          </div>

          <button 
            onClick={handleGenerateNotes} 
            className="generate-button" 
            disabled={loading}
          >
            <FaFileAlt className="button-icon" />
            Generate Notes
          </button>
        </div>

        {generatedPdf && !loading && (
          <div className="result-section">
            <h2 className="result-title">Your Notes are Ready!</h2>
            
            <div className="action-buttons">
              <button onClick={handleViewPdf} className="view-button">
                <FaEye className="button-icon" />
                View PDF
              </button>
              
              <a
                href={`data:application/pdf;base64,${generatedPdf}`}
                download="generated_notes.pdf"
                className="download-button"
              >
                <FaDownload className="button-icon" />
                Download PDF
              </a>
            </div>
            
            {viewPdf && (
              <div className="pdf-viewer">
                <iframe
                  src={`data:application/pdf;base64,${generatedPdf}`}
                  width="100%"
                  height="600px"
                  title="Generated Notes"
                  className="pdf-iframe"
                ></iframe>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI-Themed Loading Screen + Progress Bar */}
      {loading && (
        <div className="loading-overlay">
          <div className="ai-loader">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="loading-progress-container">
            <div className="loading-progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">Generating Notes... {progress}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AINotesGenerator;