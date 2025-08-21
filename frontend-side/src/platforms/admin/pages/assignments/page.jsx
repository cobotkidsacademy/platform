import React, { useState, useEffect } from 'react';
import './Assignments.css';

const API_BASE = 'https://platform-zl0a.onrender.com/cobotKidsKenya';

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState({
    assessments: true,
    courses: false,
    topics: false
  });
  const [error, setError] = useState({
    assessments: null,
    courses: null,
    topics: null
  });
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [assessmentType, setAssessmentType] = useState('assignment'); // 'assignment' or 'exam'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    topic: '',
    subject: '',
    class: '',
    dueDate: '',
    totalPoints: '',
    instructions: '',
    duration: 60,
    allowLateSubmission: false,
    maxAttempts: 1,
    autoGrade: false,
    showResults: true,
    status: 'draft',
    // Exam-specific fields
    code: '',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchAssessments();
    fetchCourses();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(prev => ({ ...prev, assessments: true }));
      setError(prev => ({ ...prev, assessments: null }));
      
      const response = await fetch(`${API_BASE}/assessments`);
      const data = await response.json();
      
      if (data.success) {
        // Combine assignments and exams into a single assessments array
        const allAssessments = [
          ...data.data.assignments.map(a => ({ ...a, type: 'assignment' })),
          ...data.data.exams.map(e => ({ ...e, type: 'exam' }))
        ];
        setAssessments(allAssessments);
      } else {
        setError(prev => ({ ...prev, assessments: data.error }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, assessments: 'Failed to fetch assessments' }));
    } finally {
      setLoading(prev => ({ ...prev, assessments: false }));
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      setError(prev => ({ ...prev, courses: null }));
      
      const response = await fetch(`${API_BASE}/courses`);
      const data = await response.json();
      
      // Check if the response structure matches the second example
      if (Array.isArray(data)) {
        // Response is an array of courses (like in the second example)
        setCourses(data);
      } else if (data.success) {
        // Response has a success property with data array
        setCourses(data.data || []);
      } else {
        setError(prev => ({ ...prev, courses: data.error || 'Invalid response format' }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, courses: 'Failed to fetch courses' }));
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const fetchTopics = async (courseId) => {
    if (!courseId) {
      setTopics([]);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, topics: true }));
      setError(prev => ({ ...prev, topics: null }));
      
      const response = await fetch(`${API_BASE}/courses/${courseId}/topics`);
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.data || []);
      } else {
        setError(prev => ({ ...prev, topics: data.error }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, topics: 'Failed to fetch topics' }));
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  };

  // Rest of the component remains the same...
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = assessmentType === 'assignment' ? 'assignments' : 'exams';
      const url = editingAssessment 
        ? `${API_BASE}/${endpoint}/${editingAssessment._id}`
        : `${API_BASE}/${endpoint}`;
      
      const method = editingAssessment ? 'PUT' : 'POST';
      
      // Prepare payload based on assessment type
      const payload = {
        title: formData.title,
        course: formData.course,
        topic: formData.topic,
        duration: formData.duration,
        totalPoints: formData.totalPoints,
        status: formData.status,
        questions: [], // Will be added separately
        ...(assessmentType === 'assignment' ? {
          description: formData.description,
          dueDate: formData.dueDate,
          allowLateSubmission: formData.allowLateSubmission,
          maxAttempts: formData.maxAttempts,
          autoGrade: formData.autoGrade,
          showResults: formData.showResults
        } : {
          code: formData.code,
          scheduledAt: formData.scheduledAt
        })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        setShowForm(false);
        setEditingAssessment(null);
        resetForm();
        fetchAssessments();
      } else {
        setError(prev => ({ ...prev, assessments: data.error }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, assessments: 'Failed to save assessment' }));
    }
  };

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setAssessmentType(assessment.type);
    setFormData({
      title: assessment.title,
      description: assessment.description || '',
      course: assessment.course,
      topic: assessment.topic,
      subject: assessment.subject || '',
      class: assessment.class || '',
      dueDate: assessment.dueDate ? assessment.dueDate.split('T')[0] : '',
      totalPoints: assessment.totalPoints,
      instructions: assessment.instructions || '',
      duration: assessment.duration || 60,
      allowLateSubmission: assessment.allowLateSubmission || false,
      maxAttempts: assessment.maxAttempts || 1,
      autoGrade: assessment.autoGrade || false,
      showResults: assessment.showResults !== false,
      status: assessment.status,
      // Exam-specific fields
      code: assessment.code || '',
      scheduledAt: assessment.scheduledAt ? assessment.scheduledAt.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (assessmentId, type) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        const endpoint = type === 'assignment' ? 'assignments' : 'exams';
        const response = await fetch(`${API_BASE}/${endpoint}/${assessmentId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
          fetchAssessments();
        } else {
          setError(prev => ({ ...prev, assessments: data.error }));
        }
      } catch (err) {
        setError(prev => ({ ...prev, assessments: 'Failed to delete assessment' }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      course: '',
      topic: '',
      subject: '',
      class: '',
      dueDate: '',
      totalPoints: '',
      instructions: '',
      duration: 60,
      allowLateSubmission: false,
      maxAttempts: 1,
      autoGrade: false,
      showResults: true,
      status: 'draft',
      code: '',
      scheduledAt: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date() > new Date(dueDate);
  };

  if (loading.assessments) {
    return (
      <div className="assignments-loading">
        <div className="loading-spinner"></div>
        <p>Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="assignments-management">
      <div className="assignments-header">
        <h1>Assessment Management</h1>
        <p>Create and manage assessments (assignments and exams) for your courses</p>
        <div className="assessment-type-buttons">
          <button 
            className={`type-btn ${assessmentType === 'assignment' ? 'active' : ''}`}
            onClick={() => setAssessmentType('assignment')}
          >
            Assignments
          </button>
          <button 
            className={`type-btn ${assessmentType === 'exam' ? 'active' : ''}`}
            onClick={() => setAssessmentType('exam')}
          >
            Exams
          </button>
        </div>
        <button 
          className="add-assignment-btn"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i>
          Create New {assessmentType === 'assignment' ? 'Assignment' : 'Exam'}
        </button>
      </div>

 {Object.values(error).some(err => err) && (
  <div className="error-messages">
    {error.assessments && (
      <div className="error-message">
        <span>Assessments: {error.assessments}</span>
        <button
          onClick={() =>
            setError(prev => ({ ...prev, assessments: null }))
          }
        >
          &times;
        </button>
      </div>
    )}
    {error.courses && (
      <div className="error-message">
        <span>Courses: {error.courses}</span>
        <button
          onClick={() =>
            setError(prev => ({ ...prev, courses: null }))
          }
        >
          &times;
        </button>
      </div>
    )}
    {error.topics && (
      <div className="error-message">
        <span>Topics: {error.topics}</span>
        <button
          onClick={() =>
            setError(prev => ({ ...prev, topics: null }))
          }
        >
          &times;
        </button>
      </div>
    )}
  </div>
)}

      {/* Assessment Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingAssessment ? `Edit ${assessmentType === 'assignment' ? 'Assignment' : 'Exam'}` : `Create New ${assessmentType === 'assignment' ? 'Assignment' : 'Exam'}`}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingAssessment(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form className="assignment-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder={`Enter ${assessmentType === 'assignment' ? 'assignment' : 'exam'} title`}
                  />
                </div>
                {assessmentType === 'exam' && (
                  <div className="form-group">
                    <label>Exam Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      required
                      placeholder="Enter exam code (e.g., MATH101)"
                    />
                  </div>
                )}
              </div>

              {assessmentType === 'assignment' && (
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    placeholder="Describe the assessment requirements..."
                    rows="4"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Course *</label>
                  <select
                    className="form-input"
                    value={formData.course}
                    onChange={(e) => {
                      setFormData({...formData, course: e.target.value, topic: ''});
                      fetchTopics(e.target.value);
                    }}
                    required
                  >
                    <option value="">Choose a course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.courseName} ({course.code})
                      </option>
                    ))}
                  </select>
                  {loading.courses && <div className="loading-indicator">Loading courses...</div>}
                </div>
                <div className="form-group">
                  <label>Topic *</label>
                  <select
                    className="form-input"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    required
                    disabled={!formData.course || loading.topics}
                  >
                    <option value="">Select Topic</option>
                    {topics.map(topic => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  {loading.topics && <div className="loading-indicator">Loading topics...</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{assessmentType === 'assignment' ? 'Due Date' : 'Scheduled Date'} *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={assessmentType === 'assignment' ? formData.dueDate : formData.scheduledAt}
                    onChange={(e) => setFormData({
                      ...formData, 
                      [assessmentType === 'assignment' ? 'dueDate' : 'scheduledAt']: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Points *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.totalPoints}
                    onChange={(e) => setFormData({...formData, totalPoints: e.target.value})}
                    required
                    min="1"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    min="15"
                    placeholder="60"
                  />
                </div>
                {assessmentType === 'assignment' && (
                  <div className="form-group">
                    <label>Max Attempts</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.maxAttempts}
                      onChange={(e) => setFormData({...formData, maxAttempts: e.target.value})}
                      min="1"
                      placeholder="1"
                    />
                  </div>
                )}
              </div>

              {assessmentType === 'assignment' && (
                <>
                  <div className="form-group">
                    <label>Instructions</label>
                    <textarea
                      className="form-textarea"
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      placeholder="Additional instructions for students..."
                      rows="3"
                    />
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.allowLateSubmission}
                        onChange={(e) => setFormData({...formData, allowLateSubmission: e.target.checked})}
                      />
                      Allow late submissions
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.autoGrade}
                        onChange={(e) => setFormData({...formData, autoGrade: e.target.checked})}
                      />
                      Auto-grade multiple choice questions
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.showResults}
                        onChange={(e) => setFormData({...formData, showResults: e.target.checked})}
                      />
                      Show results to students
                    </label>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAssessment(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingAssessment ? `Update ${assessmentType === 'assignment' ? 'Assignment' : 'Exam'}` : `Create ${assessmentType === 'assignment' ? 'Assignment' : 'Exam'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assessments List */}
      <div className="assignments-section">
        <div className="section-header">
          <h2>{assessmentType === 'assignment' ? 'Assignments' : 'Exams'}</h2>
          <div className="section-stats">
            <div className="stat-item">
              <span className="stat-number">
                {assessments.filter(a => a.type === assessmentType).length}
              </span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {assessments.filter(a => a.type === assessmentType && a.status === 'published').length}
              </span>
              <span className="stat-label">Published</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {assessments.filter(a => a.type === assessmentType && a.status === 'active').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>

        {assessments.filter(a => a.type === assessmentType).length > 0 ? (
          <div className="assignments-grid">
            {assessments.filter(a => a.type === assessmentType).map((assessment) => (
              <div key={assessment._id} className="assignment-card">
                <div className="assignment-header">
                  <h3>{assessment.title}</h3>
                  {assessment.type === 'exam' && assessment.code && (
                    <span className="exam-code">{assessment.code}</span>
                  )}
                  <div className="assignment-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowQuestionsModal(true);
                      }}
                    >
                      <i className="fas fa-question-circle"></i>
                      Questions
                    </button>
                    <button 
                      className="action-btn primary"
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowResultsModal(true);
                      }}
                    >
                      <i className="fas fa-chart-bar"></i>
                      Results
                    </button>
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(assessment)}
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(assessment._id, assessment.type)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="assignment-content">
                  {assessment.description && (
                    <p className="assignment-description">{assessment.description}</p>
                  )}
                  
                  <div className="assignment-meta">
                    <div className="meta-row">
                      <span className="meta-item">
                        <i className="fas fa-book"></i>
                        <strong>Course:</strong> {assessment.course?.courseName || 'N/A'}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-tag"></i>
                        <strong>Topic:</strong> {assessment.topic?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-item">
                        <i className="fas fa-calendar"></i>
                        <strong>{assessment.type === 'assignment' ? 'Due:' : 'Scheduled:'}</strong> 
                        {formatDate(assessment.type === 'assignment' ? assessment.dueDate : assessment.scheduledAt)}
                        {assessment.type === 'assignment' && assessment.dueDate && isOverdue(assessment.dueDate) && (
                          <span className="overdue-badge">Overdue</span>
                        )}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-star"></i>
                        <strong>Points:</strong> {assessment.totalPoints || 0}
                      </span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-item">
                        <i className="fas fa-users"></i>
                        <strong>Participants:</strong> 
                        {assessment.type === 'assignment' ? 
                          (assessment.attempts?.length || 0) : 
                          (assessment.attempts?.filter(a => a.status === 'submitted').length || 0)}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-chart-line"></i>
                        <strong>Avg Score:</strong> 
                        {assessment.type === 'assignment' ? 
                          (assessment.attempts?.length ? 
                            Math.round(assessment.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / assessment.attempts.length) : 
                            0) :
                          (assessment.attempts?.filter(a => a.status === 'graded').length ? 
                            Math.round(assessment.attempts.filter(a => a.status === 'graded')
                              .reduce((sum, a) => sum + (a.percentage || 0), 0) / 
                              assessment.attempts.filter(a => a.status === 'graded').length) : 
                            0)}%
                      </span>
                    </div>
                  </div>

                  <div className="assignment-status">
                    <span className={`status-badge ${assessment.status || 'draft'}`}>
                      {assessment.status || 'draft'}
                    </span>
                    <span className="type-badge">
                      {assessment.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-assignments">
            <div className="no-assignments-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h3>No {assessmentType === 'assignment' ? 'Assignments' : 'Exams'} Yet</h3>
            <p>Create your first {assessmentType === 'assignment' ? 'assignment' : 'exam'} to get started!</p>
            <button 
              className="add-first-assignment-btn"
              onClick={() => setShowForm(true)}
            >
              Create First {assessmentType === 'assignment' ? 'Assignment' : 'Exam'}
            </button>
          </div>
        )}
      </div>

      {/* Questions Modal */}
      {showQuestionsModal && selectedAssessment && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Questions - {selectedAssessment.title}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowQuestionsModal(false);
                  setSelectedAssessment(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="questions-content">
              {selectedAssessment.questions && selectedAssessment.questions.length > 0 ? (
                <div className="questions-list">
                  {selectedAssessment.questions.map((question, index) => (
                    <div key={question._id || index} className="question-item">
                      <div className="question-header">
                        <span className="question-number">Q{index + 1}</span>
                        <span className="question-type">Multiple Choice</span>
                        <span className="question-points">{question.points || 1} pts</span>
                      </div>
                      <div className="question-text">
                        {question.question}
                      </div>
                      {question.options && (
                        <div className="question-options">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`option ${option === question.correctAnswer ? 'correct' : ''}`}>
                              <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                              <span className="option-text">{option}</span>
                              {option === question.correctAnswer && <i className="fas fa-check correct-icon"></i>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-questions">
                  <p>No questions added to this assessment yet.</p>
                  <button className="add-questions-btn">
                    Add Questions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && selectedAssessment && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Results - {selectedAssessment.title}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowResultsModal(false);
                  setSelectedAssessment(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="results-content">
              <div className="results-summary">
                <div className="summary-card">
                  <h3>Participation</h3>
                  <div className="summary-stat">
                    <span className="stat-number">
                      {selectedAssessment.type === 'assignment' ? 
                        (selectedAssessment.attempts?.length || 0) : 
                        (selectedAssessment.attempts?.filter(a => a.status === 'submitted').length || 0)}
                    </span>
                    <span className="stat-label">Total Submissions</span>
                  </div>
                </div>
                
                <div className="summary-card">
                  <h3>Performance</h3>
                  <div className="summary-stat">
                    <span className="stat-number">
                      {selectedAssessment.type === 'assignment' ? 
                        (selectedAssessment.attempts?.length ? 
                          Math.round(selectedAssessment.attempts.reduce((sum, a) => sum + a.score, 0) / selectedAssessment.attempts.length) : 
                          0) :
                        (selectedAssessment.attempts?.filter(a => a.status === 'graded').length ? 
                          Math.round(selectedAssessment.attempts.filter(a => a.status === 'graded')
                            .reduce((sum, a) => sum + a.percentage, 0) / 
                            selectedAssessment.attempts.filter(a => a.status === 'graded').length) : 
                          0)}%
                    </span>
                    <span className="stat-label">Average Score</span>
                  </div>
                </div>
              </div>

              {selectedAssessment.attempts && selectedAssessment.attempts.length > 0 ? (
                <div className="submissions-list">
                  <h3>Student Submissions</h3>
                  <div className="submissions-table">
                    <div className="table-header">
                      <span>Student</span>
                      <span>Submitted</span>
                      <span>Score</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>
                    {selectedAssessment.attempts.map((attempt) => (
                      <div key={attempt._id} className="table-row">
                        <span className="student-name">
                          {attempt.student?.fname} {attempt.student?.lname}
                        </span>
                        <span className="submission-date">
                          {attempt.submittedAt ? formatDate(attempt.submittedAt) : 'Not submitted'}
                        </span>
                        <span className="submission-score">
                          {selectedAssessment.type === 'assignment' ? 
                            `${attempt.score || 0}/${selectedAssessment.totalPoints}` : 
                            `${attempt.percentage || 0}%`}
                        </span>
                        <span className={`submission-status ${attempt.status}`}>
                          {attempt.status}
                        </span>
                        <span className="submission-actions">
                          <button className="view-btn">View</button>
                          {selectedAssessment.type === 'exam' && attempt.status !== 'graded' && (
                            <button className="grade-btn">Grade</button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-submissions">
                  <p>No submissions wait yet for this assessment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentsPage;