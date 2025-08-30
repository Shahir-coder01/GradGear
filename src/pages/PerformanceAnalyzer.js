import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaChartLine, FaGraduationCap, FaBook, FaLightbulb } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './PerformanceAnalyzer.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceAnalyzer = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load user data and grades
  // In your useEffect for loading user data
useEffect(() => {
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user data from localStorage
      const userInfo = localStorage.getItem('userInfo');
      const token = localStorage.getItem('authToken');
      
      if (!userInfo || !token) {
        setError('User information not found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      const userData = JSON.parse(userInfo);
      setUserData(userData);
      
      // Clear any previous data to fetch fresh data
      clearPreviousGradeData(userData.email);
      
      // Fetch all semesters from all branches with timestamp tracking
      const allSemesters = [];
      const processedKeys = new Map(); // To track which semesters we've already seen
      
      // Check localStorage for any keys that match the pattern
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`gradeGarage_${userData.email}_`)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            
            if (Array.isArray(data)) {
              // Process each semester in the data
              data.forEach(semester => {
                if (semester && semester.number && semester.subjects) {
                  const semesterId = `sem_${semester.number}`;
                  const timestamp = semester.lastUpdated || 0;
                  
                  // Check if we've seen this semester before
                  if (!processedKeys.has(semesterId) || timestamp > processedKeys.get(semesterId).timestamp) {
                    // This is either a new semester or a newer version of one we've seen
                    processedKeys.set(semesterId, {
                      semester,
                      timestamp
                    });
                  }
                }
              });
            }
          } catch (parseErr) {
            console.error('Error parsing localStorage data:', parseErr);
          }
        }
      });
      
      // Get the latest version of each semester
      processedKeys.forEach(({semester}) => {
        allSemesters.push(semester);
      });
      
      console.log("Unique semesters with latest data:", allSemesters);
      
      if (allSemesters.length === 0) {
        setError('No grades data found. Please add your grades in GradeGarage first.');
        setIsLoading(false);
        return;
      }
      
      // Filter semesters with valid subjects
      const validSemesters = allSemesters.filter(sem => 
        sem.subjects && Array.isArray(sem.subjects) && sem.subjects.length > 0
      );
      
      if (validSemesters.length === 0) {
        setError('No subject data found. Please add subjects to your semesters.');
        setIsLoading(false);
        return;
      }
      
      // Sort semesters by number to ensure they're in order
      const sortedSemesters = [...validSemesters].sort((a, b) => a.number - b.number);
      setGradesData(sortedSemesters);
      
      // Prepare data for API
      const apiData = {
        semesters: sortedSemesters.map(semester => {
          // Calculate SGPA for each semester
          const sgpa = calculateSGPA(semester.subjects);
          
          return {
            name: semester.name,
            number: semester.number,
            sgpa: sgpa === 'N/A' ? null : parseFloat(sgpa),
            subjects: semester.subjects.map(subject => ({
              name: subject.name,
              marks: parseFloat(subject.marks),
              credits: parseFloat(subject.credits),
              grade: subject.grade
            }))
          };
        })
      };
      
      console.log('Sending data to API:', apiData);
      
      // Make API call to backend without authentication
      const response = await axios.post('http://localhost:8000/api/analyze-performance/', apiData);
      
      console.log('API response:', response.data);
      setAnalysis(response.data);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || 'Failed to analyze performance. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  loadUserData();
}, []);

// Helper function to clear previous grade data
const clearPreviousGradeData = (userEmail) => {
  // Clear only the performance analyzer cache, not the original grade data
  localStorage.removeItem(`performanceAnalyzer_${userEmail}_cache`);
};

  // Helper function to calculate SGPA
  const calculateSGPA = (subjects) => {
    if (!subjects || !subjects.length) return 'N/A';
    
    // Define grade mapping
    const gradeMapping = {
      S: { points: 10 },
      A: { points: 9 },
      B: { points: 8 },
      C: { points: 7 },
      D: { points: 6 },
      E: { points: 5 },
      F: { points: 0 }
    };
    
    const totalCreditPoints = subjects.reduce((sum, subject) => 
      sum + (subject.credits * subject.gradePoints), 0);
    
    const totalCredits = subjects.reduce((sum, subject) => 
      sum + subject.credits, 0);
    
    return (totalCreditPoints / totalCredits).toFixed(2);
  };


