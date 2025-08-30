import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './GradeCalculator.css';

const GradeCalculator = ({ isAuthenticated, onLogout }) => {
  const [firstInternal, setFirstInternal] = useState('');
  const [secondInternal, setSecondInternal] = useState('');
  const [attendance, setAttendance] = useState('');
  const [assignment, setAssignment] = useState('');
  const [expectedFinal, setExpectedFinal] = useState('');
  const [totalMarks, setTotalMarks] = useState(null);
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  // Calculate attendance marks based on percentage
  const calculateAttendanceMarks = (attendancePercentage) => {
    if (attendancePercentage >= 95) return 5;
    if (attendancePercentage >= 90) return 4;
    if (attendancePercentage >= 85) return 3;
    if (attendancePercentage >= 80) return 2;
    if (attendancePercentage >= 75) return 1;
    return 0;
  };

  // Calculate grade based on total marks
  const calculateGrade = (marks) => {
    if (marks >= 90) return 'S';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    return 'F';
  };

  // Handle calculation
  const calculateTotal = () => {
    // Validate inputs
    if (
      firstInternal === '' || 
      secondInternal === '' || 
      attendance === '' || 
      assignment === '' || 
      expectedFinal === ''
    ) {
      setError('Please fill in all fields');
      return;
    }

    // Parse inputs to numbers
    const it1 = parseFloat(firstInternal);
    const it2 = parseFloat(secondInternal);
    const att = parseFloat(attendance);
    const assign = parseFloat(assignment);
    const final = parseFloat(expectedFinal);

    // Validate ranges
    if (it1 < 0 || it1 > 30) {
      setError('First Internal marks should be between 0 and 30');
      return;
    }
    if (it2 < 0 || it2 > 30) {
      setError('Second Internal marks should be between 0 and 30');
      return;
    }
    if (att < 0 || att > 100) {
      setError('Attendance percentage should be between 0 and 100');
      return;
    }
    if (assign < 0 || assign > 10) {
      setError('Assignment marks should be between 0 and 10');
      return;
    }
    if (final < 24 || final > 60) {
      setError('Sorry! your mark is below the passing limit of 24. Passing marks should be between 24 and 60');
      return;
    }

    // Calculate according to the formula
    const internalContribution = ((it1 + it2) / 60) * 25;
    const attendanceMarks = calculateAttendanceMarks(att);
    const total = final + assign + internalContribution + attendanceMarks;

    // Update state
    setTotalMarks(total.toFixed(2));
    setGrade(calculateGrade(total));
    setError('');
  };

  // Reset form
  const resetForm = () => {
    setFirstInternal('');
    setSecondInternal('');
    setAttendance('');
    setAssignment('');
    setExpectedFinal('');
    setTotalMarks(null);
    setGrade('');
    setError('');
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      
      <div className="grade-calculator-page">
        <h1 className="page-title">CUSAT Grade Calculator</h1>
        <p className="page-subtitle">Calculate your expected grade based on internal marks, attendance, and final exam</p>
        
        <div className="calculator-container">
          <div className="calculator-form">
            <div className="form-group">
              <label>First Internal Test (out of 30)</label>
              <input 
                type="number" 
                min="0" 
                max="30" 
                value={firstInternal} 
                onChange={(e) => setFirstInternal(e.target.value)}
                placeholder="Enter marks (0-30)"
              />
            </div>
            
            <div className="form-group">
              <label>Second Internal Test (out of 30)</label>
              <input 
                type="number" 
                min="0" 
                max="30" 
                value={secondInternal} 
                onChange={(e) => setSecondInternal(e.target.value)}
                placeholder="Enter marks (0-30)"
              />
            </div>
            
            <div className="form-group">
              <label>Attendance Percentage (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={attendance} 
                onChange={(e) => setAttendance(e.target.value)}
                placeholder="Enter percentage (0-100)"
              />
            </div>
            
            <div className="form-group">
              <label>Assignment Marks (out of 10)</label>
              <input 
                type="number" 
                min="0" 
                max="10" 
                value={assignment} 
                onChange={(e) => setAssignment(e.target.value)}
                placeholder="Enter marks (0-10)"
              />
            </div>
            
            <div className="form-group">
              <label>Expected Final Exam Score (out of 60)</label>
              <input 
                type="number" 
                min="0" 
                max="60" 
                value={expectedFinal} 
                onChange={(e) => setExpectedFinal(e.target.value)}
                placeholder="Enter expected marks (0-60)"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="button-group">
              <button className="calculate-btn" onClick={calculateTotal}>Calculate</button>
              <button className="reset-btn" onClick={resetForm}>Reset</button>
            </div>
          </div>
          
          {totalMarks !== null && (
            <div className="result-section">
              <h2>Your Results</h2>
              
              <div className="result-details">
                <div className="result-item">
                  <span className="result-label">Internal Tests Contribution:</span>
                  <span className="result-value">{((parseFloat(firstInternal) + parseFloat(secondInternal)) / 60 * 25).toFixed(2)} marks</span>
                </div>
                
                <div className="result-item">
                  <span className="result-label">Attendance Marks:</span>
                  <span className="result-value">{calculateAttendanceMarks(parseFloat(attendance))} marks</span>
                </div>
                
                <div className="result-item">
                  <span className="result-label">Assignment Marks:</span>
                  <span className="result-value">{assignment} marks</span>
                </div>
                
                <div className="result-item">
                  <span className="result-label">Final Exam Marks:</span>
                  <span className="result-value">{expectedFinal} marks</span>
                </div>
                
                <div className="result-item total">
                  <span className="result-label">Total Marks:</span>
                  <span className="result-value">{totalMarks} / 100</span>
                </div>
                
                <div className="result-item grade">
                  <span className="result-label">Grade:</span>
                  <span className="result-value">{grade}</span>
                </div>
              </div>
              
              <div className="grade-explanation">
                <h3>Grade Scale</h3>
                <div className="grade-scale">
                  <div className="grade-row">
                    <span>S: 90-100</span>
                    
                    <span>A: 80-89</span>
                    
                  </div>
                  <div className="grade-row">
                    <span>B: 70-79</span>
                    
                    <span>C: 60-69</span>
                    
                    <span>D: 50-59</span>
                  </div>
                  <div className="grade-row">
                    <span>F: Below 50</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeCalculator;