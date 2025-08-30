import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaUpload, FaRobot, FaFileImage, FaSearch, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import './AIQPSolver.css';

const AIQPSolver = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [solution, setSolution] = useState(null);
  const [generatedPdf, setGeneratedPdf] = useState(null);
  const [viewPdf, setViewPdf] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    // Reset states
    setError(null);
    setSolution(null);
    setGeneratedPdf(null);
    setViewPdf(false);
    
    // Validate file
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, JPG or PNG).');
      return;
    }
    
    // Set selected file
    setSelectedFile(file);
    
    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Handle solving the question paper
  const handleSolve = async () => {
    if (!selectedFile) {
      setError('Please upload a question paper image first.');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setError(null);
    
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
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Set progress to indicate upload is complete
      setProgress(30);
      
      // Make API request
      const response = await axios.post('http://localhost:8000/api/solve-qp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Set progress to indicate processing is complete
      setProgress(95);
      
      // Set solution and PDF
      setSolution(response.data.text_solution);
      setGeneratedPdf(response.data.pdf);
      
      // Complete progress
      setProgress(100);
    } catch (err) {
      console.error('Error solving question paper:', err);
      setError('Failed to solve the question paper. Please try again.');
      setProgress(0);
    } finally {
      // Clear the interval
      if (window.progressInterval) {
        clearInterval(window.progressInterval);
        window.progressInterval = null;
      }
      
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  // Handle viewing PDF
  const handleViewPdf = () => {
    setViewPdf(true);
  };

  return (
    <div className="qp-solver-container">
      <div className="qp-solver-header">
        <Link to="/ai" className="back-button">
          <FaArrowLeft /> Back to AI Hub
        </Link>
        <h1 className="qp-solver-title">
          <FaRobot className="title-icon" />
          AI Question Paper Solver
        </h1>
      </div>

      <div className="qp-solver-content">
        <div className="upload-section">
          <div className="upload-container">
            {!selectedFile ? (
              <div className="upload-area">
                <input
                  type="file"
                  id="file-upload"
                  className="file-input"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="file-label">
                  <FaFileImage className="upload-icon" />
                  <div className="upload-text">
                    <span className="upload-title">Upload Question Paper</span>
                    <span className="upload-subtitle">Click or drag and drop image here</span>
                    <span className="upload-format">Supported formats: JPG, JPEG, PNG (Max: 10MB)</span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="preview-container">
                <div className="preview-header">
                  <h3 className="preview-title">{selectedFile.name}</h3>
                  <button 
                    className="remove-button" 
                    onClick={handleRemoveFile}
                    title="Remove file"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="image-preview">
                  <img src={previewUrl} alt="Question Paper Preview" />
                </div>
                <div className="file-info">
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            className="solve-button" 
            onClick={handleSolve}
            disabled={!selectedFile || loading}
          >
            <FaSearch className="button-icon" />
            Solve Question Paper
          </button>
        </div>

        {generatedPdf && !loading && (
          <div className="result-section">
            <h2 className="result-title">Your Solution is Ready!</h2>
            
            <div className="action-buttons">
              <button onClick={handleViewPdf} className="view-button">
                <FaEye className="button-icon" />
                View PDF
              </button>
              
              <a
                href={`data:application/pdf;base64,${generatedPdf}`}
                download="qp_solution.pdf"
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
                  title="Generated Solution"
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
            <p className="progress-text">Analyzing Question Paper... {progress}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQPSolver;