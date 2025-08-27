import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ session }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isHomePage = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {!isHomePage && (
            <button className="navbar-back-btn" onClick={() => navigate('/', { replace: true })}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <Link to="/" className="navbar-brand">
            Attendance Manager
          </Link>
        </div>
        
        <div className="navbar-right">
          {session && (
            <div className="navbar-session-info">
              <div className="session-status">
                <span className={`status-badge ${session.status === 'active' ? 'status-active' : 'status-ended'}`}>
                  {session.status === 'active' ? 'ACTIVE' : 'ENDED'}
                </span>
              </div>
              <div className="session-count">
                <span className="count-label">Attendees:</span>
                <span className="count-value">{session.attendees_count}</span>
              </div>
            </div>
          )}
          
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
