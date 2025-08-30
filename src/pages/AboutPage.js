import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './AboutPage.css'; // Make sure to create this CSS file


const AboutPage = ({ isAuthenticated, onLogout }) => {
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm({
      ...feedbackForm,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', feedbackForm);
    setFormSubmitted(true);
    setFeedbackForm({ name: '', email: '', message: '' });
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: 'Aravind Vijayan',
      role: 'Team Lead + AI-ML Developer',
      image: require('../assets/aravind.png'),
      contributor: true
    },
    {
      id: 2,
      name: 'Mohammed Shahir A',
      role: 'Frontend Developer',
      image: require('../assets/shahir.jpg'),
      contributor: true
    },
    {
      id: 3,
      name: 'Naveen Surendran',
      role: 'Backend Developer',
      image: require('../assets/naveen.png'),
      contributor: true
    },
    {
      id: 4,
      name: 'Anamgha H',
      role: 'Frontend Developer',
      image: require('../assets/anamgha.png'),
      contributor: true
    },
    {
      id: 5,
      name: 'Ashalakshmi K A',
      role: 'Frontend Developer',
      image: require('../assets/logo.png'),
      contributor: false
    }
  ];

  return (
    <div className="page about-page">
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      <div className="page-content dark-theme">
        <div className="about-section">
          <h1>About GradeGear</h1>
          <div className="about-content">
            <p>
              GradeGear is an academic platform designed specifically for CUSAT students
              to help them excel in their academic journey.
            </p>
            <h2>Our Mission</h2>
            <p>
              To provide a comprehensive suite of tools that simplify the academic
              experience and help students achieve their full potential.
            </p>
            <h2>Features</h2>
            <ul>
              <li>Access to lecture materials and notes</li>
              <li>Previous year question papers</li>
              <li>Grade calculation and prediction tools</li>
              <li>Quiz evaluation system</li>
              <li>Study groups for collaborative learning</li>
            </ul>
          </div>
        </div>
        
        <div className="team-section">
          <h1 className="team-heading">Team Members</h1>
          <p className="team-description">
          At GradeGear, we’re more than just a team—we’re a squad of dreamers, doers, and builders. From brainstorming sessions to late-night debugging marathons, every member has been essential in shaping the platform. Their passion, persistence, and drive have turned an ambitious idea into a smart, student-first academic companion. Together, we’ve not only tackled core challenges but also brought a bold vision to life—making academic analysis smarter, personalized, and way more accessible. GradeGear isn’t just a project. It’s our statement.          </p>
          <div className="team-grid">
            {teamMembers.slice(0, 4).map(member => (
              <div key={member.id} className="team-card">
                <div className="member-image-container">
                  <img src={member.image} alt={member.name} className="member-image" />
                
                </div>
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Center the fifth member */}
          <div className="team-grid-center">
            <div className="team-card">
              <div className="member-image-container">
                <img src={teamMembers[4].image} alt={teamMembers[4].name} className="member-image" />
                
              </div>
              <div className="member-info">
                <h3 className="member-name">{teamMembers[4].name}</h3>
                <p className="member-role">{teamMembers[4].role}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="contact-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions or feedback, please contact us at:
            <br />
            <a href="mailto:support@gradegear.com">support@gradegear.com</a>
          </p>
          
          <h2>Send Us Your Feedback</h2>
          <div className="feedback-form-container">
            {formSubmitted ? (
              <div className="success-message">
                Thank you for your feedback! We'll get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={feedbackForm.message}
                    onChange={handleInputChange}
                    rows="5"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-button">
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;