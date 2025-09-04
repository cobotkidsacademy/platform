import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ComingSoon from "../../components/comingSoon/ComingSoon";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBookOpen, 
  faLink, 
  faBuilding, 
  faUsers, 
  faKey,
  faChartLine,
  faStar,
  faExclamationCircle,
  faCalendarAlt,
  faArrowRight,
  faSearch,
  faFilter,
  faSort,
  faSortAmountDown,
  faUndo,
  faEllipsisV,
  faUserGraduate,
  faSchool,
  faChalkboardTeacher
} from '@fortawesome/free-solid-svg-icons';
import './TutorDashboard.css';

function TutorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');  
  const [showSelfRegistration, setShowSelfRegistration] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');
  const [recentCodes, setRecentCodes] = useState({});
  const [tutorDetails, setTutorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch tutor details and assignments
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const profileRaw = localStorage.getItem('tutor_profile');
        if (!profileRaw) {
          console.error('No tutor profile found in localStorage');
          return;
        }
        
        let profile;
        try {
          profile = JSON.parse(profileRaw);
        } catch (e) {
          console.error('Failed to parse tutor profile:', e);
          return;
        }

        const tutorId = profile?.id;
        if (!tutorId) {
          console.error('No tutor ID found in profile');
          return;
        }

        // Fetch tutor details
        try {
          const tutorResponse = await axios.get(`${API_URL}/cobotKidsKenya/tutors/${tutorId}`);
          setTutorDetails(tutorResponse.data?.data || null);
        } catch (err) {
          console.error("Failed to fetch tutor details:", err);
        }

        // Fetch assignments
        try {
          setAssignmentsLoading(true);
          const assignmentsResponse = await axios.get(`${API_URL}/cobotKidsKenya/tutors/${tutorId}/assignments`);
          setAssignments(Array.isArray(assignmentsResponse.data?.data) ? assignmentsResponse.data.data : []);
        } catch (err) {
          console.error("Failed to fetch assignments:", err);
          setAssignmentsError("Failed to load assignments");
        }

      } catch (err) {
        console.error("Error in fetchTutorData:", err);
        setError("An error occurred while loading data");
      } finally {
        setLoading(false);
        setAssignmentsLoading(false);
      }
    };

    fetchTutorData();
  }, [API_URL]);

  // Dashboard stats
  const dashboardStats = {
    schools: assignments.length || 0,
    classes: assignments.reduce((sum, a) => sum + (a.classes?.length || 0), 0) || 0,
    rating: 0
  };

  const generateSelfRegistrationCode = () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setShowSelfRegistration(true);
      alert(`Generated Code: ${code}`);
    } catch (err) {
      console.error("Error generating code:", err);
      alert("Failed to generate code");
    }
  };

  const handleGenerateClassCode = async (schoolId, classId) => {
    try {
      const res = await axios.post(
        `${API_URL}/cobotKidsKenya/schools/${schoolId}/classes/${classId}/generateCode`, 
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const payload = res?.data?.data;
      if (payload?.code) {
        setRecentCodes(prev => ({ 
          ...prev, 
          [classId]: { 
            code: payload.code, 
            validUntil: payload.validUntil 
          } 
        }));
        alert(`Class code for ${payload.className || 'class'} (${payload.schoolName || 'school'}): ${payload.code}`);
      } else {
        console.error("Code generated but response had no code value");
        alert('Code generated but response had no code value');
      }
    } catch (err) {
      console.error("Failed to generate class code:", err);
      alert(err?.response?.data?.error || 'Failed to generate class code');
    }
  };
  const renderDashboard = () => (
    <div className="dashboard-overview">
      <h1>Hello {tutorDetails?.fname || 'Tutor'}, Here is an overview of your tutor's dashboard.</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card self-registration">
          <div className="card-icon">
            <FontAwesomeIcon icon={faKey} />
          </div>
          <h3>Self-Registration</h3>
          <p>Students can use a code to register themselves — no admin needed.</p>
          <button className="generate-code-btn" onClick={generateSelfRegistrationCode}>
            Generate Code
          </button>
        </div>

        <div className="metrics-column">
          <div className="metric-card">
            <h4>Number of schools</h4>
            <div className="metric-value">{dashboardStats.schools}</div>
          </div>
          
          <div className="metric-card">
            <h4>Number of classes</h4>
            <div className="metric-value">{dashboardStats.classes}</div>
          </div>
          
          <div className="metric-card">
            <h4>Overall Rating</h4>
            <div className="metric-value">{dashboardStats.rating} out of 4</div>
          </div>
        </div>

        <div className="dashboard-card performance-card">
          <h3>Your Overall Performance</h3>
          <p>This shows your overall performance in a school.</p>
          
          <div className="performance-tabs">
            <button className={`tab-btn ${activeTab === 'schools' ? 'active' : ''}`}>
              Schools
            </button>
            <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}>
              Students
            </button>
          </div>
          
          <div className="performance-content">
            {/* Performance data would go here */}
          </div>
        </div>

        <div className="dashboard-card quiz-score-card">
          <h3>10 Weekly Average Quiz Score</h3>
          <p>All Courses</p>
          <div className="quiz-content">
            {/* Quiz score data would go here */}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="students-management">
      <h1>Student Management</h1>
      <ComingSoon />
    </div>
  );

  const renderSchools = () => (
    <div className="schools-management">
      <h1>School List</h1>
      <p>Here is a list of all the schools you have been assigned to</p>
      
      <div className="search-section">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {assignments.length > 0 ? (
        <div className="schools-grid">
          {assignments.map(school => (
            <div key={school.schoolId || Math.random()} className="school-card">
              <div className="school-icon">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <h3>{school.schoolName || 'Unnamed School'}</h3>
              <p>{school.schoolLocation || 'Location not specified'}</p>
              <div className="school-stats">
                <span>{(school.studentCount || 0)} Students</span>
                <span className="status active">Active</span>
              </div>
              <Link 
                to={`/schools/${school.schoolId}/classes`}
                className="view-school-btn"
              >
                View Classes
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <p>No Schools found</p>
        </div>
      )}
    </div>
  );

  const renderLessons = () => (
    <div className="lessons-management">
      <h1>Classes</h1>

      {assignmentsLoading && (
        <div className="empty-state"><p>Loading your classes...</p></div>
      )}
      {assignmentsError && (
        <div className="empty-state"><p>{assignmentsError}</p></div>
      )}

      {!assignmentsLoading && !assignmentsError && (
        assignments?.length > 0 ? (
          <div className="lessons-grid">
            {assignments.map(assign => (
              (assign.classes || []).filter(c => c.isActive).map(cls => (
                <div key={`${assign.schoolId}-${cls.classId}`} className="lesson-card">
                  <div className="lesson-icon">
                    <FontAwesomeIcon icon={faBookOpen} />
                  </div>
                  <h3>{cls.className || 'Unnamed Class'}</h3>
                  <p>{assign.schoolName} ({assign.schoolCode})</p>
                  {recentCodes[cls.classId] ? (
                    <p>Current Code: <strong>{recentCodes[cls.classId].code}</strong></p>
                  ) : null}
                  <button 
                    className="view-school-btn" 
                    onClick={() => handleGenerateClassCode(assign.schoolId, cls.classId)}
                  >
                    Generate Class Code
                  </button>
                </div>
              ))
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <p>No classes found for your assignments</p>
          </div>
        )
      )}
    </div>
  );

  const renderFormLinks = () => (
    <div className="form-links-management">
      <h1>Form Links</h1>
      <div className="empty-state">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <p>No form links available</p>
      </div>
    </div>
  );

  return (
    <div className="tutor-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">C</div>
            <div className="logo-text">
              <h2>Cobot KIDS kENYA</h2>
              <p>CODING FOR KIDS</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <FontAwesomeIcon icon={faBookOpen} />
            <span>Lessons</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'formLinks' ? 'active' : ''}`}
            onClick={() => setActiveTab('formLinks')}
          >
            <FontAwesomeIcon icon={faLink} />
            <span>Form Links</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'schools' ? 'active' : ''}`}
            onClick={() => setActiveTab('schools')}
          >
            <FontAwesomeIcon icon={faBuilding} />
            <span>Schools</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>Students</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <FontAwesomeIcon icon={faUserGraduate} />
            </div>
            <div className="user-info">
              <h4>{tutorDetails ? `${tutorDetails.fname} ${tutorDetails.lname}` : 'Loading...'}</h4>
              <p>{tutorDetails?.username || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'schools' && renderSchools()}
            {activeTab === 'lessons' && renderLessons()}
            {activeTab === 'formLinks' && renderFormLinks()}
          </>
        )}
      </main>
    </div>
  );
}

export default TutorDashboard;