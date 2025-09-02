import React, { useState, useEffect } from "react";
import "./StudentDashBoard.css";
import StudentProfile from "../components/profile/StudentProfile";
import ComingSoon from "../../../components/comingSoon/ComingSoon";
import Header from "../components/header/Header";
import { useNavigate } from "react-router-dom";

const StudentDashBoard = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classCode, setClassCode] = useState("");
  const [classCodeError, setClassCodeError] = useState("");
  const [showExamModal, setShowExamModal] = useState(false);
  const [examCode, setExamCode] = useState("");
  const [examJoinError, setExamJoinError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch courses from backend when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${API_URL}/cobotKidsKenya/courses`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [API_URL]); // Added API_URL as dependency

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowClassCodeModal(true);
    setClassCode("");
    setClassCodeError("");
  };

  const handleClassCodeSubmit = async (e) => {
    e.preventDefault();

    if (!classCode.trim()) {
      setClassCodeError("Please enter a class code");
      return;
    }

    try {
      // Verify class code with backend
      const response = await fetch(
        `${API_URL}/cobotKidsKenya/verifyClassCode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classCode: classCode.trim(),
            courseId: selectedCourse._id,
            studentId: localStorage.getItem("studentId"),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Optionally store a flag or notify attendance recorded
        if (data.data?.attendanceRecorded) {
          console.log('Attendance recorded for lesson:', data.data.lessonId);
        }
        setShowClassCodeModal(false);
        // Navigate to course details page
        navigate(`/course/${selectedCourse._id}`, {
          state: {
            course: selectedCourse,
            classCode: classCode.trim(),
          },
        });
      } else {
        setClassCodeError(data.error || "Invalid class code");
      }
    } catch (err) {
      setClassCodeError("Failed to verify class code. Please try again.");
      console.error("Error verifying class code:", err);
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setExamJoinError("");

    const trimmed = examCode.trim();
    if (!trimmed) {
      setExamJoinError("Please enter your exam code");
      return;
    }

    try {
      // 1) Resolve code to exam
      const res = await fetch(
        `${API_URL}/cobotKidsKenya/exams/code/${encodeURIComponent(
          trimmed
        )}`
      );
      const data = await res.json();
      if (!data.success) {
        setExamJoinError(data.error || "Invalid exam code");
        return;
      }

      const exam = data.data;

      // 2) Register attempt if not already
      const studentId = localStorage.getItem("studentId");
      if (!studentId) {
        setExamJoinError("Please log in as a student to join the exam");
        return;
      }

      // Some servers may include attempts; register only if you are not already there
      const alreadyRegistered =
        Array.isArray(exam.attempts) &&
        exam.attempts.some((a) => a.student === studentId);
      if (!alreadyRegistered) {
        const regRes = await fetch(
          `${API_URL}/cobotKidsKenya/exams/${exam._id}/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, examCode: trimmed }),
          }
        );
        const regData = await regRes.json();
        if (!regData.success) {
          setExamJoinError(regData.error || "Failed to register for the exam");
          return;
        }
      }

      // 3) Navigate to ExamRoom
      setShowExamModal(false);
      setExamCode("");
      navigate(`/ExamRoom?examId=${exam._id}`);
    } catch (err) {
      console.error("Exam join error:", err);
      setExamJoinError("Failed to join the exam. Please try again.");
    }
  };
  if (loading) {
    return (
      <div className="student-dashboard-container">
        <div className="loading-spinner">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard-container">
      {/* Header */}
      <Header />
      <StudentProfile />

      {/* Main Content */}
      <div className="student-student-navigation">
        {/* Sidebar */}
        <aside className="student-navigation-sidebar">
          <nav>
            <button
              className={`student-navigation-btn ${
                activeTab === "courses" ? "active" : ""
              }`}
              onClick={() => setActiveTab("courses")}
            >
              <span className="icon">
                <i class="fa-solid fa-chalkboard-user"></i>
              </span>
              <span className="icon-name">All Courses</span>
            </button>

            <button
              className={`student-navigation-btn ${
                activeTab === "challenges" ? "active" : ""
              }`}
              onClick={() => setActiveTab("challenges")}
            >
              <span className="icon">
                <i class="fa-solid fa-chalkboard"></i>
              </span>
              <span className="icon-name">Challenges</span>
            </button>

            <button
              className={`student-navigation-btn ${
                activeTab === "performance" ? "active" : ""
              }`}
              onClick={() => setActiveTab("performance")}
            >
              <span className="icon">
                <i class="fa-solid fa-graduation-cap"></i>
              </span>
              <span className="icon-name">My Performance</span>
            </button>

            <button
              className="student-exam-room-btn"
              onClick={() => setShowExamModal(true)}
            >
              <span className="icon">
                <i class="fa-solid fa-door-open"></i>
              </span>
              <span className="icon-name">Enter Exam Room</span>
            </button>
          </nav>
        </aside>

        {/* Main Panel */}
        <main className="main-panel">
          {/* Courses Tab */}
          <div className="student-courses-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 auto-rows-fr">
            {courses.map((course) => (
              <div
                key={course._id || course.id}
                onClick={() => handleCourseClick(course)}
                className="magic-button 
                 animate-[wiggle_3s_ease-in-out_infinite]"
              >
                
                {/* Status badge */}
                <span
                  className={`status-button${
                    course.status === "completed"
                      ? "bg-green-500/90 text-white hover:bg-green-600"
                      : course.status === "enrolled"
                      ? "bg-yellow-400/90 text-gray-900 hover:bg-yellow-500"
                      : "bg-gray-400/80 text-white hover:bg-gray-500"
                  }`}
                >
                  {course.status}
                </span>
                {/* Course image */}
                <img
                  src={course.courseIcon}
                  alt={course.courseName}
                  className="rounded-t-lg "
                />
                <div class="p-5">
                  {/* Course name */}
                  <h3 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {course.courseName}
                  </h3>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mt-3 justify-center">
                  {/* Code badge */}
                  <span className="code-button">
                    {course.code}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <style>
            {`
@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-3deg); }
  20% { transform: rotateZ(3deg); }
  25% { transform: rotateZ(-3deg); }
  30% { transform: rotateZ(3deg); }
  35% { transform: rotateZ(-3deg); }
  40%, 100% { transform: rotateZ(0); }
}
`}
          </style>

          {/* Challenges Tab */}
          {activeTab === "challenges" && (
            <div className="challenges-section">
              <h2>Current Challenges</h2>
              <div className="challenges-list">
               
                  <ComingSoon />
                
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="performance-section">
              <h2>My Performance</h2>
              <ComingSoon />
            </div>
          )}
        </main>
      </div>

      {/* Class Code Modal */}
      {showClassCodeModal && (
        <div className="modal-overlay">
          <div className="overlay-modal-content">
            <h2>Enter Class Code</h2>
            <p>
              Please enter the class code provided by your tutor to access this
              course.
            </p>

            <form onSubmit={handleClassCodeSubmit}>
              <div className="modal-form-group">
                <label htmlFor="classCode">Class Code:</label>
                <input
                  type="text"
                  id="classCode"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  placeholder="Enter 3-digit class code"
                  maxLength="3"
                  required
                  className={classCodeError ? "error" : ""}
                />
                {classCodeError && (
                  <span className="error-message">{classCodeError}</span>
                )}
              </div>

              <div className="overlay-modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowClassCodeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Enter Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="modal-overlay">
          <div className="overlay-modal-content">
            <h1>Enter Exam Room</h1>
            <p>Please enter your exam code to proceed.</p>
            <form onSubmit={handleExamSubmit}>
              <div className="modal-form-group">
                <label htmlFor="examCode">Exam Code:</label>
                <input
                  type="text"
                  id="examCode"
                  value={examCode}
                  onChange={(e) => setExamCode(e.target.value)}
                  placeholder="e.g. WEB-ABC123"
                  required
                  className={examJoinError ? "error" : ""}
                />
                {examJoinError && (
                  <span className="error-message">{examJoinError}</span>
                )}
              </div>
              <div className="overlay-modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowExamModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Join Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashBoard;
