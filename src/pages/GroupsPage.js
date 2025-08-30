import React, { useState, useEffect } from 'react';
import { FaSearch, FaWhatsapp, FaInstagram, FaLinkedin, FaPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './GroupsPage.css';

const GroupsPage = ({ isAuthenticated, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    group_name: '',
    group_type: 'academic', // Default value
    description: '',
    whatsapp: '',
    instagram: '',
    linkedin: ''
  });
  
  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        
        // Fetch from API with search filter
        const response = await axios.get('http://127.0.0.1:8000/api/groups/', {
          params: {
            search: searchQuery,
            status: 'approved' // Only show approved groups
          }
        });
        
        setGroups(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Failed to fetch groups. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchGroups();
  }, [searchQuery]);
  
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
      const groupData = {
        group_name: formData.group_name,
        group_type: formData.group_type,
        description: formData.description,
        whatsapp: formData.whatsapp || null,
        instagram: formData.instagram || null,
        linkedin: formData.linkedin || null,
        status: 'pending'
      };
      
      // Submit to API without authentication
      await axios.post('http://127.0.0.1:8000/api/groups/', groupData);
      
      // Show success message
      alert('Group submitted for approval! It will be visible after admin review.');
      
      // Reset form and close modal
      setFormData({
        group_name: '',
        group_type: 'academic',
        description: '',
        whatsapp: '',
        instagram: '',
        linkedin: ''
      });
      setShowAddForm(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting group:', error);
      
      // Show more detailed error information
      let errorMessage = 'Failed to submit group. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };
  
  // Filter groups by category
  const academicGroups = groups.filter(group => group.group_type === 'academic');
  const clubGroups = groups.filter(group => group.group_type === 'club');

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      
      <div className="groups-page">
        <h1 className="page-title">Student Groups</h1>
        <p className="page-subtitle">Connect with your classmates and join academic groups and clubs</p>
        
        <div className="groups-header">
          <div className="search-container">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search for groups..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>
          
          <button className="add-group-btn" onClick={() => setShowAddForm(true)}>
            <FaPlus /> Add Group
          </button>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading groups...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Try Again</button>
          </div>
        )}
        
        {!isLoading && !error && (
          <>
            <div className="groups-section">
              <h2 className="section-title">Academic Groups</h2>
              <div className="groups-grid">
                {academicGroups.length > 0 ? (
                  academicGroups.map(group => (
                    <div key={group.group_id} className="group-card">
                      <div className="group-circle">
                        <span className="group-name">{group.group_name}</span>
                      </div>
                      <div className="group-description">
                        <p>{group.description}</p>
                      </div>
                      <div className="social-links">
                        {group.whatsapp && (
                          <a href={group.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link whatsapp" title="Join WhatsApp Group">
                            <FaWhatsapp />
                          </a>
                        )}
                        {group.instagram && (
                          <a href={group.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Follow on Instagram">
                            <FaInstagram />
                          </a>
                        )}
                        {group.linkedin && (
                          <a href={group.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="Connect on LinkedIn">
                            <FaLinkedin />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-results">No academic groups found matching your search.</p>
                )}
              </div>
            </div>
            
            <div className="groups-section">
              <h2 className="section-title">Clubs</h2>
              <div className="groups-grid">
                {clubGroups.length > 0 ? (
                  clubGroups.map(group => (
                    <div key={group.group_id} className="group-card">
                      <div className="group-circle">
                        <span className="group-name">{group.group_name}</span>
                      </div>
                      <div className="group-description">
                        <p>{group.description}</p>
                      </div>
                      <div className="social-links">
                        {group.whatsapp && (
                          <a href={group.whatsapp} target="_blank" rel="noopener noreferrer" className="social-link whatsapp" title="Join WhatsApp Group">
                            <FaWhatsapp />
                          </a>
                        )}
                        {group.instagram && (
                          <a href={group.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Follow on Instagram">
                            <FaInstagram />
                          </a>
                        )}
                        {group.linkedin && (
                          <a href={group.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="Connect on LinkedIn">
                            <FaLinkedin />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-results">No clubs found matching your search.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Add Group Form */}
      {showAddForm && (
        <div className="popup-form-overlay" onClick={() => setShowAddForm(false)}>
          <div className="add-group-form" onClick={e => e.stopPropagation()}>
            <h2>Add New Group</h2>
            <p className="form-info">
              Submitted groups will be reviewed by an administrator before being published.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Group Name*</label>
                <input 
                  type="text" 
                  name="group_name" 
                  value={formData.group_name} 
                  onChange={handleInputChange}
                  placeholder="Enter group name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Group Type*</label>
                <select 
                  name="group_type" 
                  value={formData.group_type} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="academic">Academic Group</option>
                  <option value="club">Club</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description*</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  placeholder="Enter group description"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>WhatsApp Link</label>
                <input 
                  type="url" 
                  name="whatsapp" 
                  value={formData.whatsapp} 
                  onChange={handleInputChange}
                  placeholder="Enter WhatsApp group link (optional)"
                />
              </div>
              
              <div className="form-group">
                <label>Instagram Link</label>
                <input 
                  type="url" 
                  name="instagram" 
                  value={formData.instagram} 
                  onChange={handleInputChange}
                  placeholder="Enter Instagram page link (optional)"
                />
              </div>
              
              <div className="form-group">
                <label>LinkedIn Link</label>
                <input 
                  type="url" 
                  name="linkedin" 
                  value={formData.linkedin} 
                  onChange={handleInputChange}
                  placeholder="Enter LinkedIn group link (optional)"
                />
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

export default GroupsPage;