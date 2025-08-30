import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlay, FaPlus, FaYoutube, FaUpload, FaFilter, FaThumbsUp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './LecturesPage.css';

// Import branch data files
import CSEData from '../branches/CSE.json';
import ITData from '../branches/IT.json';
import ECEData from '../branches/ECE.json';

const LecturesPage = ({ isAuthenticated, onLogout }) => {
  // State variables
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lectures, setLectures] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
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
    videoType: 'youtube',
    youtubeId: '',
    videoLink: ''
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
  
  // Fetch lectures when filters change
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, fetch from API with filters
        const response = await axios.get('http://127.0.0.1:8000/api/lectures/', {
          params: {
            branch: selectedBranch,
            semester: selectedSemester,
            subject: selectedSubject,
            search: searchQuery,
            status: 'approved' // Only show approved lectures
          }
        });
        
        setLectures(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching lectures:', error);
        setError('Failed to fetch lectures. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchLectures();
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

  // Group lectures by subject
  const groupedLectures = lectures.reduce((groups, lecture) => {
    if (!groups[lecture.subject]) {
      groups[lecture.subject] = [];
    }
    
    groups[lecture.subject].push(lecture);
    return groups;
  }, {});

  // Handle play video
  const handlePlayVideo = (lecture) => {
    setActiveVideo(lecture);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close video player
  const handleCloseVideo = () => {
    setActiveVideo(null);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Extract YouTube ID from URL
  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Prepare data to match your model
      const lectureData = {
        name: formData.name,
        branch: formData.branch,
        semester: formData.semester,
        subject: formData.subject,
        status: 'pending',
        rating: 0
      };
      
      // Handle video link based on type
      if (formData.videoType === 'youtube') {
        // Extract YouTube ID if full URL is provided
        const youtubeId = formData.youtubeId.includes('youtube.com') || formData.youtubeId.includes('youtu.be') 
          ? extractYoutubeId(formData.youtubeId) 
          : formData.youtubeId;
          
        lectureData.link = `https://www.youtube.com/watch?v=${youtubeId}`;
      } else {
        // Use the provided video link
        lectureData.link = formData.videoLink;
      }
      
      // Submit to API without authentication
      await axios.post('http://127.0.0.1:8000/api/lectures/', lectureData);
      
      // Show success message
      alert('Lecture submitted for approval! It will be visible after admin review.');
      
      // Reset form and close modal
      setFormData({
        name: '',
        branch: '',
        semester: '',
        subject: '',
        videoType: 'youtube',
        youtubeId: '',
        videoLink: ''
      });
      setShowAddForm(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting lecture:', error);
      setError('Failed to submit lecture. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Handle upvote
  const handleUpvote = async (lecture) => {
    try {
      // Increment rating by 1
      const response = await axios.post(`http://127.0.0.1:8000/api/lectures/${lecture.lecture_id}/upvote/`);
      
      // Update the lecture in the lectures array
      const updatedLectures = lectures.map(lec => 
        lec.lecture_id === lecture.lecture_id ? {...lec, rating: response.data.new_rating} : lec
      );
      
      setLectures(updatedLectures);
      
      // If this is the active video, update it too
      if (activeVideo && activeVideo.lecture_id === lecture.lecture_id) {
        setActiveVideo({...activeVideo, rating: response.data.new_rating});
      }
    } catch (error) {
      console.error('Error upvoting lecture:', error);
      setError('Failed to upvote. Please try again.');
    }
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      
      <div className="lectures-page">
        <h1 className="">Video Lectures</h1>
        <p className="">Access video lectures for all subjects in your curriculum</p>
        
        {/* Video Player */}
        {activeVideo && (
          <div className="video-player-container">
            <div className="video-player-wrapper">
              <div className="video-header">
                <div>
                  <h2>{activeVideo.name}</h2>
                  <p>{activeVideo.subject}</p>
                </div>
                <button className="close-video-btn" onClick={handleCloseVideo}>×</button>
              </div>
              
              {/* Video Display */}
              <div className="video-responsive">
                {activeVideo.link && activeVideo.link.includes('youtube.com') ? (
                  <iframe
                    width="853"
                    height="480"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(activeVideo.link)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeVideo.name}
                  ></iframe>
                ) : (
                  <video 
                    controls 
                    width="853" 
                    height="480"
                    src={activeVideo.link}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              {/* Upvote Section */}
              <div className="video-rating-section">
                <div className="current-rating">
                  <h3>Rating: {activeVideo.rating}</h3>
                </div>
                
                <div className="upvote-container">
                  <button 
                    className="upvote-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpvote(activeVideo);
                    }}
                  >
                    <FaThumbsUp className="upvote-icon" />
                    <span>Upvote</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="lectures-container">
          {/* Filters Section */}
          <div className="filters-section">
            <h2>Filters <FaFilter className="filter-icon" /></h2>
            <button className="reset-button" onClick={() => {
              setSelectedBranch('');
              setSelectedSemester('');
              setSelectedSubject('');
              setSearchQuery('');
            }}>Reset</button>
            
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
            
            {/* Semester Filter */}
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
            
            {/* Subject Filter */}
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
          
          {/* Lectures Content */}
          <div className="lectures-content">
            <div className="lectures-header">
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search lectures" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
              
              <div className="header-actions">
                <button className="add-lecture-btn" onClick={() => setShowAddForm(true)}>
                  <FaPlus /> Add Lecture
                </button>
              </div>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Loading lectures...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="error-container">
                <p>{error}</p>
                <button onClick={() => setError(null)}>Try Again</button>
              </div>
            )}
            
            {/* Lectures List */}
            <div className="lectures-list">
              {!isLoading && !error && Object.keys(groupedLectures).length > 0 ? (
                Object.entries(groupedLectures).map(([subject, subjectLectures]) => (
                  <div key={subject} className="subject-section">
                    <h2 className="subject-title">{subject}</h2>
                    
                    <div className="lectures-grid">
                      {subjectLectures.map(lecture => (
                        <div key={lecture.lecture_id} className="lecture-card">
                          <div className="thumbnail-container" onClick={() => handlePlayVideo(lecture)}>
                            {lecture.link && lecture.link.includes('youtube.com') ? (
                              <img 
                                src={`https://img.youtube.com/vi/${extractYoutubeId(lecture.link)}/mqdefault.jpg`} 
                                alt={lecture.name} 
                                className="lecture-thumbnail"
                              />
                            ) : (
                              <div className="video-thumbnail-placeholder">
                                <FaPlay className="placeholder-icon" />
                              </div>
                            )}
                            <div className="play-overlay">
                              <FaPlay className="play-icon" />
                            </div>
                          </div>
                          <div className="lecture-info">
                            <h4 className="lecture-title" onClick={() => handlePlayVideo(lecture)}>
                              {lecture.name}
                            </h4>
                            <div className="lecture-stats">
                              <div className="rating-upvote-container">
                                <span>Rating: {lecture.rating}</span>
                                <button 
                                  className="upvote-icon-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpvote(lecture);
                                  }}
                                  title="Upvote this lecture"
                                >
                                  <FaThumbsUp />
                                </button>
                              </div>
                            </div>
                            <div className="lecture-source">
                              {lecture.link && lecture.link.includes('youtube.com') ? (
                                <span className="youtube-badge">
                                  <FaYoutube className="youtube-icon" /> YouTube
                                </span>
                              ) : (
                                <span className="upload-badge">
                                  <FaUpload className="upload-icon" /> External Video
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                !isLoading && !error && (
                  <div className="no-lectures">
                    <p>Select a branch, semester, and subject to view available lectures</p>
                    {selectedBranch && selectedSemester && selectedSubject && (
                      <p>No lectures available for the selected filters</p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Lecture Form */}
      {showAddForm && (
        <div className="popup-form-overlay" onClick={() => setShowAddForm(false)}>
          <div className="add-lecture-form" onClick={e => e.stopPropagation()}>
            <h2>Add New Lecture</h2>
            <p className="form-info">
              Submitted lectures will be reviewed by an administrator before being published.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title*</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  placeholder="Enter lecture title"
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
                <label>Video Type*</label>
                <div className="video-type-selector">
                  <div 
                    className={`video-type-option ${formData.videoType === 'youtube' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, videoType: 'youtube'})}
                  >
                    <FaYoutube className="option-icon youtube" />
                    <span>YouTube</span>
                  </div>
                  <div 
                    className={`video-type-option ${formData.videoType === 'upload' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, videoType: 'upload'})}
                  >
                    <FaUpload className="option-icon upload" />
                    <span>External Video</span>
                  </div>
                </div>
              </div>
              
              {formData.videoType === 'youtube' ? (
                <div className="form-group">
                  <label>YouTube Video ID or URL*</label>
                  <input 
                    type="text" 
                    name="youtubeId" 
                    value={formData.youtubeId} 
                    onChange={handleInputChange}
                    placeholder="e.g., dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    required
                  />
                  <small className="form-helper">
                    Enter either the YouTube video ID or the full URL of the video
                  </small>
                </div>
              ) : (
                <div className="form-group">
                  <label>Video Link*</label>
                  <input 
                    type="url" 
                    name="videoLink" 
                    value={formData.videoLink} 
                    onChange={handleInputChange}
                    placeholder="Enter direct link to the video (e.g., https://example.com/video.mp4)"
                    required
                  />
                  <small className="form-helper">
                    Enter a direct link to the video file or streaming URL
                  </small>
                </div>
              )}
              
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

export default LecturesPage;