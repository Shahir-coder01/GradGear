import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './GradePredictor.css';


const GradePredictor = ({ isAuthenticated, onLogout }) => {
  const [firstInternal, setFirstInternal] = useState('');
  const [secondInternal, setSecondInternal] = useState('');
  const [attendance, setAttendance] = useState('');
  const [assignment, setAssignment] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Calculate attendance marks based on percentage
  const calculateAttendanceMarks = (attendancePercentage) => {
    if (attendancePercentage >= 95) return 5;
    if (attendancePercentage >= 90) return 4;
    if (attendancePercentage >= 85) return 3;
    if (attendancePercentage >= 80) return 2;
    if (attendancePercentage >= 75) return 1;
    return 0;
  };

  // Calculate required final marks for a target total
  // Calculate required final marks for a target total
const calculateRequiredMarks = (targetTotal, internalContribution, attendanceMarks, assignmentMarks) => {
  const required = targetTotal - internalContribution - attendanceMarks - assignmentMarks;
  // Ensure the required marks are at least 24 (minimum passing) and at most 60 (maximum possible)
  return Math.max(Math.min(Math.max(required, 24), 60), 24); 
};

  // Handle calculation
  const predictGrades = () => {
    // Validate inputs
    if (
      firstInternal === '' || 
      secondInternal === '' || 
      attendance === '' || 
      assignment === ''
    ) {
      setError('Please fill in all fields');
      return;
    }

    // Parse inputs to numbers
    const it1 = parseFloat(firstInternal);
    const it2 = parseFloat(secondInternal);
    const att = parseFloat(attendance);
    const assign = parseFloat(assignment);

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

    // Calculate current components
    const internalContribution = ((it1 + it2) / 60) * 25;
    const attendanceMarks = calculateAttendanceMarks(att);
    const currentTotal = internalContribution + attendanceMarks + assign;

    // Calculate required marks for each grade
    const gradeRequirements = [
      { grade: 'S', threshold: 90, required: calculateRequiredMarks(90, internalContribution, attendanceMarks, assign) },
      
      { grade: 'A', threshold: 80, required: calculateRequiredMarks(80, internalContribution, attendanceMarks, assign) },
      
      { grade: 'B', threshold: 70, required: calculateRequiredMarks(70, internalContribution, attendanceMarks, assign) },
      
      { grade: 'C', threshold: 60, required: calculateRequiredMarks(60, internalContribution, attendanceMarks, assign) },
      
      { grade: 'D', threshold: 50, required: calculateRequiredMarks(50, internalContribution, attendanceMarks, assign) },
    ];

    // Check if any grade is impossible to achieve
    const impossibleGrades = gradeRequirements.filter(g => g.required > 60);
    const possibleGrades = gradeRequirements.filter(g => g.required <= 60);

    // Update state
    setPredictions({
      currentComponents: {
        internalContribution: internalContribution.toFixed(2),
        attendanceMarks,
        assignmentMarks: assign
      },
      currentTotal: currentTotal.toFixed(2),
      possibleGrades,
      impossibleGrades,
      passingRequired: calculateRequiredMarks(50, internalContribution, attendanceMarks, assign)
    });
    
    setError('');
  };

  // Reset form
  const resetForm = () => {
    setFirstInternal('');
    setSecondInternal('');
    setAttendance('');
    setAssignment('');
    setPredictions(null);
    setError('');
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      
      <div className="grade-predictor-page">
        <h1 className="page-title">CUSAT Grade Predictor</h1>
        <p className="page-subtitle">Find out what marks you need in your final exam to achieve your target grade</p>
        
        <div className="predictor-container">
          <div className="predictor-form">
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
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="button-group">
              <button className="predict-btn" onClick={predictGrades}>Predict Grades</button>
              <button className="reset-btn" onClick={resetForm}>Reset</button>
            </div>

            <div className="nav-tools">
              <p>Need to calculate your final grade instead?</p>
              <button 
                className="nav-calculator-btn" 
                onClick={() => navigate('/calculator')}
              >
                Go to Grade Calculator
              </button>
            </div>
          </div>
          
          {predictions && (
            <div className="result-section">
              <h2>Your Grade Predictions</h2>
              
              <div className="current-status">
                <h3>Current Status</h3>
                <div className="status-item">
                  <span>Internal Tests Contribution:</span>
                  <span>{predictions.currentComponents.internalContribution} / 25</span>
                </div>
                <div className="status-item">
                  <span>Attendance Marks:</span>
                  <span>{predictions.currentComponents.attendanceMarks} / 5</span>
                </div>
                <div className="status-item">
                  <span>Assignment Marks:</span>
                  <span>{predictions.currentComponents.assignmentMarks} / 10</span>
                </div>
                <div className="status-item total">
                  <span>Current Total:</span>
                  <span>{predictions.currentTotal} / 40</span>
                </div>
              </div>

              <div className="required-marks">
                <h3>Marks Required in Final Exam (out of 60)</h3>

                <div className="passing-requirement">
                  <div className="pass-label">To Pass (Grade D):</div>
                  <div className="pass-value">
                    {predictions.passingRequired > 60 ? (
                      <span className="impossible">Impossible</span>
                    ) : (
                      <span>{predictions.passingRequired.toFixed(2)} marks</span>
                    )}
                  </div>
                </div>

                <div className="grade-predictions">
                  <h4>To Achieve Higher Grades:</h4>
                  
                  {predictions.possibleGrades.length > 0 ? (
                    <div className="grades-table">
                      <div className="table-header">
                        <div>Grade</div>
                        <div>Required Marks</div>
                        <div>Difficulty</div>
                      </div>
                      {predictions.possibleGrades.map((grade, index) => (
                        <div className="table-row" key={index}>
                          <div className="grade-cell">{grade.grade}</div>
                          <div>{grade.required.toFixed(2)} / 60</div>
                          <div>
                            <div className="difficulty-meter">
                              <div 
                                className="difficulty-fill" 
                                style={{ 
                                  width: `${(grade.required / 60) * 100}%`,
                                  backgroundColor: getDifficultyColor(grade.required / 60)
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Based on your current marks, all higher grades are unachievable.</p>
                  )}

                  {predictions.impossibleGrades.length > 0 && (
                    <div className="impossible-grades">
                      <h4>Unachievable Grades:</h4>
                      <p>
                        {predictions.impossibleGrades.map(g => g.grade).join(', ')}
                        {predictions.impossibleGrades.length > 0 && " - These grades require more than 60 marks in the final exam, which is not possible."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="advice-section">
                <h3>Study Advice</h3>
                <p>
                  {predictions.passingRequired > 60 ? (
                    "You'll need to improve your performance in future assessments as passing this course may not be possible with the current marks."
                  ) : predictions.passingRequired > 40 ? (
                    "You need to focus intensively on your exam preparation to pass this course."
                  ) : predictions.passingRequired > 20 ? (
                    "With consistent study and exam preparation, you should be able to pass this course."
                  ) : (
                    "You're in a good position to pass this course. Keep up the good work!"
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get color based on difficulty
const getDifficultyColor = (ratio) => {
  if (ratio > 0.8) return '#ff4d4d'; // Hard - red
  if (ratio > 0.6) return '#ffa64d'; // Moderate - orange
  if (ratio > 0.4) return '#ffdd4d'; // Average - yellow
  if (ratio > 0.2) return '#4dff4d'; // Easy - green
  return '#4dffb8'; // Very easy - light green
};

export default GradePredictor;