import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const HomePage = () => {
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const startSession = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (subject.trim().length > 25) {
      toast.error('Subject cannot exceed 25 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/session/start', { subject: subject.trim() });
      toast.success('Session started successfully!');
      navigate(`/session/${response.data.session_id}`);
    } catch (error) {
      console.error('Error starting session:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to start session. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      startSession();
    }
  };

                return (
                <div className="home-container">
                  <div className="home-header">
                    <div className="header-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="m22 21-2-2"/>
                        <path d="M16 16h4"/>
                      </svg>
                    </div>
                    <h1 className="header-title">Attendance Session Manager</h1>
                    <p className="header-subtitle">
                      Professional attendance tracking for modern classrooms
                    </p>
                  </div>
                  
                  <div className="card home-card">
                    <h2>Start New Session</h2>
                    <p style={{ color: '#888', marginBottom: '24px' }}>
                      Create a new attendance session for your class
                    </p>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '0.875rem', 
                      lineHeight: '1.5',
                      marginBottom: '32px',
                      textAlign: 'center'
                    }}>
                      Create and manage real-time attendance tracking sessions with automatic student check-in validation
                    </p>
        
        <div className="form-group">
          <label htmlFor="subject">Subject Name</label>
          <input
            type="text"
            id="subject"
            className="form-control"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter subject name (e.g., Artificial Intelligence)"
            maxLength={25}
            disabled={isLoading}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={startSession}
          disabled={isLoading || !subject.trim()}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Starting Session...' : 'Start Session'}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
