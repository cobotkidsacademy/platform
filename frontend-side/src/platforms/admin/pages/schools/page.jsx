import React, { useState, useEffect } from 'react';
import './Schools.css';
import { useNavigate } from 'react-router-dom';

const SchoolsPage = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchool, setNewSchool] = useState({ 
    name: '', 
    code: '', 
    location: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch schools from backend
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/cobotKidsKenya/schools`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSchools(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch schools:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const handleAddSchool = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate input
      if (!newSchool.name.trim() || !newSchool.code.trim()) {
        throw new Error('School name and code are required');
      }

      // Check for duplicate school code
      const existingSchool = schools.find(s => 
        s.code.toLowerCase() === newSchool.code.trim().toLowerCase()
      );
      
      if (existingSchool) {
        throw new Error('School code already exists');
      }

      const response = await fetch(`${API_URL}/cobotKidsKenya/schools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSchool.name.trim(),
          code: newSchool.code.trim().toUpperCase(),
          location: newSchool.location.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add school');
      }

      // Handle the new response format
      const addedSchool = result.success ? result.data : result;
      setSchools([...schools, addedSchool]);
      setNewSchool({ name: '', code: '', location: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/cobotKidsKenya/schools/${id}`, 
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete school');
      }

      setSchools(schools.filter(school => school._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading schools data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
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
    <div className="schools-container">
      <div className="schools-header">
        <h1>Schools Management</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add New School'}
        </button>
      </div>

      <div className="schools-table-container">
        <table className="schools-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Location</th>
              <th>Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr 
                key={school._id} 
                onClick={() => navigate(`/schools/${school._id}/classes`)}
                style={{ cursor: 'pointer' }}
              >
                <td>{school._id}</td>
                <td>{school.name}</td>
                <td>{school.code}</td>
                <td>{school.location}</td>
                <td>{school.classes?.length || 0}</td>
                <td className="actions-cell">
                  <button 
                    className="edit-button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(school._id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New School</h2>
            <form onSubmit={handleAddSchool}>
              <div className="form-group">
                <label>School Name *</label>
                <input
                  type="text"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label>School Code *</label>
                <input
                  type="text"
                  value={newSchool.code}
                  onChange={(e) => setNewSchool({...newSchool, code: e.target.value.toUpperCase()})}
                  required
                  maxLength={3}
                  disabled={isSubmitting}
                  placeholder="e.g., ABC"
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newSchool.location}
                  onChange={(e) => setNewSchool({...newSchool, location: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-buttons">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="cancel-button"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolsPage;