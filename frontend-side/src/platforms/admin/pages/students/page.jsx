import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './studentManagement.css';

const StudentManagement = () => {
  const { schoolId: paramSchoolId, classId: paramClassId } = useParams();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [currentSchool, setCurrentSchool] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    fname: '', 
    lname: '',
    username: '',
    password: '1234'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // Initialize from params or fallback to dropdown flow
  useEffect(() => {
    const init = async () => {
      try {
        if (paramSchoolId && paramClassId) {
          const res = await axios.get(`${API_URL}/cobotKidsKenya/schools/${paramSchoolId}`);
          const school = res.data;
          setCurrentSchool(school);
          setSelectedSchool(paramSchoolId);
          const cls = (school.classes || []).find(c => c._id === paramClassId) || null;
          setCurrentClass(cls);
          setSelectedClass(paramClassId);
          setStudents(cls?.students || []);
        } else {
          const response = await axios.get(`${API_URL}/cobotKidsKenya/schools`);
          setSchools(response.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      }
    };
    init();
  }, [paramSchoolId, paramClassId, API_URL]);

  // Fetch students when using dropdown (no params flow)
  useEffect(() => {
    if (!paramSchoolId && selectedSchool && selectedClass) {
      const fetchStudents = async () => {
        try {
          const school = schools.find(s => s._id === selectedSchool);
          if (school) {
            const classData = school.classes.find(c => c._id === selectedClass);
            setStudents(classData?.students || []);
          }
        } catch (error) {
          console.error('Error fetching students:', error);
          setError('Failed to fetch students');
        }
      };
      fetchStudents();
    }
  }, [paramSchoolId, selectedSchool, selectedClass, schools]);

  // Auto-generate username when names change
  useEffect(() => {
    if (formData.fname && formData.lname && selectedSchool) {
      const school = schools.find(s => s._id === selectedSchool);
      if (school) {
        const generatedUsername = `${school.code.toLowerCase()}-${formData.fname.toLowerCase()}.${formData.lname.toLowerCase()}`;
        setFormData(prev => ({
          ...prev,
          username: generatedUsername
        }));
      }
    }
  }, [formData.fname, formData.lname, selectedSchool, schools]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(
        `${API_URL}/cobotKidsKenya/schools/${selectedSchool}/classes/${selectedClass}/students`,
        {
          fname: formData.fname.trim(),
          lname: formData.lname.trim(),
          username: formData.username.trim(),
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setStudents(prev => [...prev, response.data.data]);
        setFormData({ 
          fname: '', 
          lname: '',
          username: '',
          password: '1234'
        });
        setShowAddForm(false);
        setSuccess('Student added successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to add student');
      }
      
    } catch (error) {
      console.error('Full error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/cobotKidsKenya/schools/${selectedSchool}/classes/${selectedClass}/students/${studentId}`
      );
      
      setStudents(prev => prev.filter(student => student._id !== studentId));
      setSuccess('Student deleted successfully!');
    } catch (error) {
      setError('Failed to delete student');
    }
  };

  return (
    <div className="student-management-container">
      <div className="student-management-header">
        <h1>Student Management</h1>
        <p>Manage students across schools and classes</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <p>{success}</p>
          <button onClick={() => setSuccess('')}>Dismiss</button>
        </div>
      )}

      {/* School and Class Selection */}
      {paramSchoolId && paramClassId ? (
        <div className="context-header">
          <div className="breadcrumb">
            <span>School:</span> <strong>{currentSchool?.name}</strong>
            <span className="sep">/</span>
            <span>Class:</span> <strong>{currentClass?.name} ({currentClass?.level})</strong>
          </div>
          <div className="actions">
            <Link to={`/schools/${paramSchoolId}/classes`} className="back-link">Back to Classes</Link>
          </div>
        </div>
      ) : (
        <div className="selection-section">
          <div className="selection-group">
            <label>Select School:</label>
            <select
              value={selectedSchool || ''}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setSelectedClass(null);
                setStudents([]);
              }}
              className="selection-dropdown"
            >
              <option value="">Choose a school</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          </div>

          {selectedSchool && (
            <div className="selection-group">
              <label>Select Class:</label>
              <select
                value={selectedClass || ''}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="selection-dropdown"
              >
                <option value="">Choose a class</option>
                {schools
                  .find(s => s._id === selectedSchool)
                  ?.classes?.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name} - {classItem.level}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Students List */}
      {selectedClass && (
        <div className="students-section">
          <div className="students-header">
            <h2>Students in Class</h2>
            <button 
              onClick={() => setShowAddForm(true)}
              className="add-student-btn"
            >
              Add New Student
            </button>
          </div>

          <div className="students-table-container">
            {students.length > 0 ? (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.fname} {student.lname}</td>
                      <td>{student.username}</td>
                      <td>{student.points || 0}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteStudent(student._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-students">
                <p>No students in this class yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="student-form">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.fname}
                  onChange={(e) => setFormData({...formData, fname: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.lname}
                  onChange={(e) => setFormData({...formData, lname: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={isSubmitting}
                  placeholder="Auto-generated"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="cancel-btn"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;