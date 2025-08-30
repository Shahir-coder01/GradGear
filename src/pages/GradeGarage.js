import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave, FaUndo } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './GradeGarage.css';

// Import all syllabi
import CSESyllabus from '../branches/CSE.json';
import ECESyllabus from '../branches/ECE.json';
import EEESyllabus from '../branches/EEE.json';
import MESyllabus from '../branches/ME.json';
import CESyllabus from '../branches/CE.json';

const GradeGarage = ({ onLogout }) => {
  const [semesters, setSemesters] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [isChangingBranch, setIsChangingBranch] = useState(false);

  // Branch options with data from JSON files
  const branchOptions = [
    { value: CSESyllabus.code, label: CSESyllabus.name },
    { value: ECESyllabus.code, label: ECESyllabus.name },
    { value: EEESyllabus.code, label: EEESyllabus.name },
    { value: MESyllabus.code, label: MESyllabus.name },
    { value: CESyllabus.code, label: CESyllabus.name }
  ];

  // Map of syllabi by branch code
  const syllabiByBranch = {
    [CSESyllabus.code]: CSESyllabus.semesters,
    [ECESyllabus.code]: ECESyllabus.semesters,
    [EEESyllabus.code]: EEESyllabus.semesters,
    [MESyllabus.code]: MESyllabus.semesters,
    [CESyllabus.code]: CESyllabus.semesters
  };

  // Grade mapping for CUSAT grading system
  const gradeMapping = {
    S: { min: 90, max: 100, points: 10 },
    A: { min: 85, max: 89.99, points: 9 },
    B: { min: 80, max: 84.99, points: 8 },
    C: { min: 70, max: 79.99, points: 7 },
    D: { min: 60, max: 69.99, points: 6 },
    E: { min: 50, max: 59.99, points: 5 },
    F: { min: 0, max: 49.99, points: 0 }
  };

  // Load user data and saved semesters
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get user data from localStorage
        const token = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (token && userInfo) {
          const userData = JSON.parse(userInfo);
          setUserData(userData);
          
          // Load saved semesters from localStorage
          const savedSemesters = localStorage.getItem(`gradeGarage_${userData.email}_${selectedBranch}`);
          if (savedSemesters) {
            setSemesters(JSON.parse(savedSemesters));
          } else {
            setSemesters([]);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load your academic records');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [selectedBranch]);

  // Save semesters to localStorage whenever they change
  useEffect(() => {
    if (userData && semesters.length > 0) {
      localStorage.setItem(`gradeGarage_${userData.email}_${selectedBranch}`, JSON.stringify(semesters));
    }
  }, [semesters, userData, selectedBranch]);

  // Handle branch change
  const handleBranchChange = (e) => {
    setIsChangingBranch(true);
    setSelectedBranch(e.target.value);
    // Add a small delay to show loading animation
    setTimeout(() => {
      setIsChangingBranch(false);
    }, 500);
  };

  const addSemester = () => {
    // Get the next semester number
    const nextSemesterNumber = semesters.length + 1;
    if (nextSemesterNumber > 8) {
      setError('Maximum of 8 semesters allowed');
      return;
    }
    
    const semesterName = `Semester ${nextSemesterNumber}`;
    
    const newSemester = {
      id: `${selectedBranch}-${Date.now().toString()}`,
      name: semesterName,
      number: nextSemesterNumber,
      createdAt: new Date().toISOString(),
      subjects: [],
      isAddingSubject: false,
      newSubject: { name: '', marks: '', credits: 3 }
    };
    
    setSemesters([...semesters, newSemester]);
    setError('');
  };

  const deleteSemester = (semesterId) => {
    if (window.confirm('Are you sure you want to delete this semester? This action cannot be undone.')) {
      setSemesters(semesters.filter(semester => semester.id !== semesterId));
    }
  };

  const toggleAddSubject = (semesterId) => {
    setSemesters(semesters.map(semester => 
      semester.id === semesterId 
        ? { ...semester, isAddingSubject: !semester.isAddingSubject }
        : semester
    ));
  };

  const handleNewSubjectChange = (semesterId, field, value) => {
    setSemesters(semesters.map(semester => 
      semester.id === semesterId 
        ? { 
            ...semester, 
            newSubject: { 
              ...semester.newSubject, 
              [field]: value 
            } 
          }
        : semester
    ));
  };

  const addSubject = (semesterId) => {
    const semester = semesters.find(s => s.id === semesterId);
    
    if (!semester.newSubject.name.trim() || !semester.newSubject.marks.trim()) {
      setError('Please enter both subject name and marks');
      return;
    }
    
    const marks = parseFloat(semester.newSubject.marks);
    const credits = parseFloat(semester.newSubject.credits);
    
    if (isNaN(marks) || marks < 0 || marks > 100) {
      setError('Marks must be a number between 0 and 100');
      return;
    }
    
    if (isNaN(credits) || credits <= 0) {
      setError('Credits must be a positive number');
      return;
    }
    
    // Calculate grade based on marks
    const grade = Object.keys(gradeMapping).find(grade => 
      marks >= gradeMapping[grade].min && marks <= gradeMapping[grade].max
    );
    
    // Prepare the subject name (handle custom subjects)
    const subjectName = semester.newSubject.name === "Other" 
      ? semester.newSubject.customName 
      : semester.newSubject.name;
      
    if (!subjectName || subjectName.trim() === '') {
      setError('Please enter a valid subject name');
      return;
    }
    
    // Check if subject already exists
    if (semester.subjects.some(s => s.name === subjectName)) {
      setError('This subject already exists in this semester');
      return;
    }
    
    const newSubject = {
      id: Date.now().toString(),
      name: subjectName,
      marks,
      credits,
      grade,
      gradePoints: gradeMapping[grade].points,
      createdAt: new Date().toISOString(),
      isEditing: false
    };
    
    setSemesters(semesters.map(s => 
      s.id === semesterId 
        ? { 
            ...s, 
            subjects: [...s.subjects, newSubject],
            isAddingSubject: false,
            newSubject: { name: '', marks: '', credits: 3 }
          }
        : s
    ));
    
    setError('');
  };

  const toggleEditSubject = (semesterId, subjectId) => {
    setSemesters(semesters.map(semester => 
      semester.id === semesterId 
        ? { 
            ...semester, 
            subjects: semester.subjects.map(subject => 
              subject.id === subjectId 
                ? { ...subject, isEditing: !subject.isEditing }
                : subject
            )
          }
        : semester
    ));
  };

  const handleEditSubjectChange = (semesterId, subjectId, field, value) => {
    setSemesters(semesters.map(semester => 
      semester.id === semesterId 
        ? { 
            ...semester, 
            subjects: semester.subjects.map(subject => 
              subject.id === subjectId 
                ? { ...subject, [field]: value }
                : subject
            )
          }
        : semester
    ));
  };

  const updateSubject = (semesterId, subjectId) => {
    const semester = semesters.find(s => s.id === semesterId);
    const subject = semester.subjects.find(s => s.id === subjectId);
    
    if (!subject.name.trim() || isNaN(parseFloat(subject.marks))) {
      setError('Please enter both subject name and valid marks');
      return;
    }
    
    const marks = parseFloat(subject.marks);
    const credits = parseFloat(subject.credits);
    
    if (marks < 0 || marks > 100) {
      setError('Marks must be between 0 and 100');
      return;
    }
    
    if (credits <= 0) {
      setError('Credits must be a positive number');
      return;
    }
    
    // Calculate grade based on marks
    const grade = Object.keys(gradeMapping).find(grade => 
      marks >= gradeMapping[grade].min && marks <= gradeMapping[grade].max
    );
    
    // Prepare the subject name (handle custom subjects)
    const subjectName = subject.name === "Other" 
      ? subject.customName 
      : subject.name;
      
    if (!subjectName || subjectName.trim() === '') {
      setError('Please enter a valid subject name');
      return;
    }
    
    setSemesters(semesters.map(s => 
      s.id === semesterId 
        ? { 
            ...s, 
            subjects: s.subjects.map(subj => 
              subj.id === subjectId 
                ? { 
                    ...subj, 
                    name: subjectName,
                    marks, 
                    credits, 
                    grade, 
                    gradePoints: gradeMapping[grade].points, 
                    updatedAt: new Date().toISOString(),
                    isEditing: false 
                  }
                : subj
            )
          }
        : s
    ));
    
    setError('');
  };

  const deleteSubject = (semesterId, subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSemesters(semesters.map(semester => 
        semester.id === semesterId 
          ? { 
              ...semester, 
              subjects: semester.subjects.filter(subject => subject.id !== subjectId)
            }
          : semester
      ));
    }
  };

  const calculateSGPA = (subjects) => {
    if (!subjects.length) return 'N/A';
    
    const totalCreditPoints = subjects.reduce((sum, subject) => 
      sum + (subject.credits * subject.gradePoints), 0);
    
    const totalCredits = subjects.reduce((sum, subject) => 
      sum + subject.credits, 0);
    
    return (totalCreditPoints / totalCredits).toFixed(2);
  };

  const calculateCGPA = () => {
    // CGPA is average of SGPAs
    const semestersWithSubjects = semesters.filter(sem => sem.subjects.length > 0);
    
    if (semestersWithSubjects.length === 0) return 'N/A';
    
    const sgpaSum = semestersWithSubjects.reduce((sum, semester) => {
      const sgpa = parseFloat(calculateSGPA(semester.subjects));
      return sum + (isNaN(sgpa) ? 0 : sgpa);
    }, 0);
    
    return (sgpaSum / semestersWithSubjects.length).toFixed(2);
  };

  if (isLoading) {
    return (
      <div>
        <Navbar isAuthenticated={true} onLogout={onLogout} />
        <div className="grade-garage-loading">
          <div className="loading-spinner"></div>
          <p>Loading your academic records...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar isAuthenticated={true} onLogout={onLogout} />
      <div className="grade-garage-container">
        <div className="grade-garage-header">
          <h1>GradeGarage</h1>
          <p>Store and track your academic performance across semesters</p>
          
          <div className="branch-selector">
            <label htmlFor="branch-select">Select Branch:</label>
            <select 
              id="branch-select" 
              value={selectedBranch}
              onChange={handleBranchChange}
              className="branch-select"
            >
              {branchOptions.map((branch, index) => (
                <option key={`${branch.value}-${index}`} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="cgpa-banner">
            <div className="cgpa-value">
              <h2>CGPA</h2>
              <div className="cgpa-number">{calculateCGPA()}</div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="grade-garage-actions">
            {semesters.length < 8 && (
              <button onClick={addSemester} className="add-semester-button">
                <FaPlus /> Add Semester {semesters.length + 1}
              </button>
            )}
          </div>
        </div>
        
        <div className={`semesters-grid ${isChangingBranch ? 'branch-changing' : ''}`}>
          {semesters.map(semester => (
            <div key={semester.id} className="semester-card">
              <div className="semester-header">
                <h2>{semester.name}</h2>
                <button
                  onClick={() => deleteSemester(semester.id)}
                  className="delete-semester-button"
                  title="Delete Semester"
                >
                  <FaTrash />
                </button>
              </div>
              
              <div className="subjects-container">
                {semester.subjects.map(subject => (
                  <div key={subject.id} className="subject-item">
                    {subject.isEditing ? (
                      <div className="subject-edit-form">
                        <select
                          value={subject.name}
                          onChange={(e) => handleEditSubjectChange(semester.id, subject.id, 'name', e.target.value)}
                        >
                          <option value="">Select Subject</option>
                          {syllabiByBranch[selectedBranch][semester.name] && 
                           syllabiByBranch[selectedBranch][semester.name].map((subj, idx) => (
                            <option key={idx} value={subj}>{subj}</option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                        {subject.name === "Other" && (
                          <input
                            type="text"
                            placeholder="Enter subject name"
                            value={subject.customName || ""}
                            onChange={(e) => handleEditSubjectChange(semester.id, subject.id, 'customName', e.target.value)}
                          />
                        )}
                        <div className="marks-credits-group">
                          <div className="input-group">
                            <label>Marks</label>
                            <input
                              type="number"
                              value={subject.marks}
                              onChange={(e) => handleEditSubjectChange(semester.id, subject.id, 'marks', e.target.value)}
                              placeholder="Marks"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div className="input-group">
                            <label>Credits</label>
                            <input
                              type="number"
                              value={subject.credits}
                              onChange={(e) => handleEditSubjectChange(semester.id, subject.id, 'credits', e.target.value)}
                              placeholder="Credits"
                              min="0.5"
                              step="0.5"
                            />
                          </div>
                        </div>
                        <div className="edit-actions">
                          <button onClick={() => updateSubject(semester.id, subject.id)} className="action-button save">
                            <FaSave />
                          </button>
                          <button onClick={() => toggleEditSubject(semester.id, subject.id)} className="action-button cancel">
                            <FaUndo />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="subject-display">
                        <div className="subject-name">{subject.name}</div>
                        <div className="subject-details">
                          <div className="subject-marks">
                            <span className="detail-label">Marks:</span>
                            <span className="detail-value">{subject.marks}</span>
                          </div>
                          <div className="subject-credits">
                            <span className="detail-label">Credits:</span>
                            <span className="detail-value">{subject.credits}</span>
                          </div>
                          <div className={`subject-grade grade-${subject.grade}`}>
                            <span className="detail-label">Grade:</span>
                            <span className="detail-value">{subject.grade}</span>
                          </div>
                        </div>
                        <div className="subject-actions">
                          <button onClick={() => toggleEditSubject(semester.id, subject.id)} className="action-button edit">
                            <FaEdit />
                          </button>
                          <button onClick={() => deleteSubject(semester.id, subject.id)} className="action-button delete">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {semester.isAddingSubject ? (
                  <div className="add-subject-form">
                    <select
                      value={semester.newSubject.name}
                      onChange={(e) => handleNewSubjectChange(semester.id, 'name', e.target.value)}
                    >
                      <option value="">Select Subject</option>
                      {syllabiByBranch[selectedBranch][semester.name] && 
                       syllabiByBranch[selectedBranch][semester.name].map((subject, idx) => (
                        <option key={idx} value={subject}>{subject}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {semester.newSubject.name === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter subject name"
                        value={semester.newSubject.customName || ""}
                        onChange={(e) => handleNewSubjectChange(semester.id, 'customName', e.target.value)}
                      />
                    )}
                    <div className="marks-credits-group">
                      <div className="input-group">
                        <label>Marks</label>
                        <input
                          type="number"
                          placeholder="Marks"
                          value={semester.newSubject.marks}
                          onChange={(e) => handleNewSubjectChange(semester.id, 'marks', e.target.value)}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="input-group">
                        <label>Credits</label>
                        <input
                          type="number"
                          placeholder="Credits"
                          value={semester.newSubject.credits}
                          onChange={(e) => handleNewSubjectChange(semester.id, 'credits', e.target.value)}
                          min="0.5"
                          step="0.5"
                        />
                      </div>
                    </div>
                    <div className="add-subject-actions">
                      <button onClick={() => addSubject(semester.id)} className="action-button save">
                        <FaSave /> Save
                      </button>
                      <button onClick={() => toggleAddSubject(semester.id)} className="action-button cancel">
                        <FaUndo /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => toggleAddSubject(semester.id)} className="add-subject-button">
                    <FaPlus /> Add Subject
                  </button>
                )}
              </div>
              
              <div className="semester-footer">
                <div className="sgpa-display">
                  <span>SGPA:</span>
                  <strong>{calculateSGPA(semester.subjects)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {semesters.length === 0 && (
          <div className="empty-state">
            <h2>No semesters found</h2>
            <p>Start tracking your academic journey by adding your first semester.</p>
            <button onClick={addSemester} className="add-semester-button">
              <FaPlus /> Add Semester 1
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeGarage;