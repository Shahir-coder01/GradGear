import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaThumbsUp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './NotesPage.css';

// Import branch data files
import CSEData from '../branches/CSE.json';
import ITData from '../branches/IT.json';
import ECEData from '../branches/ECE.json';

const NotesPage = ({ isAuthenticated, onLogout }) => {
  // State variables
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branchData, setBranchData] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    semester: '',
    subject: '',
    link: ''
  });
  
  // Load branch data
  useEffect(() => {
    // Load branch data
    const branchesData = {
      'CSE': CSEData,
      'IT': ITData,
      'ECE': ECEData
    };
    
    setBranchData(branchesData);
    
    // Set available branches
    const availableBranches = [
      { code: 'CSE', name: CSEData.name },
      { code: 'IT', name: ITData.name },
      { code: 'ECE', name: ECEData.name }
    ];
    
    setBranches(availableBranches);
    setIsLoading(false);
  }, []);
  
  // Fetch semesters when branch changes
  useEffect(() => {
    if (!selectedBranch || !branchData[selectedBranch]) {
      setSemesters([]);
      return;
    }
    
    const semesterList = Object.keys(branchData[selectedBranch].semesters);
    setSemesters(semesterList);
  }, [selectedBranch, branchData]);
  
  // Fetch subjects when branch and semester change
  useEffect(() => {
    if (!selectedBranch || !selectedSemester || !branchData[selectedBranch]) {
      setSubjects([]);
      return;
    }
    
    const subjectList = branchData[selectedBranch].semesters[selectedSemester] || [];
    const formattedSubjects = subjectList.map((subject, index) => ({
      code: `${selectedBranch}-${selectedSemester}-${index}`,
      name: subject
    }));
    
    setSubjects(formattedSubjects);
  }, [selectedBranch, selectedSemester, branchData]);
  
  // Fetch notes when filters change
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        
        // Fetch from API with filters
        const response = await axios.get('http://127.0.0.1:8000/api/notes/', {
          params: {
            branch: selectedBranch,
            semester: selectedSemester,
            subject: selectedSubject,
            search: searchQuery,
            status: 'approved' // Only show approved notes
          }
        });
        
        setNotes(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('Failed to fetch notes. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [selectedBranch, selectedSemester, selectedSubject, searchQuery]);
  
  // Handle branch change
  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
    setSelectedSemester(''); // Reset semester when branch changes
    setSelectedSubject(''); // Reset subject when branch changes
  };

  // Handle semester change
  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
    setSelectedSubject(''); // Reset subject when semester changes
  };

  // Handle subject change
  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Prepare data to match your model
      const noteData = {
        name: formData.name,
        branch: formData.branch,
        semester: formData.semester,
        subject: formData.subject,
        link: formData.link,
        status: 'pending',
        rating: 0
      };
      
      // Submit to API without authentication
      await axios.post('http://127.0.0.1:8000/api/notes/', noteData);
      
      // Show success message
      alert('Notes submitted for approval! They will be visible after admin review.');
      
      // Reset form and close modal
      setFormData({
        name: '',
        branch: '',
        semester: '',
        subject: '',
        link: ''
      });
      setShowAddForm(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting notes:', error);
      
      // Show more detailed error information
      let errorMessage = 'Failed to submit notes. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };
  
  // Handle upvote
  const handleUpvote = async (note) => {
    try {
      // Increment rating by 1
      const response = await axios.post(`http://127.0.0.1:8000/api/notes/${note.note_id}/upvote/`);
      
      // Update the note in the notes array
      const updatedNotes = notes.map(n => 
        n.note_id === note.note_id ? {...n, rating: response.data.new_rating} : n
      );
      
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error upvoting note:', error);
      setError('Failed to upvote. Please try again.');
    }
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />

      <div className="notes-page">
        <h1 className="">Study Notes</h1>
        <p className="">Access comprehensive study materials for your courses</p>
        
        <div className="notes-container">
          <div className="filters-section">
            <h2>Filters</h2>
            <button 
              className="reset-button" 
              onClick={() => {
                setSelectedBranch('');
                setSelectedSemester('');
                setSelectedSubject('');
                setSearchQuery('');
              }}
            >
              Reset
            </button>
            
            {/* Branch Filter */}
            <div className="filter-group">
              <label>Branch</label>
              <select value={selectedBranch} onChange={handleBranchChange}>
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.code} value={branch.code}>{branch.name}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Semester</label>
              <select 
                value={selectedSemester} 
                onChange={handleSemesterChange}
                disabled={!selectedBranch}
              >
                <option value="">Select Semester</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Subject</label>
              <select 
                value={selectedSubject} 
                onChange={handleSubjectChange}
                disabled={!selectedSemester}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.code} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="notes-content">
            <div className="notes-header">
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search notes" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
              
              <div className="header-actions">
                <button className="add-notes-btn" onClick={() => setShowAddForm(true)}>
                  <FaPlus /> Add Notes
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading notes...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="error-container">
                <p>{error}</p>
                <button onClick={() => setError(null)}>Try Again</button>
              </div>
            )}
            
            <div className="notes-grid">
              {!isLoading && !error && notes.length > 0 ? (
                notes.map(note => (
                  <div key={note.note_id} className="note-card">
                    <div className="note-info">
                      <h3>{note.name}</h3>
                      <p className="note-subject">{note.subject}</p>
                      <p className="note-semester">{note.semester} • {note.branch}</p>
                    </div>
                    <div className="note-actions">
                      <div className="rating-container">
                        <span>{note.rating}</span>
                        <button 
                          className="upvote-btn"
                          onClick={() => handleUpvote(note)}
                          title="Upvote this note"
                        >
                          <FaThumbsUp />
                        </button>
                      </div>
                      <a 
                        href={note.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="download-btn"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                !isLoading && !error && (
                  <div className="no-notes">
                    <p>Select a branch, semester, and subject to view available notes</p>
                    {selectedBranch && selectedSemester && selectedSubject && (
                      <p>No notes available for the selected filters</p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Notes Form */}
      {showAddForm && (
        <div className="popup-form-overlay" onClick={() => setShowAddForm(false)}>
          <div className="add-notes-form" onClick={e => e.stopPropagation()}>
            <h2>Add New Notes</h2>
            <p className="form-info">
              Submitted notes will be reviewed by an administrator before being published.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title*</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  placeholder="Enter notes title"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Branch*</label>
                  <select 
                    name="branch" 
                    value={formData.branch} 
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.code} value={branch.code}>{branch.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Semester*</label>
                  <select 
                    name="semester" 
                    value={formData.semester} 
                    onChange={handleInputChange}
                    required
                    disabled={!formData.branch}
                  >
                    <option value="">Select Semester</option>
                    {formData.branch && branchData[formData.branch] && 
                      Object.keys(branchData[formData.branch].semesters).map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Subject*</label>
                <select 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleInputChange}
                  required
                  disabled={!formData.semester || !formData.branch}
                >
                  <option value="">Select Subject</option>
                  {formData.branch && formData.semester && branchData[formData.branch] && 
                    branchData[formData.branch].semesters[formData.semester] &&
                    branchData[formData.branch].semesters[formData.semester].map((subject, index) => (
                      <option key={index} value={subject}>{subject}</option>
                    ))
                  }
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes Link (Google Drive, OneDrive, etc.)*</label>
                <input 
                  type="url" 
                  name="link" 
                  value={formData.link} 
                  onChange={handleInputChange}
                  placeholder="Enter link to your notes (e.g., Google Drive link)"
                  required
                />
                <small className="form-helper">
                  Please make sure your link is publicly accessible
                </small>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;