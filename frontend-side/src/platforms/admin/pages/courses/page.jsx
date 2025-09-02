import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddCourse.css';
import { Link } from 'react-router-dom';

const AddCoursePage = () => {
  const [formData, setFormData] = useState({
    courseName: '',
    code: '',
    status: 'locked',
    courseIcon: '',
    courseLink: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch existing courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/cobotKidsKenya/courses`);
      const sortedCourses = response.data.sort((a, b) => {
        const statusOrder = { completed: 0, enrolled: 1, locked: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      setCourses(sortedCourses);
    } catch (err) {
      setError('Failed to fetch courses');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const courseData = {
        courseName: formData.courseName.trim(),
        code: formData.code.trim().toUpperCase(),
        status: formData.status,
        courseIcon: formData.courseIcon.trim(),
        courseLink: formData.courseLink.trim()
      };

      let response;
      if (editingCourse) {
        response = await axios.put(
          `${API_URL}/cobotKidsKenya/courses/${editingCourse}`,
          courseData
        );
        setCourses(courses.map(c => c._id === editingCourse ? response.data : c));
        setSuccess('Course updated successfully!');
      } else {
        response = await axios.post(
          `${API_URL}/cobotKidsKenya/courses`,
          courseData
        );
        setCourses([...courses, response.data]);
        setSuccess('Course added successfully!');
      }

      setFormData({ 
        courseName: '', 
        code: '', 
        status: 'locked', 
        courseIcon: '', 
        courseLink: '' 
      });
      setShowForm(false);
      setEditingCourse(null);
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error:', error.response?.data);
      setError(error.response?.data?.error || 
        (editingCourse ? 'Failed to update course' : 'Failed to add course'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course._id);
    setFormData({
      courseName: course.courseName,
      code: course.code,
      status: course.status,
      courseIcon: course.courseIcon,
      courseLink: course.courseLink || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`${API_URL}/cobotKidsKenya/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
      setSuccess('Course deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete course');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({ 
      courseName: '', 
      code: '', 
      status: 'locked', 
      courseIcon: '', 
      courseLink: '' 
    });
    setError('');
  };

  const handleViewCourse = (courseLink) => {
    if (courseLink) {
      window.open(courseLink, '_blank');
    }
  };

  // Filter and search courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="course-management">
      <div className="course-header">
        <h1>Course Management</h1>
        <p>Manage your educational courses, topics, and content</p>
      </div>
      
      {success && (
        <div className="success-notification">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}
      
      {error && (
        <div className="error-notification">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="locked">Locked</option>
            <option value="enrolled">Enrolled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button 
          className="add-course-btn"
          onClick={() => setShowForm(true)}
        >
          <span className="btn-icon">+</span>
          Add New Course
        </button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button 
                className="close-btn"
                onClick={handleCancel}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                    required
                    placeholder="e.g., Mathematics 101"
                  />
                </div>
                
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                    placeholder="MATH101"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="locked">Locked</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Course Icon URL *</label>
                  <input
                    type="url"
                    name="courseIcon"
                    value={formData.courseIcon}
                    onChange={(e) => setFormData({...formData, courseIcon: e.target.value})}
                    required
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Course Link</label>
                <input
                  type="url"
                  name="courseLink"
                  value={formData.courseLink}
                  onChange={(e) => setFormData({...formData, courseLink: e.target.value})}
                  placeholder="https://example.com/course"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading 
                    ? (editingCourse ? 'Updating...' : 'Adding...') 
                    : (editingCourse ? 'Update Course' : 'Add Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="courses-section">
        <div className="courses-header">
          <h2>Courses ({filteredCourses.length})</h2>
          <div className="courses-stats">
            <span className="stat-item">
              <span className="stat-number">{courses.filter(c => c.status === 'locked').length}</span>
              <span className="stat-label">Locked</span>
            </span>
            <span className="stat-item">
              <span className="stat-number">{courses.filter(c => c.status === 'enrolled').length}</span>
              <span className="stat-label">Enrolled</span>
            </span>
            <span className="stat-item">
              <span className="stat-number">{courses.filter(c => c.status === 'completed').length}</span>
              <span className="stat-label">Completed</span>
            </span>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <div className="no-courses-icon">📚</div>
            <h3>No courses found</h3>
            <p>{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first course to get started!'}</p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                onClick={() => setShowForm(true)}
                className="add-first-course-btn"
              >
                Add Your First Course
              </button>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-card-header">
                  <div className="course-icon-container">
                    {course.courseIcon ? (
                      <img 
                        src={course.courseIcon} 
                        alt={course.courseName} 
                        className="course-icon"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className="course-icon-placeholder">📚</div>
                  </div>
                  <div className="course-status-badge">
                    <span className={`status-badge ${course.status}`}>
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="course-card-content">
                  <h3 className="course-name">{course.courseName}</h3>
                  <p className="course-code">Code: {course.code}</p>
                  
                  <div className="course-meta">
                    <span className="meta-item">
                      <span className="meta-icon">📝</span>
                      <span className="meta-text">{course.topics?.length || 0} Topics</span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">📋</span>
                      <span className="meta-text">{course.assignments?.length || 0} Assignments</span>
                    </span>
                  </div>
                </div>

                <div className="course-card-actions">
                  <Link 
                    to={`/courses/${course._id}/topics`}
                    className="action-btn primary"
                  >
                    <span className="btn-icon">📚</span>
                    Manage Topics
                  </Link>
                  
                  {course.courseLink && (
                    <button 
                      onClick={() => handleViewCourse(course.courseLink)}
                      className="action-btn secondary"
                    >
                      <span className="btn-icon">🔗</span>
                      View Course
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleEdit(course)}
                    className="action-btn edit"
                  >
                    <span className="btn-icon">✏️</span>
                    Edit
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(course._id)}
                    className="action-btn delete"
                  >
                    <span className="btn-icon">🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCoursePage;