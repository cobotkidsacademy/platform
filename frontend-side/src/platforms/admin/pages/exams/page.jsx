import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ExamsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    scheduledAt: ''
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/courses`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
      if (data.length && !selectedCourse) {
        setSelectedCourse(data[0]._id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/courses/${courseId}/exams`);
      if (!res.ok) throw new Error('Failed to fetch exams');
      const result = await res.json();
      setExams(result.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (selectedCourse) loadExams(selectedCourse); }, [selectedCourse]);

  const selectedCourseObj = useMemo(() => courses.find(c => c._id === selectedCourse), [courses, selectedCourse]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/courses/${selectedCourse}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || 'Failed to create exam');
      }
      setExams(prev => [...prev, result.data]);
      setShowAddForm(false);
      setFormData({ title: '', duration: 60, scheduledAt: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Exams</h1>

      {error && (
        <div style={{ background: '#fde8e8', color: '#d32f2f', padding: 10, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">Select course</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.courseName} ({c.code})</option>
          ))}
        </select>

        <button onClick={() => setShowAddForm(true)} disabled={!selectedCourse || loading}>
          Create Exam
        </button>
      </div>

      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 20, width: '90%', maxWidth: 520, position: 'relative' }}>
            <h2 style={{ marginTop: 0 }}>Create Exam {selectedCourseObj ? `for ${selectedCourseObj.courseName}` : ''}</h2>
            <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>×</button>
            <form onSubmit={handleCreateExam}>
              <div style={{ marginBottom: 12 }}>
                <label>Title</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Duration (minutes)</label>
                <input type="number" min={1} value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} required style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Schedule At</label>
                <input type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })} required style={{ width: '100%' }} />
              </div>
              
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Exam'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {exams.length === 0 ? (
          <p>No exams for this course.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Title</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Code</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Duration</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Scheduled</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam._id}>
                  <td style={{ padding: 8 }}>{exam.title}</td>
                  <td style={{ padding: 8 }}>{exam.code}</td>
                  <td style={{ padding: 8 }}>{exam.status}</td>
                  <td style={{ padding: 8 }}>{exam.duration} min</td>
                  <td style={{ padding: 8 }}>{new Date(exam.scheduledAt).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>
                    <Link to={`/courses/${selectedCourse}/exams/${exam._id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExamsPage;


