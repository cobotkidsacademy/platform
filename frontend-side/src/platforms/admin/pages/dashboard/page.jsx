import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch schools
        const schoolsResponse = await fetch(`${API_URL}/cobotKidsKenya/schools`);
        const schools = await schoolsResponse.json();
        
        // Fetch courses
        const coursesResponse = await fetch(`${API_URL}/cobotKidsKenya/courses`);
        const courses = await coursesResponse.json();
        
        // Calculate stats
        const totalSchools = schools.length;
        const totalClasses = schools.reduce((sum, school) => sum + (school.classes?.length || 0), 0);
        const totalStudents = schools.reduce((sum, school) => 
          sum + school.classes?.reduce((classSum, classItem) => 
            classSum + (classItem.students?.length || 0), 0
          ) || 0, 0
        );
        const totalCourses = Array.isArray(courses) ? courses.length : 0;

        setStats({
          totalSchools,
          totalClasses,
          totalStudents,
          totalCourses
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the admin dashboard. Here's an overview of your platform.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>{stats.totalSchools}</h3>
            <p>Total Schools</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalClasses}</h3>
            <p>Total Classes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-button"
            onClick={() => window.location.href = '/schoolsPage'}
          >
            <span className="action-icon">🏫</span>
            <span>Manage Schools</span>
          </button>
          
          <button 
            className="action-button"
            onClick={() => window.location.href = '/coursePage'}
          >
            <span className="action-icon">📚</span>
            <span>Manage Courses</span>
          </button>
          
          <button 
            className="action-button"
            onClick={() => window.location.href = '/tutorsPage'}
          >
            <span className="action-icon">👨‍🏫</span>
            <span>Manage Tutors</span>
          </button>
          
          <button 
            className="action-button"
            onClick={() => window.location.href = '/examsPage'}
          >
            <span className="action-icon">📋</span>
            <span>Manage Exams</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;