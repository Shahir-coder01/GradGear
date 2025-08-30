import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import { FaVideo, FaCheck, FaTimes, FaSearch, FaBook, FaFileAlt, FaUserFriends } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lectures');
  const [activeStatus, setActiveStatus] = useState('pending');
  
  // State for different content types
  const [lectures, setLectures] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  
  // Fetch data on component mount
  // Fetch data when status changes
useEffect(() => {
    fetchData();
  }, [activeStatus]);
  
  // Fetch data from backend
  // Fetch data from backend
const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch lectures with pending status
      const lecturesResponse = await axios.get('http://127.0.0.1:8000/api/lectures/', {
        params: { status: activeStatus }
      });
      
      // Fetch notes with pending status
      const notesResponse = await axios.get('http://127.0.0.1:8000/api/notes/', {
        params: { status: activeStatus }
      });
      
      // Fetch PYQs with pending status
      const pyqsResponse = await axios.get('http://127.0.0.1:8000/api/pyqs/', {
        params: { status: activeStatus }
      });
      
      // Fetch groups with pending status
      const groupsResponse = await axios.get('http://127.0.0.1:8000/api/groups/', {
        params: { status: activeStatus }
      });
      
      setLectures(lecturesResponse.data);
      setNotes(notesResponse.data);
      setPyqs(pyqsResponse.data);
      setGroups(groupsResponse.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Filter items based on search query and filters
  const filterItems = (items) => {
    return items.filter(item => {
      // Search query filter - adjust properties based on item type
      const matchesSearch = 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.group_name && item.group_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Branch filter
      const matchesBranch = filterBranch ? item.branch === filterBranch : true;
      
      // Semester filter
      const matchesSemester = filterSemester ? item.semester === filterSemester : true;
      
      // Status filter
      const matchesStatus = activeStatus === 'all' ? true : item.status === activeStatus;
      
      return matchesSearch && matchesBranch && matchesSemester && matchesStatus;
    });
  };
  
  // Get current items based on active tab
  const getCurrentItems = () => {
    switch (activeTab) {
      case 'lectures':
        return filterItems(lectures);
      case 'notes':
        return filterItems(notes);
      case 'pyqs':
        return filterItems(pyqs);
      case 'groups':
        return filterItems(groups);
      default:
        return [];
    }
  };
  
  // Handle item approval
const handleApproveItem = async (item) => {
    try {
      // Determine endpoint based on active tab
      let endpoint;
      let itemId;
      
      switch (activeTab) {
        case 'lectures':
          endpoint = 'http://127.0.0.1:8000/api/lectures/';
          itemId = item.lecture_id;
          break;
        case 'notes':
          endpoint = 'http://127.0.0.1:8000/api/notes/';
          itemId = item.note_id;
          break;
        case 'pyqs':
          endpoint = 'http://127.0.0.1:8000/api/pyqs/';
          itemId = item.pyq_id;
          break;
        case 'groups':
          endpoint = 'http://127.0.0.1:8000/api/groups/';
          itemId = item.group_id;
          break;
        default:
          throw new Error('Invalid item type');
      }
      
      // Update item status to approved
      await axios.put(`${endpoint}${itemId}/`, {
        ...item,
        status: 'approved'
      });
      
      // Update state based on item type
      if (activeTab === 'lectures') {
        setLectures(lectures.map(lecture => 
          lecture.lecture_id === item.lecture_id ? { ...lecture, status: 'approved' } : lecture
        ));
      } else if (activeTab === 'notes') {
        setNotes(notes.map(note => 
          note.note_id === item.note_id ? { ...note, status: 'approved' } : note
        ));
      } else if (activeTab === 'pyqs') {
        setPyqs(pyqs.map(pyq => 
          pyq.pyq_id === item.pyq_id ? { ...pyq, status: 'approved' } : pyq
        ));
      } else if (activeTab === 'groups') {
        setGroups(groups.map(group => 
          group.group_id === item.group_id ? { ...group, status: 'approved' } : group
        ));
      }
      
      // Close details modal if open
      setShowItemDetails(false);
      setSelectedItem(null);
      
      alert(`Item "${item.name || item.group_name}" has been approved.`);
    } catch (err) {
      console.error(err);
      alert('Failed to approve item. Please try again.');
    }
  };
  
  // Handle item rejection
  const handleRejectItem = async (item) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    try {
      // Determine endpoint based on active tab
      let endpoint;
      let itemId;
      
      switch (activeTab) {
        case 'lectures':
          endpoint = 'http://127.0.0.1:8000/api/lectures/';
          itemId = item.lecture_id;
          break;
        case 'notes':
          endpoint = 'http://127.0.0.1:8000/api/notes/';
          itemId = item.note_id;
          break;
        case 'pyqs':
          endpoint = 'http://127.0.0.1:8000/api/pyqs/';
          itemId = item.pyq_id;
          break;
        case 'groups':
          endpoint = 'http://127.0.0.1:8000/api/groups/';
          itemId = item.group_id;
          break;
        default:
          throw new Error('Invalid item type');
      }
      
      // Update item status to rejected with reason
      await axios.put(`${endpoint}${itemId}/`, {
        ...item,
        status: 'rejected',
        rejection_reason: rejectReason
      });
      
      // Update state based on item type
      if (activeTab === 'lectures') {
        setLectures(lectures.map(lecture => 
          lecture.lecture_id === item.lecture_id ? 
          { ...lecture, status: 'rejected', rejection_reason: rejectReason } : lecture
        ));
      } else if (activeTab === 'notes') {
        setNotes(notes.map(note => 
          note.note_id === item.note_id ? 
          { ...note, status: 'rejected', rejection_reason: rejectReason } : note
        ));
      } else if (activeTab === 'pyqs') {
        setPyqs(pyqs.map(pyq => 
          pyq.pyq_id === item.pyq_id ? 
          { ...pyq, status: 'rejected', rejection_reason: rejectReason } : pyq
        ));
      } else if (activeTab === 'groups') {
        setGroups(groups.map(group => 
          group.group_id === item.group_id ? 
          { ...group, status: 'rejected', rejection_reason: rejectReason } : group
        ));
      }
      
      // Close modals
      setShowRejectForm(false);
      setShowItemDetails(false);
      setSelectedItem(null);
      setRejectReason('');
      
      alert(`Item "${item.name || item.group_name}" has been rejected.`);
    } catch (err) {
      console.error(err);
      alert('Failed to reject item. Please try again.');
    }
  };
  
  // Handle viewing item details
  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };
  
  // Get unique branches for filter
  const getUniqueBranches = () => {
    const allItems = [...lectures, ...notes, ...pyqs, ...groups.filter(g => g.branch)];
    const branches = [...new Set(allItems.map(item => item.branch).filter(Boolean))];
    return branches;
  };
  
  // Get unique semesters for filter
  const getUniqueSemesters = () => {
    const allItems = [...lectures, ...notes, ...pyqs, ...groups.filter(g => g.semester)];
    const semesters = [...new Set(allItems.map(item => item.semester).filter(Boolean))];
    return semesters;
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterBranch('');
    setFilterSemester('');
  };
  
  // Get pending counts
  const getPendingCount = (itemType) => {
    switch (itemType) {
      case 'lectures':
        return lectures.filter(item => item.status === 'pending').length;
      case 'notes':
        return notes.filter(item => item.status === 'pending').length;
      case 'pyqs':
        return pyqs.filter(item => item.status === 'pending').length;
      case 'groups':
        return groups.filter(item => item.status === 'pending').length;
      default:
        return 0;
    }
  };
  
  // Extract YouTube ID from URL
  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>GradeGear</h2>
          <p>Admin Panel</p>
        </div>
        
        <div className="admin-sidebar-menu">
          <button 
            className={`sidebar-menu-item ${activeTab === 'lectures' ? 'active' : ''}`}
            onClick={() => setActiveTab('lectures')}
          >
            <FaVideo className="menu-icon" />
            <span>Lectures</span>
            {getPendingCount('lectures') > 0 && (
              <span className="badge">{getPendingCount('lectures')}</span>
            )}
          </button>
          
          <button 
            className={`sidebar-menu-item ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <FaBook className="menu-icon" />
            <span>Notes</span>
            {getPendingCount('notes') > 0 && (
              <span className="badge">{getPendingCount('notes')}</span>
            )}
          </button>
          
          <button 
            className={`sidebar-menu-item ${activeTab === 'pyqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('pyqs')}
          >
            <FaFileAlt className="menu-icon" />
            <span>PYQs</span>
            {getPendingCount('pyqs') > 0 && (
              <span className="badge">{getPendingCount('pyqs')}</span>
            )}
          </button>
          
          <button 
            className={`sidebar-menu-item ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <FaUserFriends className="menu-icon" />
            <span>Groups</span>
            {getPendingCount('groups') > 0 && (
              <span className="badge">{getPendingCount('groups')}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="admin-main-content">
        <div className="admin-header">
          <div className="admin-header-title">
            <h1>
              {activeTab === 'lectures' && 'Lectures'}
              {activeTab === 'notes' && 'Notes'}
              {activeTab === 'pyqs' && 'Previous Year Questions'}
              {activeTab === 'groups' && 'Groups'}
            </h1>
            <p>
              Manage user-submitted content - review, approve or reject
            </p>
          </div>
          
          <div className="admin-status-tabs">
            <button 
              className={`status-tab ${activeStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveStatus('pending')}
            >
              Pending
            </button>
            <button 
              className={`status-tab ${activeStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveStatus('approved')}
            >
              Approved
            </button>
            <button 
              className={`status-tab ${activeStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveStatus('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>
        
        <div className="admin-content-wrapper">
          {/* Filters */}
          <div className="admin-filters">
            <div className="admin-search">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="admin-filter-controls">
              <div className="admin-filter-select">
                <select 
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                >
                  <option value="">All Branches</option>
                  {getUniqueBranches().map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              
              <div className="admin-filter-select">
                <select 
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {getUniqueSemesters().map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>
              
              <button className="admin-reset-filters" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="admin-loading">
              <div className="admin-loader"></div>
              <p>Loading data...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="admin-error">
              <p>{error}</p>
              <button onClick={fetchData}>Try Again</button>
            </div>
          )}
          
          {/* Items Table */}
          {!isLoading && !error && (
            <div className="admin-items-table">
              {getCurrentItems().length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      {activeTab !== 'groups' && <th>Subject</th>}
                      <th>Branch</th>
                      <th>Semester</th>
                      {activeTab === 'groups' && <th>Group Type</th>}
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentItems().map(item => (
                      <tr key={item.lecture_id || item.note_id || item.pyq_id || item.group_id}>
                        <td>{item.name || item.group_name}</td>
                        {activeTab !== 'groups' && <td>{item.subject}</td>}
                        <td>{item.branch}</td>
                        <td>{item.semester}</td>
                        {activeTab === 'groups' && <td>{item.group_type}</td>}
                        <td>
                          <span className={`status-badge ${item.status}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="action-buttons">
  <button 
    className="action-btn view-btn"
    onClick={() => handleViewItem(item)}
    title="View Details"
  >
    👁️
  </button>
  
  {item.status === 'pending' && (
    <>
      <button 
        className="action-btn approve-btn"
        onClick={() => handleApproveItem(item)}
        title="Approve"
      >
        ✔️
      </button>
      
      <button 
        className="action-btn reject-btn"
        onClick={() => {
          setSelectedItem(item);
          setShowRejectForm(true);
        }}
        title="Reject"
      >
        ✖️
      </button>
    </>
  )}
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="admin-no-items">
                  <p>No {activeTab} found with the selected filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Item Details Modal */}
      {showItemDetails && selectedItem && (
        <div className="admin-modal-overlay" onClick={() => setShowItemDetails(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>
                {activeTab === 'lectures' && 'Lecture Details'}
                {activeTab === 'notes' && 'Note Details'}
                {activeTab === 'pyqs' && 'PYQ Details'}
                {activeTab === 'groups' && 'Group Details'}
              </h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowItemDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div className="item-details-grid">
                <div className="detail-item">
                  <h3>Name</h3>
                  <p>{selectedItem.name || selectedItem.group_name}</p>
                </div>
                
                {activeTab !== 'groups' && (
                  <div className="detail-item">
                    <h3>Subject</h3>
                    <p>{selectedItem.subject}</p>
                  </div>
                )}
                
                <div className="detail-item">
                  <h3>Branch</h3>
                  <p>{selectedItem.branch}</p>
                </div>
                
                <div className="detail-item">
                  <h3>Semester</h3>
                  <p>{selectedItem.semester}</p>
                </div>
                
                {activeTab === 'groups' && (
                  <>
                    <div className="detail-item">
                      <h3>Group Type</h3>
                      <p>{selectedItem.group_type}</p>
                    </div>
                    
                    <div className="detail-item">
                      <h3>Description</h3>
                      <p>{selectedItem.description || 'No description provided.'}</p>
                    </div>
                    
                    {selectedItem.whatsapp && (
                      <div className="detail-item">
                        <h3>WhatsApp Link</h3>
                        <a href={selectedItem.whatsapp} target="_blank" rel="noopener noreferrer">
                          {selectedItem.whatsapp}
                        </a>
                      </div>
                    )}
                    
                    {selectedItem.instagram && (
                      <div className="detail-item">
                        <h3>Instagram Link</h3>
                        <a href={selectedItem.instagram} target="_blank" rel="noopener noreferrer">
                          {selectedItem.instagram}
                        </a>
                      </div>
                    )}
                    
                    {selectedItem.linkedin && (
                      <div className="detail-item">
                        <h3>LinkedIn Link</h3>
                        <a href={selectedItem.linkedin} target="_blank" rel="noopener noreferrer">
                          {selectedItem.linkedin}
                        </a>
                      </div>
                    )}
                  </>
                )}
                
                {activeTab !== 'groups' && (
                  <div className="detail-item">
                    <h3>Link</h3>
                    <a href={selectedItem.link} target="_blank" rel="noopener noreferrer">
                      {selectedItem.link}
                    </a>
                  </div>
                )}
                
                <div className="detail-item">
                  <h3>Status</h3>
                  <p className={`status-text ${selectedItem.status}`}>
                    {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                  </p>
                </div>
                
                {selectedItem.status === 'rejected' && selectedItem.rejection_reason && (
                  <div className="detail-item full-width">
                    <h3>Rejection Reason</h3>
                    <p>{selectedItem.rejection_reason}</p>
                  </div>
                )}
              </div>
              
              {/* Preview section for lectures */}
              {activeTab === 'lectures' && (
                <div className="item-preview">
                  <h3>Video Preview</h3>
                  <div className="video-preview-container">
                    {selectedItem.link && selectedItem.link.includes('youtube.com') ? (
                      <iframe
                        width="560"
                        height="315"
                        src={`https://www.youtube.com/embed/${extractYoutubeId(selectedItem.link)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedItem.name}
                      ></iframe>
                    ) : (
                      <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="external-link-btn">
                        Open Video Link
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Preview section for notes and PYQs */}
              {(activeTab === 'notes' || activeTab === 'pyqs') && (
                <div className="item-preview">
                  <h3>Document Preview</h3>
                  <div className="document-preview-container">
                    <a href={selectedItem.link} target="_blank" rel="noopener noreferrer" className="external-link-btn">
                      Open Document
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="admin-modal-footer">
              {selectedItem.status === 'pending' && (
                <>
                  <button 
                    className="modal-btn approve-btn"
                    onClick={() => handleApproveItem(selectedItem)}
                  >
                    <FaCheck className="btn-icon" />
                    Approve
                  </button>
                  
                  <button 
                    className="modal-btn reject-btn"
                    onClick={() => {
                      setShowItemDetails(false);
                      setShowRejectForm(true);
                    }}
                  >
                    <FaTimes className="btn-icon" />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Form Modal */}
      {showRejectForm && selectedItem && (
        <div className="admin-modal-overlay" onClick={() => setShowRejectForm(false)}>
          <div className="admin-modal reject-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Reject Item</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowRejectForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="admin-modal-body">
              <p className="reject-info">
                You are about to reject the {activeTab.slice(0, -1)} "<strong>{selectedItem.name || selectedItem.group_name}</strong>".
                Please provide a reason for rejection:
              </p>
              
              <textarea
                className="reject-reason-textarea"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="admin-modal-footer">
              <button 
                className="modal-btn cancel-btn"
                onClick={() => setShowRejectForm(false)}
              >
                Cancel
              </button>
              
              <button 
                className="modal-btn confirm-reject-btn"
                onClick={() => handleRejectItem(selectedItem)}
                disabled={!rejectReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
  
};

export default AdminDashboard;