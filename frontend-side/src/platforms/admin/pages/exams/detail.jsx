import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ExamDetailPage = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const loadExam = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/courses/${courseId}/exams/${examId}`);
      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || 'Failed to fetch exam');
      }
      setExam(result.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExam(); }, [courseId, examId]);

  const addQuestion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/courses/${courseId}/exams/${examId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionForm)
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || 'Failed to add question');
      }
      setExam(prev => ({ ...prev, questions: [...prev.questions, result.data] }));
      setQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: '', points: 1 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const publishExam = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/courses/${courseId}/exams/${examId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || 'Failed to publish exam');
      }
      setExam(result.data);
      alert('Exam published');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading && !exam) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error && !exam) return <div style={{ padding: 20, color: '#d32f2f' }}>{error}</div>;
  if (!exam) return null;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>Back</button>
      <h1>{exam.title}</h1>
      <p>Duration: {exam.duration} minutes</p>
      <p>Scheduled: {new Date(exam.scheduledAt).toLocaleString()}</p>

      <div style={{ margin: '16px 0' }}>
        <button onClick={publishExam} disabled={loading}>Publish</button>
      </div>

      <h2>Questions</h2>
      {exam.questions?.length ? (
        <ol>
          {exam.questions.map((q) => (
            <li key={q._id} style={{ marginBottom: 8 }}>
              <div>{q.question}</div>
              <ul>
                {q.options.map((opt, idx) => (
                  <li key={idx} style={{ listStyle: 'disc', marginLeft: 16 }}>
                    {opt} {opt === q.correctAnswer ? <strong>(correct)</strong> : ''}
                  </li>
                ))}
              </ul>
              <small>Points: {q.points}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p>No questions yet.</p>
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Add Question</h3>
        <form onSubmit={addQuestion}>
          <div style={{ marginBottom: 8 }}>
            <label>Question</label>
            <input value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} required style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {questionForm.options.map((opt, idx) => (
              <input
                key={idx}
                value={opt}
                placeholder={`Option ${idx + 1}`}
                onChange={(e) => {
                  const next = [...questionForm.options];
                  next[idx] = e.target.value;
                  setQuestionForm({ ...questionForm, options: next });
                }}
                required
              />
            ))}
          </div>
          <div style={{ margin: '8px 0' }}>
            <label>Correct Answer</label>
            <select value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} required>
              <option value="">Select correct option</option>
              {questionForm.options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt || `Option ${idx + 1}`}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Points</label>
            <input type="number" min={1} value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: Number(e.target.value) })} />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Question'}</button>
        </form>
      </div>
    </div>
  );
};

export default ExamDetailPage;




