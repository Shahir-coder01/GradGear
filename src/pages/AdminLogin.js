import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      
      // For demonstration, we'll simulate a login
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, let's use a hardcoded admin credential
      if (username === 'admin' && password === 'nasa') {
        // Store admin token in localStorage
        localStorage.setItem('adminToken', 'demo-admin-token');
        localStorage.setItem('adminUsername', username);
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Access the GradeGear administrator dashboard</p>
        </div>
        
        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="username">Username</label>
            <div className="admin-input-container">
              <FaUser className="admin-input-icon" />
              <input
                                type="text"
                                id="username"
                                placeholder="Enter your admin username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="admin-form-group">
                            <label htmlFor="password">Password</label>
                            <div className="admin-input-container">
                              <FaLock className="admin-input-icon" />
                              <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                              />
                              <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          </div>
                          
                          <button 
                            type="submit" 
                            className="admin-login-button"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Logging in...' : 'Login'}
                          </button>
                        </form>
                        
                        <div className="admin-login-footer">
                          <p>This area is restricted to authorized administrators only.</p>
                          <a href="/" className="back-to-main">Back to main site</a>
                        </div>
                      </div>
                    </div>
                  );
                };
                
                export default AdminLogin;