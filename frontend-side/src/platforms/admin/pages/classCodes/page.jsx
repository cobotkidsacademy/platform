import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClassCodes.css';

const ClassCodesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cobotKidsKenya/classCodes`);
      setClasses(response.data.data);
    } catch (err) {
      setError('Failed to fetch classes');
      console.error('Error fetchings classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateClassCode = async (schoolId, classId) => {
    try {
      const response = await axios.post(`${API_URL}/cobotKidsKenya/schools/${schoolId}/classes/${classId}/generateCode`, {
        generatedBy: 'admin' // can replace this with actual admin ID
      });
      
      if (response.data.success) {
        // Refresh the classes list to show the new code
        fetchClasses();
        alert('Class code generated successfully!');
      }
    } catch (err) {
      console.error('Error generating class code:', err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('Failed to generate class code');
      }
    }
  };

  const updateClassCodeStatus = async (schoolId, classId, codeId, status) => {
    try {
      const response = await axios.put(`${API_URL}/cobotKidsKenya/schools/${schoolId}/classes/${classId}/classCode/${codeId}/status`, {
        status
      });
      
      if (response.data.success) {
        fetchClasses();
      }
    } catch (err) {
      console.error('Error updating class code status:', err);
      alert('Failed to update class code status');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    // If time is already in HH:MM format, return as is
    if (timeString.includes(':')) {
      return timeString;
    }
    // If it's a number or other format, try to format it
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'expired': return 'status-expired';
      default: return 'status-none';
    }
  };

  if (loading) {
    return (
      <div className="class-codes-container">
        <div className="loading">Loading classes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-codes-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="class-codes-container">
      <div className="header">
        <h1>Class Codes Management</h1>
        <p>Generate and manage class codes for attendance tracking</p>
      </div>

      <div className="class-cards-grid">
        {classes.map((cls) => (
          <div key={cls._id} className="class-card">
            <div className="card-header">
              <h3>{cls.name}</h3>
              <span className="level-badge">{cls.level}</span>
            </div>

            <div className="card-content">
              <div className="info-row">
                <span className="label">School:</span>
                <span className="value">{cls.schoolName} ({cls.schoolCode})</span>
              </div>

              <div className="info-row">
                <span className="label">Tutor:</span>
                <span className="value">{cls.tutor ? cls.tutor.fname : 'Not Assigned'}</span>
              </div>

              <div className="info-row">
                <span className="label">Students:</span>
                <span className="value">{cls.studentsCount}</span>
              </div>

              <div className="info-row">
                <span className="label">Courses:</span>
                <span className="value">{cls.courses.length} enrolled</span>
              </div>

              {cls.schedule && cls.schedule.dayOfWeek && (
                <div className="info-row">
                  <span className="label">Schedule:</span>
                  <span className="value">
                    {cls.schedule.dayOfWeek} {formatTime(cls.schedule.startTime)} - {formatTime(cls.schedule.endTime)}
                  </span>
                </div>
              )}

              {cls.classCodes && cls.classCodes.length > 0 && (
                <div className="class-codes-section">
                  <h4>Generated Class Codes ({cls.classCodes.length})</h4>
                  <div className="codes-list">
                    {cls.classCodes.map((classCode, index) => (
                      <div key={classCode.lessonId || index} className="code-item">
                        <div className="code-header">
                          <span className="code-value">{classCode.code}</span>
                          <span className={`status-badge ${getStatusColor(classCode.status)}`}>
                            {classCode.status}
                          </span>
                        </div>
                        <div className="code-details">
                          <div className="detail-row">
                            <span className="label">Generated:</span>
                            <span className="value">{formatDate(classCode.generatedAt)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Valid Until:</span>
                            <span className="value">{formatDate(classCode.validUntil)}</span>
                          </div>
                        </div>
                        <div className="code-actions">
                          {classCode.status === 'active' && (
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => updateClassCodeStatus(cls.schoolId, cls._id, classCode.lessonId, 'inactive')}
                            >
                              Deactivate
                            </button>
                          )}
                          
                          {classCode.status === 'inactive' && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => updateClassCodeStatus(cls.schoolId, cls._id, classCode.lessonId, 'active')}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card-actions">
              <button 
                className="btn btn-primary"
                onClick={() => generateClassCode(cls.schoolId, cls._id)}
              >
                Generate New Class Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="no-classes">
          <p>No classes found. Please add classes to schools first.</p>
        </div>
      )}
    </div>
  );
};

export default ClassCodesPage;

