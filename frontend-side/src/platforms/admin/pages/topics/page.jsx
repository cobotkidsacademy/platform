import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Topics.css';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/cobotKidsKenya/courses` : 'https://platform-zl0a.onrender.com/cobotKidsKenya/courses';

export default function CourseTopicsPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [topics, setTopics] = useState([]);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    content: '',
    images: []
  });
  const [loading, setLoading] = useState({
    courses: false,
    topics: false,
    addTopic: false,
    addNote: false
  });
  const [error, setError] = useState({
    courses: null,
    topics: null,
    addTopic: null,
    addNote: null
  });

  // Fetch all courses
  useEffect(() => {
    setLoading(prev => ({ ...prev, courses: true }));
    setError(prev => ({ ...prev, courses: null }));
    
    axios.get(API_BASE)
      .then(res => {
        setCourses(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch courses:", err);
        setError(prev => ({ ...prev, courses: err.message }));
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, courses: false }));
      });
  }, []);

  // Fetch topics when course is selected
  useEffect(() => {
    if (!selectedCourseId) {
      setTopics([]);
      return;
    }

    setLoading(prev => ({ ...prev, topics: true }));
    setError(prev => ({ ...prev, topics: null }));

    axios.get(`${API_BASE}/${selectedCourseId}/topics`)
      .then(res => {
        if (res.data.success) {
          setTopics(res.data.data || []);
        } else {
          throw new Error(res.data.error || 'Failed to fetch topics');
        }
      })
      .catch(err => {
        console.error("Failed to fetch topics:", err);
        setError(prev => ({ ...prev, topics: err.message }));
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, topics: false }));
      });
  }, [selectedCourseId]);

  // Add a new topic
  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    setLoading(prev => ({ ...prev, addTopic: true }));
    setError(prev => ({ ...prev, addTopic: null }));

    try {
      const response = await axios.post(`${API_BASE}/${selectedCourseId}/topics`, { 
        name: newTopicName.trim() 
      });
      
      if (response.data.success) {
        setNewTopicName('');
        setIsAddTopicModalOpen(false);
        
        // Re-fetch topics
        const topicsResponse = await axios.get(`${API_BASE}/${selectedCourseId}/topics`);
        if (topicsResponse.data.success) {
          setTopics(topicsResponse.data.data || []);
        }
      } else {
        throw new Error(response.data.error || 'Failed to add topic');
      }
    } catch (err) {
      console.error("Failed to add topic:", err);
      setError(prev => ({ ...prev, addTopic: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, addTopic: false }));
    }
  };

  // Add a new note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    setLoading(prev => ({ ...prev, addNote: true }));
    setError(prev => ({ ...prev, addNote: null }));

    try {
      const response = await axios.post(
        `${API_BASE}/${selectedCourseId}/topics/${selectedTopic._id}/notes`, 
        newNote
      );
      
      if (response.data.success) {
        setNewNote({
          title: '',
          description: '',
          content: '',
          images: []
        });
        setIsAddNoteModalOpen(false);
        setSelectedTopic(null);
        
        // Re-fetch topics to get updated notes
        const topicsResponse = await axios.get(`${API_BASE}/${selectedCourseId}/topics`);
        if (topicsResponse.data.success) {
          setTopics(topicsResponse.data.data || []);
        }
      } else {
        throw new Error(response.data.error || 'Failed to add note');
      }
    } catch (err) {
      console.error("Failed to add note:", err);
      setError(prev => ({ ...prev, addNote: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, addNote: false }));
    }
  };

  // Delete topic
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic? This will also delete all notes in this topic.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${selectedCourseId}/topics/${topicId}`);
      
      // Re-fetch topics
      const topicsResponse = await axios.get(`${API_BASE}/${selectedCourseId}/topics`);
      if (topicsResponse.data.success) {
        setTopics(topicsResponse.data.data || []);
        }
    } catch (err) {
      console.error("Failed to delete topic:", err);
      setError(prev => ({ ...prev, topics: 'Failed to delete topic' }));
    }
  };

  // Delete note
  const handleDeleteNote = async (topicId, noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${selectedCourseId}/topics/${topicId}/notes/${noteId}`);
      
      // Re-fetch topics
      const topicsResponse = await axios.get(`${API_BASE}/${selectedCourseId}/topics`);
      if (topicsResponse.data.success) {
        setTopics(topicsResponse.data.data || []);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError(prev => ({ ...prev, topics: 'Failed to delete note' }));
    }
  };

  const selectedCourseName = courses.find(c => c._id === selectedCourseId)?.courseName || '';

  return (
    <div className="topics-management">
      <div className="topics-header">
        <h1>Topics & Notes Management</h1>
        <p>Manage topics and notes for your courses</p>
      </div>

      {/* Course Selection */}
      <div className="course-selection">
        <div className="selection-group">
          <label>Select Course:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="course-select"
            disabled={loading.courses}
          >
            <option value="">Choose a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.courseName} ({course.code})
              </option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <button
            onClick={() => setIsAddTopicModalOpen(true)}
            className="add-topic-btn"
            disabled={loading.topics}
          >
            <span className="btn-icon">+</span>
            Add Topic
          </button>
        )}
      </div>

      {/* Error Messages */}
      {Object.values(error).some(err => err) && (
        <div className="error-messages">
          {error.courses && (
            <div className="error-message">Courses: {error.courses}</div>
          )}
          {error.topics && (
            <div className="error-message">Topics: {error.topics}</div>
          )}
          {error.addTopic && (
            <div className="error-message">Add Topic: {error.addTopic}</div>
          )}
          {error.addNote && (
            <div className="error-message">Add Note: {error.addNote}</div>
          )}
        </div>
      )}

      {/* Topics Section */}
      {selectedCourseId && (
        <div className="topics-section">
          <div className="section-header">
            <h2>Topics in {selectedCourseName}</h2>
            <div className="section-stats">
              <span className="stat-item">
                <span className="stat-number">{topics.length}</span>
                <span className="stat-label">Topics</span>
              </span>
              <span className="stat-item">
                <span className="stat-number">
                  {topics.reduce((total, topic) => total + (topic.notes?.length || 0), 0)}
                </span>
                <span className="stat-label">Total Notes</span>
              </span>
            </div>
          </div>
          
          {loading.topics ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading topics...</p>
            </div>
          ) : topics.length === 0 ? (
            <div className="no-topics">
              <div className="no-topics-icon">📚</div>
              <h3>No topics yet</h3>
              <p>Create your first topic to get started!</p>
              <button 
                onClick={() => setIsAddTopicModalOpen(true)}
                className="add-first-topic-btn"
              >
                Add Your First Topic
              </button>
            </div>
          ) : (
            <div className="topics-grid">
              {topics.map((topic, index) => (
                <div key={topic._id || index} className="topic-card">
                  <div className="topic-header">
                    <h3 className="topic-name">{topic.name}</h3>
                    <div className="topic-actions">
                      <button 
                        onClick={() => {
                          setSelectedTopic(topic);
                          setIsAddNoteModalOpen(true);
                        }}
                        className="action-btn primary"
                      >
                        <span className="btn-icon">📝</span>
                        Add Note
                      </button>
                      <button 
                        onClick={() => handleDeleteTopic(topic._id)}
                        className="action-btn delete"
                      >
                        <span className="btn-icon">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="topic-content">
                    <div className="notes-count">
                      <span className="count-badge">
                        {topic.notes?.length || 0} notes
                      </span>
                    </div>

                    {topic.notes && topic.notes.length > 0 ? (
                      <div className="notes-list">
                        {topic.notes.map((note, noteIndex) => (
                          <div key={note._id || noteIndex} className="note-item">
                            <div className="note-header">
                              <h4 className="note-title">{note.title || `Note ${noteIndex + 1}`}</h4>
                              <button 
                                onClick={() => handleDeleteNote(topic._id, note._id)}
                                className="delete-note-btn"
                              >
                                ×
                              </button>
                            </div>
                            <p className="note-description">
                              {note.description || note.content?.substring(0, 100) + '...'}
                            </p>
                            {note.images && note.images.length > 0 && (
                              <div className="note-images">
                                <span className="image-count">📷 {note.images.length} image(s)</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-notes">
                        <p>No notes in this topic yet.</p>
                        <button 
                          onClick={() => {
                            setSelectedTopic(topic);
                            setIsAddNoteModalOpen(true);
                          }}
                          className="add-note-btn"
                        >
                          Add First Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Topic Modal */}
      {isAddTopicModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Topic</h2>
              <button 
                onClick={() => setIsAddTopicModalOpen(false)}
                className="close-btn"
                disabled={loading.addTopic}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddTopic} className="topic-form">
              <div className="form-group">
                <label>Topic Name *</label>
                <input
                  type="text"
                  placeholder="Enter topic name"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                  disabled={loading.addTopic}
                />
              </div>
              
              {error.addTopic && (
                <div className="error-message">{error.addTopic}</div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="cancel-btn"
                  disabled={loading.addTopic}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading.addTopic}
                >
                  {loading.addTopic ? 'Adding...' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isAddNoteModalOpen && selectedTopic && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Add Note to "{selectedTopic.name}"</h2>
              <button 
                onClick={() => {
                  setIsAddNoteModalOpen(false);
                  setSelectedTopic(null);
                }}
                className="close-btn"
                disabled={loading.addNote}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddNote} className="note-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Note Title *</label>
                  <input
                    type="text"
                    placeholder="Enter note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="form-input"
                    required
                    autoFocus
                    disabled={loading.addNote}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    value={newNote.description}
                    onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                    className="form-input"
                    disabled={loading.addNote}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  placeholder="Enter note content..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  className="form-textarea"
                  rows="8"
                  required
                  disabled={loading.addNote}
                />
              </div>

              <div className="form-group">
                <label>Image URLs (one per line)</label>
                <textarea
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  value={newNote.images.join('\n')}
                  onChange={(e) => setNewNote({
                    ...newNote, 
                    images: e.target.value.split('\n').filter(url => url.trim())
                  })}
                  className="form-textarea"
                  rows="3"
                  disabled={loading.addNote}
                />
              </div>
              
              {error.addNote && (
                <div className="error-message">{error.addNote}</div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddNoteModalOpen(false);
                    setSelectedTopic(null);
                  }}
                  className="cancel-btn"
                  disabled={loading.addNote}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading.addNote}
                >
                  {loading.addNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}