import React, { useEffect, useMemo, useState } from 'react';

const TutorAssignmentsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const classesForSelectedSchool = useMemo(() => {
    const s = schools.find(sc => sc._id === selectedSchool);
    return s?.classes || [];
  }, [schools, selectedSchool]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/tutors`);
      const result = await res.json();
      if (!res.ok || result.success === false) throw new Error(result.error || 'Failed to fetch tutors');
      setTutors(result.data || []);
      if ((result.data || []).length && !selectedTutor) setSelectedTutor(result.data[0]._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/schools`);
      if (!res.ok) throw new Error('Failed to fetch schools');
      const data = await res.json();
      setSchools(data || []);
      if ((data || []).length && !selectedSchool) setSelectedSchool(data[0]._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (tutorId) => {
    if (!tutorId) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/tutors/${tutorId}/assignments`);
      const result = await res.json();
      if (!res.ok || result.success === false) throw new Error(result.error || 'Failed to fetch assignments');
      setAssignments(result.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
    loadSchools();
  }, []);

  useEffect(() => {
    if (selectedTutor) loadAssignments(selectedTutor);
  }, [selectedTutor]);

  const handleAssign = async () => {
    if (!selectedTutor || !selectedSchool || !selectedClass) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/tutors/${selectedTutor}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId: selectedSchool, classId: selectedClass })
      });
      const result = await res.json();
      if (!res.ok || result.success === false) throw new Error(result.error || 'Failed to assign tutor');
      await loadAssignments(selectedTutor);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (schoolId, classId) => {
    if (!selectedTutor) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/cobotKidsKenya/tutors/${selectedTutor}/assignments/${schoolId}/classes/${classId}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok || result.success === false) throw new Error(result.error || 'Failed to remove assignment');
      await loadAssignments(selectedTutor);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Assign Tutors</h1>

      {error && (
        <div style={{ background: '#fde8e8', color: '#d32f2f', padding: 10, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Tutor</label>
          <select value={selectedTutor} onChange={(e) => setSelectedTutor(e.target.value)} style={{ width: '100%' }}>
            {tutors.map(t => (
              <option key={t._id} value={t._id}>{t.fname} {t.lname} ({t.company})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>School</label>
          <select value={selectedSchool} onChange={(e) => { setSelectedSchool(e.target.value); setSelectedClass(''); }} style={{ width: '100%' }}>
            {schools.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ width: '100%' }}>
            <option value="">Select class</option>
            {classesForSelectedSchool.map(c => (
              <option key={c._id} value={c._id}>{c.name} ({c.level})</option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={handleAssign} disabled={!selectedTutor || !selectedSchool || !selectedClass || loading}>Assign</button>
        </div>
      </div>

      <h2 style={{ marginTop: 24 }}>Current Assignments</h2>
      {assignments.length === 0 ? (
        <p>No assignments for this tutor.</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          {assignments.map(a => (
            <div key={a.schoolId} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{a.schoolName} ({a.schoolCode})</div>
              {a.classes?.length ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Class</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Level</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.classes.map(c => (
                      <tr key={c.classId}>
                        <td style={{ padding: 8 }}>{c.className || c.classId}</td>
                        <td style={{ padding: 8 }}>{c.level || '-'}</td>
                        <td style={{ padding: 8 }}>
                          <button onClick={() => handleRemove(a.schoolId, c.classId)} disabled={loading}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ color: '#666' }}>No classes assigned for this school.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorAssignmentsPage;




