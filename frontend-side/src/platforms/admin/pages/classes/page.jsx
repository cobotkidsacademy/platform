import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './class.css';

const ClassesPage = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClass, setNewClass] = useState({ 
    name: '', 
    level: 'Primary'
  });
  const [school, setSchool] = useState(null);
  const [scheduleModal, setScheduleModal] = useState({ open: false, classId: null, dayOfWeek: '', startTime: '', endTime: '' });
  const [courseModal, setCourseModal] = useState({ open: false, classId: null, courseId: '', status: 'enrolled' });
  const [courses, setCourses] = useState([]);
  const [tutorDetails, setTutorDetails] = useState({});
  const [tutorLoading, setTutorLoading] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch school and its classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/cobotKidsKenya/schools/${schoolId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch school data');
        }

        const schoolData = await response.json();
        setSchool(schoolData);
        setClasses(schoolData.classes || []);
        
        // Fetch tutor details for each class
        if (schoolData.classes && schoolData.classes.length > 0) {
          fetchTutorDetailsForClasses(schoolData.classes);
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, API_URL]);

  // Function to fetch tutor details for all classes
  const fetchTutorDetailsForClasses = async (classesList) => {
    try {
      const tutorDetailsMap = {};
      const loadingMap = {};
      
      // Initialize loading states
      classesList.forEach(cls => {
        loadingMap[cls._id] = true;
      });
      setTutorLoading(loadingMap);
      
      // Fetch tutor details for each class
      for (const cls of classesList) {
        try {
          const response = await fetch(
            `${API_URL}/cobotKidsKenya/schools/${schoolId}/classes/${cls._id}/details`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.tutor) {
              tutorDetailsMap[cls._id] = data.data.tutor;
            } else {
              tutorDetailsMap[cls._id] = null;
            }
          } else {
            console.error(`Failed to fetch tutor details for class ${cls._id}`);
            tutorDetailsMap[cls._id] = null;
          }
        } catch (err) {
          console.error(`Error fetching tutor for class ${cls._id}:`, err);
          tutorDetailsMap[cls._id] = null;
        }
        
        // Update loading state for this class
        setTutorLoading(prev => ({...prev, [cls._id]: false}));
      }
      
      setTutorDetails(tutorDetailsMap);
    } catch (err) {
      console.error('Error in fetchTutorDetailsForClasses:', err);
    }
  };

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/cobotKidsKenya/courses`);
        if (!res.ok) return;
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    loadCourses();
  }, [API_URL]);

  // Handle adding a new class
  const handleAddClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_URL}/cobotKidsKenya/schools/${schoolId}/classes`,
        {
          name: newClass.name.trim(),
          level: newClass.level
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      if (response.data.success) {
        const newClassData = response.data.data;
        setClasses([...classes, newClassData]);
        setNewClass({ name: '', level: 'Primary' });
        setShowAddForm(false);
        
        // Fetch tutor details for the new class
        fetchTutorDetailsForClasses([newClassData]);
      } else {
        throw new Error(response.data.details || 'Failed to add class');
      }
    } catch (err) {
      // Error handling code...
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle class deletion
  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/cobotKidsKenya/schools/${schoolId}/classes/${classId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete class');
      }

      // Refresh the classes list
      const updatedResponse = await fetch(`${API_URL}/cobotKidsKenya/schools/${schoolId}`);
      const updatedSchool = await updatedResponse.json();
      setClasses(updatedSchool.classes || []);
      
      // Update tutor details
      if (updatedSchool.classes && updatedSchool.classes.length > 0) {
        fetchTutorDetailsForClasses(updatedSchool.classes);
      }
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading classes data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="classes-container">
      <div className="classes-header">
        <h1>Classes in {school?.name}</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/schools')}
            className="back-button"
          >
            Back to Schools
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-button"
            disabled={loading}
          >
            Add New Class
          </button>
        </div>
      </div>

      <div className="classes-table-container">
        {classes.length > 0 ? (
          <table className="classes-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Level</th>
                <th>Schedule</th>
                <th>Assigned Tutor</th>
                <th>Courses</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls._id}>
                  <td>{cls.name}</td>
                  <td>{cls.level}</td>
                  <td>{cls.schedule?.dayOfWeek ? `${cls.schedule.dayOfWeek} ${cls.schedule.startTime || ''}-${cls.schedule.endTime || ''}` : '—'}</td>
                  <td>
                    {tutorLoading[cls._id] ? (
                      <span className="loading-text">Loading...</span>
                    ) : tutorDetails[cls._id] ? (
                      tutorDetails[cls._id].name
                    ) : (
                      'No tutor assigned'
                    )}
                  </td>
                  <td>{(cls.courses || []).length}</td>
                  <td>{cls.students?.length || 0}</td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => navigate(`/schools/${schoolId}/classes/${cls._id}/edit`)}
                      className="edit-button"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setScheduleModal({ open: true, classId: cls._id, dayOfWeek: cls.schedule?.dayOfWeek || '', startTime: cls.schedule?.startTime || '', endTime: cls.schedule?.endTime || '' })}
                      className="edit-button"
                      disabled={loading}
                    >
                      Set Schedule
                    </button>
                    <button
                      onClick={() => setCourseModal({ open: true, classId: cls._id, courseId: '', status: 'enrolled' })}
                      className="edit-button"
                      disabled={loading}
                    >
                      Assign Course
                    </button>
                    <Link 
                      to={`/schools/${schoolId}/classes/${cls._id}/students`}
                      className="view-students-btn"
                    >
                      View Students
                    </Link>
                    <button 
                      onClick={() => handleDelete(cls._id)}
                      className="delete-button"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            ) : (
              <div className="no-classes-message">
                <p>No classes found for this school.</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="add-button"
                >
                  Add First Class
                </button>
              </div>
            )}
          </div>

          {showAddForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Add New Class to {school?.name}</h2>
                  <button 
                    onClick={() => {
                      setShowAddForm(false);
                      setError(null);
                    }}
                    className="close-button"
                  >
                    &times;
                  </button>
                </div>
                
                {error && <p className="form-error">{error}</p>}
                
                <form onSubmit={handleAddClass}>
                  <div className="form-group">
                    <label htmlFor="className">Class Name</label>
                    <input
                      id="className"
                      type="text"
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="classLevel">Level</label>
                    <select
                      id="classLevel"
                      value={newClass.level}
                      onChange={(e) => setNewClass({...newClass, level: e.target.value})}
                      required
                      disabled={loading}
                    >
                      <option value="Kindergarten">Kindergarten</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="High School">High School</option>
                    </select>
                  </div>
                  
                  <div className="form-buttons">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setError(null);
                      }}
                      className="cancel-button"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Class'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {scheduleModal.open && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Set Schedule</h2>
                  <button onClick={() => setScheduleModal({ open: false, classId: null, dayOfWeek: '', startTime: '', endTime: '' })} className="close-button">&times;</button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setLoading(true);
                    const res = await fetch(`https://platform-zl0a.onrender.com/cobotKidsKenya/schools/${schoolId}/classes/${scheduleModal.classId}/schedule`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ dayOfWeek: scheduleModal.dayOfWeek, startTime: scheduleModal.startTime, endTime: scheduleModal.endTime })
                    });
                    if (!res.ok) throw new Error('Failed to set schedule');
                    // refresh school
                    const updatedResponse = await fetch(`https://platform-zl0a.onrender.com/cobotKidsKenya/schools/${schoolId}`);
                    const updatedSchool = await updatedResponse.json();
                    setClasses(updatedSchool.classes || []);
                    setScheduleModal({ open: false, classId: null, dayOfWeek: '', startTime: '', endTime: '' });
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}>
                  <div className="form-group">
                    <label>Day of week</label>
                    <select value={scheduleModal.dayOfWeek} onChange={(e) => setScheduleModal({ ...scheduleModal, dayOfWeek: e.target.value })} required>
                      <option value="">Select</option>
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start time</label>
                    <input type="time" value={scheduleModal.startTime} onChange={(e) => setScheduleModal({ ...scheduleModal, startTime: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>End time</label>
                    <input type="time" value={scheduleModal.endTime} onChange={(e) => setScheduleModal({ ...scheduleModal, endTime: e.target.value })} required />
                  </div>
                  <div className="form-buttons">
                    <button type="button" className="cancel-button" onClick={() => setScheduleModal({ open: false, classId: null, dayOfWeek: '', startTime: '', endTime: '' })}>Cancel</button>
                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {courseModal.open && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Assign Course</h2>
                  <button onClick={() => setCourseModal({ open: false, classId: null, courseId: '', status: 'enrolled' })} className="close-button">&times;</button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setLoading(true);
                    const res = await fetch(`https://platform-zl0a.onrender.com/cobotKidsKenya/schools/${schoolId}/classes/${courseModal.classId}/courses`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ courseId: courseModal.courseId, status: courseModal.status })
                    });
                    if (!res.ok) throw new Error('Failed to assign course');
                    const updatedResponse = await fetch(`https://platform-zl0a.onrender.com/cobotKidsKenya/schools/${schoolId}`);
                    const updatedSchool = await updatedResponse.json();
                    setClasses(updatedSchool.classes || []);
                    setCourseModal({ open: false, classId: null, courseId: '', status: 'enrolled' });
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}>
                  <div className="form-group">
                    <label>Course</label>
                    <select value={courseModal.courseId} onChange={(e) => setCourseModal({ ...courseModal, courseId: e.target.value })} required>
                      <option value="">Select course</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.courseName} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={courseModal.status} onChange={(e) => setCourseModal({ ...courseModal, status: e.target.value })}>
                      <option value="enrolled">Enrolled</option>
                      <option value="locked">Locked</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-buttons">
                    <button type="button" className="cancel-button" onClick={() => setCourseModal({ open: false, classId: null, courseId: '', status: 'enrolled' })}>Cancel</button>
                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Saving...' : 'Assign'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default ClassesPage;