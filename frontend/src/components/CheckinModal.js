import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CheckinModal = ({ isOpen, onClose, sessionId, onCheckinSuccess }) => {
  const [rollNo, setRollNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkInStudent = async () => {
    if (!rollNo.trim()) {
      toast.error('Please enter a roll number');
      return;
    }
    if (rollNo.trim().length > 20) {
      toast.error('Roll number cannot exceed 20 characters');
      return;
    }
    const rollNoRegex = /^[A-Za-z0-9-]+$/;
    if (!rollNoRegex.test(rollNo.trim())) {
      toast.error('Roll number can only contain letters, numbers, and hyphens');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`/session/${sessionId}/checkin`, {
        roll_no: rollNo.trim()
      });
      toast.success(`Student checked in successfully! Total: ${response.data.total}`);
      setRollNo('');
      onCheckinSuccess();
    } catch (error) {
      console.error('Error checking in student:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to check in student. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      checkInStudent();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Check-in Student</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="rollNo">Roll Number</label>
            <input
              type="text"
              id="rollNo"
              className="form-control"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter roll number (e.g., AIE22039)"
              maxLength={20}
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={checkInStudent}
            disabled={isLoading || !rollNo.trim()}
          >
            {isLoading ? 'Checking In...' : 'Check-in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckinModal;