// Prepare SGPA chart data
const prepareChartData = () => {
  if (!gradesData.length || !analysis || !analysis.sgpa_prediction) return null;
  
  // Sort semesters by number
  const sortedSemesters = [...gradesData].sort((a, b) => a.number - b.number);
  
  // Create unique labels for each semester
  const labels = sortedSemesters.map(sem => `S${sem.number}`);
  
  // Get past SGPAs
  const pastSgpas = sortedSemesters.map(sem => {
    const sgpa = calculateSGPA(sem.subjects);
    return sgpa === 'N/A' ? null : parseFloat(sgpa);
  });
  
  // Get the maximum semester number
  const maxSemesterNumber = Math.max(...sortedSemesters.map(sem => sem.number));
  
  // Create future semester numbers and labels
  const futureSemesterNumbers = [];
  for (let i = 0; i < analysis.sgpa_prediction.predicted_sgpas.length; i++) {
    futureSemesterNumbers.push(maxSemesterNumber + i + 1);
  }
  
  const futureLabels = futureSemesterNumbers.map(num => `S${num}`);
  const futureSgpas = analysis.sgpa_prediction.predicted_sgpas;
  
  // Get the last actual SGPA and first predicted SGPA for the connection
  const lastActualSgpa = pastSgpas[pastSgpas.length - 1];
  const firstPredictedSgpa = futureSgpas[0];
  
  // Create the datasets
  const allLabels = [...labels, ...futureLabels];
  
  // Create data arrays with correct lengths
  const pastData = [...pastSgpas, ...Array(futureLabels.length).fill(null)];
  const futureData = [...Array(labels.length).fill(null), ...futureSgpas];
  
  // Create connection data
  const connectionData = Array(allLabels.length).fill(null);
  if (labels.length > 0 && futureLabels.length > 0) {
    connectionData[labels.length - 1] = lastActualSgpa;
    connectionData[labels.length] = firstPredictedSgpa;
  }
  
  console.log("Chart preparation:", {
    labels: allLabels,
    pastSgpas,
    futureSgpas,
    pastData,
    futureData,
    connectionData
  });
  
  return {
    labels: allLabels,
    datasets: [
      {
        label: 'Past SGPAs',
        data: pastData,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.1
      },
      {
        label: 'Predicted SGPAs',
        data: futureData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1
      },
      {
        label: 'Trend Connection',
        data: connectionData,
        borderColor: 'rgba(255, 99, 132, 0.7)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.1
      }
    ]
  };
};


// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      min: 0,
      max: 10,
      title: {
        display: true,
        text: 'SGPA'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Semester'
      },
      ticks: {
        font: {
          weight: 'bold'
        }
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        title: function(tooltipItems) {
          // Convert S1 to Semester 1 for tooltip
          const semNumber = tooltipItems[0].label.replace('S', '');
          return `Semester ${semNumber}`;
        },
        label: function(context) {
          if (context.parsed.y !== null) {
            return `SGPA: ${context.parsed.y.toFixed(2)}`;
          }
          return '';
        }
      }
    }
  }
};

  return (
    <div>
      <Navbar isAuthenticated={true} onLogout={onLogout} />
      <div className="analyzer-container">
        <div className="analyzer-header">
          <h1>Performance Analyzer</h1>
          <p>Gain insights into your academic performance and future prospects</p>
        </div>
        
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="analyzer-tabs">
              <button 
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaChartLine /> Performance Overview
              </button>
              <button 
                className={`tab-button ${activeTab === 'strengths' ? 'active' : ''}`}
                onClick={() => setActiveTab('strengths')}
              >
                <FaLightbulb /> Strengths & Weaknesses
              </button>
              <button 
                className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommendations')}
              >
                <FaBook /> Elective Recommendations
              </button>
              <button 
                className={`tab-button ${activeTab === 'specialization' ? 'active' : ''}`}
                onClick={() => setActiveTab('specialization')}
              >
                <FaGraduationCap /> Specialization Guidance
              </button>
            </div>
            
            <div className="analyzer-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <h2>SGPA Trend Analysis</h2>
                  {analysis && analysis.sgpa_prediction ? (
                    <>
                      <div className="chart-container">
                        <Line data={prepareChartData()} options={chartOptions} />
                      </div>
                      
                      <div className="prediction-summary">
                        <h3>Performance Trend: <span className={`trend-${analysis.sgpa_prediction.performance_trend.toLowerCase()}`}>
                          {analysis.sgpa_prediction.performance_trend}
                        </span></h3>
                        <p>
                          Based on your past performance, your academic trajectory is {analysis.sgpa_prediction.performance_trend.toLowerCase()}.
                          {analysis.sgpa_prediction.slope > 0 
                            ? " Keep up the good work!" 
                            : analysis.sgpa_prediction.slope < 0 
                              ? " Consider focusing more on your studies to improve your grades." 
                              : " Your performance is consistent."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="no-data-message">
                      Not enough data to analyze SGPA trends. Please add at least 2 semesters of grades.
                    </p>
                  )}
                </div>
              )}
              
              {activeTab === 'strengths' && (
                <div className="strengths-tab">
                  <h2>Academic Strengths & Weaknesses</h2>
                  {analysis && analysis.strengths_weaknesses ? (
                    <div className="strengths-weaknesses-container">
                      <div className="strengths-section">
                        <h3>Your Strengths</h3>
                        {analysis.strengths_weaknesses.strengths.length > 0 ? (
                          <ul className="strengths-list">
                            {analysis.strengths_weaknesses.strengths.map((strength, index) => (
                              <li key={index} className="strength-item">
                                <div className="strength-name">{strength.category}</div>
                                <div className="strength-score">
                                  <div className="score-bar">
                                    <div 
                                      className="score-fill" 
                                      style={{ width: `${(strength.score / 100) * 100}%` }}
                                    ></div>
                                  </div>
                                  <div className="score-value">{strength.score.toFixed(1)}%</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No clear strengths identified yet.</p>
                        )}
                      </div>
                      
                      <div className="weaknesses-section">
                        <h3>Areas for Improvement</h3>
                        {analysis.strengths_weaknesses.weaknesses.length > 0 ? (
                          <ul className="weaknesses-list">
                            {analysis.strengths_weaknesses.weaknesses.map((weakness, index) => (
                              <li key={index} className="weakness-item">
                                <div className="weakness-name">{weakness.category}</div>
                                <div className="weakness-score">
                                  <div className="score-bar">
                                    <div 
                                      className="score-fill" 
                                      style={{ width: `${(weakness.score / 100) * 100}%` }}
                                    ></div>
                                  </div>
                                  <div className="score-value">{weakness.score.toFixed(1)}%</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No clear weaknesses identified yet.</p>
                        )}
                      </div>
                      
                      <div className="improvement-tips">
                        <h3>Tips for Improvement</h3>
                        <ul>
                          {analysis.strengths_weaknesses.weaknesses.length > 0 ? (
                            analysis.strengths_weaknesses.weaknesses.slice(0, 2).map((weakness, index) => (
                              <li key={index}>
                                <strong>{weakness.category}:</strong> Consider forming study groups, seeking additional resources, or attending extra tutorials for {weakness.category.toLowerCase()} courses.
                              </li>
                            ))
                          ) : (
                            <li>Continue your balanced approach to all subjects.</li>
                          )}
                          <li>Leverage your strengths in {analysis.strengths_weaknesses.strengths.length > 0 
                            ? analysis.strengths_weaknesses.strengths[0].category 
                            : 'your best subjects'} to build confidence.</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="no-data-message">
                      Not enough subject data to analyze strengths and weaknesses.
                    </p>
                  )}
                </div>
              )}
              
              {activeTab === 'recommendations' && (
                <div className="recommendations-tab">
                  <h2>Elective Course Recommendations</h2>
                  {analysis && analysis.elective_recommendations ? (
                    <div className="electives-container">
                      <div className="recommendation-reason">
                        <p>{analysis.elective_recommendations.reason}</p>
                      </div>
                      
                      <div className="electives-grid">
                        {analysis.elective_recommendations.recommended_electives.map((elective, index) => (
                          <div key={index} className="elective-card">
                            <div className="elective-icon">
                              <FaBook />
                            </div>
                            <h3>{elective}</h3>
                            <p className="compatibility">
                              {index === 0 ? 'Excellent' : index === 1 ? 'Great' : index === 2 ? 'Good' : 'Decent'} match
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="recommendation-note">
                        <p>
                          <strong>Note:</strong> These recommendations are based on your academic performance 
                          and strengths. Always consider your personal interests and career goals when 
                          selecting electives.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="no-data-message">
                      Not enough data to provide personalized elective recommendations.
                    </p>
                  )}
                </div>
              )}
              
              {activeTab === 'specialization' && (
                <div className="specialization-tab">
                  <h2>Master's Specialization Guidance</h2>
                  {analysis && analysis.specialization_recommendations ? (
                    <div className="specialization-container">
                      <div className="recommendation-reason">
                        <p>{analysis.specialization_recommendations.reason}</p>
                      </div>
                      
                      <div className="specialization-grid">
                        {analysis.specialization_recommendations.recommended_specializations.map((specialization, index) => (
                          <div key={index} className="specialization-card">
                            <div className="specialization-icon">
                              <FaGraduationCap />
                            </div>
                            <h3>{specialization}</h3>
                            <p className="compatibility">
                              {index === 0 ? 'Excellent' : index === 1 ? 'Great' : index === 2 ? 'Good' : 'Decent'} match
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="career-outlook">
                        <h3>Career Outlook</h3>
                        <p>
                          Specializing in {analysis.specialization_recommendations.recommended_specializations[0]} 
                          can open doors to careers in {getCareerOptions(analysis.specialization_recommendations.recommended_specializations[0])}.
                          The job market for this field is currently {getJobMarketStatus(analysis.specialization_recommendations.recommended_specializations[0])}.
                        </p>
                      </div>
                      
                      <div className="recommendation-note">
                        <p>
                          <strong>Note:</strong> These recommendations are based on your academic performance. 
                          Consider researching the latest industry trends and consulting with academic advisors 
                          before making decisions about graduate studies.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="no-data-message">
                      Not enough data to provide personalized specialization recommendations.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper functions for career information
const getCareerOptions = (specialization) => {
  const careerOptions = {
    'Data Science': 'data analysis, machine learning engineering, and business intelligence',
    'Artificial Intelligence': 'AI research, machine learning engineering, and robotics',
    'Software Engineering': 'software development, DevOps, and system architecture',
    'Computer Science': 'research, software development, and academia',
    'Information Technology': 'IT management, system administration, and cybersecurity',
    'Computer Networks': 'network engineering, cloud infrastructure, and telecommunications',
    'Cybersecurity': 'security analysis, penetration testing, and security architecture',
    'Human-Computer Interaction': 'UX design, product management, and usability research',
    'Theoretical Computer Science': 'research, algorithm development, and academia',
    'Computer Architecture': 'hardware design, embedded systems, and chip development'
  };
  
  return careerOptions[specialization] || 'various technology sectors';
};

const getJobMarketStatus = (specialization) => {
  const jobMarketStatus = {
    'Data Science': 'growing rapidly with high demand for skilled professionals',
    'Artificial Intelligence': 'expanding quickly with significant investment from major tech companies',
    'Software Engineering': 'consistently strong with stable growth projections',
    'Computer Science': 'robust with opportunities across multiple industries',
    'Information Technology': 'stable with steady demand for IT professionals',
    'Computer Networks': 'evolving with the growth of cloud and distributed systems',
    'Cybersecurity': 'experiencing a significant skills shortage and high demand',
    'Human-Computer Interaction': 'growing as companies focus more on user experience',
    'Theoretical Computer Science': 'niche but with stable opportunities in research and academia',
    'Computer Architecture': 'specialized with opportunities in hardware and chip design companies'
  };
  
  return jobMarketStatus[specialization] || 'generally positive with good growth prospects';
};

export default PerformanceAnalyzer;