import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Tutors.css';

const TutorsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTutor, setEditingTutor] = useState(null);
  const [newTutor, setNewTutor] = useState({ 
    company: '', 
    fname: '', 
    lname: '', 
    username: '', 
    password: 'cobotkids2025',
    status: 'pending'
  });
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch tutors from backend
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch(`${API_URL}/cobotKidsKenya/tutors`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setTutors(result.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch tutors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [API_URL]);

  // Handle body overflow when modal is open
  useEffect(() => {
    if (showAddForm || editingTutor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showAddForm, editingTutor]);

  const handleAddTutor = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/cobotKidsKenya/tutors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTutor),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add tutor');
      }

      const result = await response.json();
      setTutors([...tutors, result.data]);
      setNewTutor({ 
        company: '', 
        fname: '', 
        lname: '', 
        username: '', 
        password: 'cobotkids2025',
        status: 'pending'
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTutor = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/cobotKidsKenya/tutors/${editingTutor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTutor),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tutor');
      }

      const result = await response.json();
      setTutors(tutors.map(tutor => 
        tutor._id === editingTutor._id ? result.data : tutor
      ));
      setEditingTutor(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tutor?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/cobotKidsKenya/tutors/${id}`, 
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tutor');
      }

      setTutors(tutors.filter(tutor => tutor._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (tutor) => {
    setEditingTutor({ ...tutor });
  };
  
  const openTutorDetails = async (tutor) => {
    setSelectedTutor(tutor);
    setAssignments([]);
    setAssignmentsError('');
    setAssignmentsLoading(true);
    try {
      const res = await fetch(`${API_URL}/cobotKidsKenya/tutors/${tutor._id}/assignments`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load assignments');
      setAssignments(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setAssignmentsError(e.message);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const closeTutorDetails = () => {
    setSelectedTutor(null);
    setAssignments([]);
    setAssignmentsError('');
  };

  const cancelEdit = () => {
    setEditingTutor(null);
  };

  if (loading && tutors.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tutors data...</p>
      </div>
    );
  }

  return (
    <div className="tutors-container">
      <div className="tutors-header">
        <h1>Tutors Management</h1>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          Add New Tutor
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Add Tutor Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Tutor</h2>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddTutor} className="tutor-form">
              <div className="form-group">
                <label>Company:</label>
                <input
                  type="text"
                  value={newTutor.company}
                  onChange={(e) => setNewTutor({...newTutor, company: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={newTutor.fname}
                  onChange={(e) => setNewTutor({...newTutor, fname: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={newTutor.lname}
                  onChange={(e) => setNewTutor({...newTutor, lname: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username (optional):</label>
                <input
                  type="text"
                  value={newTutor.username}
                  onChange={(e) => setNewTutor({...newTutor, username: e.target.value})}
                  placeholder="Will auto-generate if left empty"
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={newTutor.password}
                  onChange={(e) => setNewTutor({...newTutor, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={newTutor.status}
                  onChange={(e) => setNewTutor({...newTutor, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">Add Tutor</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tutor Form */}
      {editingTutor && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Tutor</h2>
              <button onClick={cancelEdit}>×</button>
            </div>
            <form onSubmit={handleEditTutor} className="tutor-form">
              <div className="form-group">
                <label>Company:</label>
                <input
                  type="text"
                  value={editingTutor.company}
                  onChange={(e) => setEditingTutor({...editingTutor, company: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={editingTutor.fname}
                  onChange={(e) => setEditingTutor({...editingTutor, fname: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={editingTutor.lname}
                  onChange={(e) => setEditingTutor({...editingTutor, lname: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={editingTutor.username}
                  onChange={(e) => setEditingTutor({...editingTutor, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={editingTutor.password}
                  onChange={(e) => setEditingTutor({...editingTutor, password: e.target.value})}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={editingTutor.status}
                  onChange={(e) => setEditingTutor({...editingTutor, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">Update Tutor</button>
                <button type="button" onClick={cancelEdit} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutors Table */}
      <div className="tutors-table-container">
        <table className="tutors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Username</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tutors.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No tutors found</td>
              </tr>
            ) : (
              tutors.map((tutor) => (
                <tr key={tutor._id}>
              <td>
                <button className="link-like" onClick={() => openTutorDetails(tutor)}>
                  {tutor.fname} {tutor.lname}
                </button>
              </td>
                  <td>{tutor.company}</td>
                  <td>{tutor.username}</td>
                  <td>
                    <span className={`status-badge status-${tutor.status}`}>
                      {tutor.status}
                    </span>
                  </td>
                  <td>{new Date(tutor.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="edit-button"
                      onClick={() => startEdit(tutor)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(tutor._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedTutor && (
        <div className="drawer-overlay" onClick={closeTutorDetails}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2>{selectedTutor.fname} {selectedTutor.lname}</h2>
                <p className="muted">{selectedTutor.username} · {selectedTutor.company}</p>
              </div>
              <button className="close-btn" onClick={closeTutorDetails}>×</button>
            </div>

            {assignmentsLoading ? (
              <div className="drawer-loading">Loading assignments...</div>
            ) : assignmentsError ? (
              <div className="drawer-error">{assignmentsError}</div>
            ) : (
              <div className="assignments-list">
                {assignments.length === 0 ? (
                  <div className="empty">No assignments yet.</div>
                ) : (
                  assignments.map((a, idx) => (
                    <div key={idx} className="assignment-card">
                      <div className="assignment-header">
                        <h3>{a.schoolName} ({a.schoolCode})</h3>
                      </div>
                      <div className="assignment-classes">
                        {a.classes.length === 0 ? (
                          <div className="muted">No classes</div>
                        ) : (
                          a.classes.map((c) => (
                            <div key={String(c.classId)} className="class-row">
                              <div>
                                <div className="class-name">{c.className} <span className="muted">· {c.level}</span></div>
                                <div className="muted small">Status: {c.isActive ? 'Active' : 'Inactive'}</div>
                              </div>
                              <div className="class-actions">
                                <Link className="small-link" to={`/schools/${a.schoolId}/classes/${c.classId}/students`}>
                                  View Students
                                </Link>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="summary">
              <div className="summary-item">
                <span className="label">Schools</span>
                <span className="value">{assignments.length}</span>
              </div>
              <div className="summary-item">
                <span className="label">Classes</span>
                <span className="value">{assignments.reduce((sum, a) => sum + a.classes.length, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorsPage;