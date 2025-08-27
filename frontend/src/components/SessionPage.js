import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import CheckinModal from './CheckinModal';
import ConfirmModal from './ConfirmModal';

const SessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    try {
      const response = await axios.get(`/session/${sessionId}`);
      setSession(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching session:', error);
      if (error.response?.status === 404) {
        setError('Session not found');
        toast.error('Session not found or has expired');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error');
        toast.error('Network error. Please check your connection.');
      } else {
        setError('Failed to load session');
        toast.error('Failed to load session. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [sessionId, fetchSession]);

  const endSession = async () => {
    setShowConfirmModal(true);
  };

  const confirmEndSession = async () => {
    setShowConfirmModal(false);
    setIsEnding(true);
    try {
      await axios.post(`/session/${sessionId}/end`);
      toast.success('Session ended successfully!');
      fetchSession(); // Refresh to get updated status
    } catch (error) {
      console.error('Error ending session:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to end session. Please try again.');
      }
    } finally {
      setIsEnding(false);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Error</h2>
          <p style={{ color: '#ff6b6b' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container">
        <div className="loading">No session data available</div>
      </div>
    );
  }

  return (
    <>
      <Navbar session={session} />
      
      <div className="container">
        <div className="card">
          <h2>Session Details</h2>
          
          <div className="session-info">
            <div className="info-item">
              <h4>SESSION ID</h4>
              <p>{sessionId}</p>
            </div>
            <div className="info-item">
              <h4>SUBJECT</h4>
              <p>{session.subject}</p>
            </div>
            <div className="info-item">
              <h4>STATUS</h4>
              <span className={`status-badge ${session.status === 'active' ? 'status-active' : 'status-ended'}`}>
                {session.status.toUpperCase()}
              </span>
            </div>
            <div className="info-item">
              <h4>ATTENDEES</h4>
              <p>{session.attendees_count}</p>
            </div>
          </div>

          <div className="card">
            <h3>Started At</h3>
            <p>{formatDateTime(session.started_at)}</p>
          </div>

          {session.status === 'active' && (
            <div className="card">
              <h3>Session Management</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCheckinModal(true)}
                >
                  Check-in Student
                </button>
                <button
                  className="btn btn-danger"
                  onClick={endSession}
                  disabled={isEnding}
                >
                  {isEnding ? 'Ending...' : 'End Session'}
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h3>Attendees List</h3>
            {session.attendees && session.attendees.length > 0 ? (
              <div className="attendees-list">
                {session.attendees.map((attendee, index) => (
                  <div key={index} className="attendee-item">
                    <span className="attendee-roll">{attendee.roll_no}</span>
                    <span className="attendee-time">
                      {formatDateTime(attendee.time)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                No attendees yet
              </p>
            )}
          </div>
        </div>
      </div>

      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        sessionId={sessionId}
        onCheckinSuccess={fetchSession}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmEndSession}
        title="End Session"
        message="Are you sure you want to end this session? This action cannot be undone."
        confirmText="End Session"
        cancelText="Cancel"
      />
    </>
  );
};

export default SessionPage;
