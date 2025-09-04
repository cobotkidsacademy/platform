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
          <nav className="flex flex-col gap-2 p-6 w-full md:w-[350px] bg-gradient-to-b from-gray-50 to-white shadow-lg rounded-xl border border-gray-100">
            {/* Courses Button */}
            <button
              className={`relative flex items-center gap-4 w-full p-4 mt-6 h-16 text-left rounded-xl transition-all duration-500 transform hover:scale-[1.02] bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg group overflow-hidden ${
                activeTab === "courses"
                  ? "bg-blue-100/80 text-blue-600 font-bold shadow-inner border border-blue-200/50"
                  : "text-gray-700 hover:bg-gray-100/80 hover:text-blue-500"
              } group overflow-hidden`}
              onClick={() => setActiveTab("courses")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 z-10">
                <i className="fa-solid fa-chalkboard-user"></i>
              </span>
              <span className="text-lg font-medium z-10">All Courses</span>
              <span className="ml-auto text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-chevron-right"></i>
              </span>
            </button>

            {/* Challenges Button */}
            <button
              className={`relative flex items-center gap-4 w-full p-4 mb-1 text-left rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                activeTab === "challenges"
                  ? "bg-blue-100/80 text-blue-600 font-bold shadow-inner border border-blue-200/50"
                  : "text-gray-700 hover:bg-gray-100/80 hover:text-blue-500"
              } group overflow-hidden`}
              onClick={() => setActiveTab("challenges")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 z-10">
                <i className="fa-solid fa-chalkboard"></i>
              </span>
              {/* Uncomment if needed */}
              {/* <span className="text-lg font-medium z-10">Challenges</span> */}
              <span className="ml-auto text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-chevron-right"></i>
              </span>
            </button>

            {/* Performance Button */}
            <button
              className={`relative flex items-center gap-4 w-full p-4 mt-6 h-16 text-left rounded-xl transition-all duration-500 transform hover:scale-[1.02] bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg group overflow-hidden ${
                activeTab === "performance"
                  ? "bg-blue-100/80 text-blue-600 font-bold shadow-inner border border-blue-200/50"
                  : "text-gray-700 hover:bg-gray-100/80 hover:text-blue-500"
              } group overflow-hidden`}
              onClick={() => setActiveTab("performance")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 z-10">
                <i className="fa-solid fa-graduation-cap"></i>
              </span>
              <span className="text-lg font-medium z-10">My Performance</span>
              <span className="ml-auto text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-chevron-right"></i>
              </span>
            </button>

            {/* Exam Room Button - Special Styling */}
            <button
              className="relative flex items-center gap-4 w-full p-4 mt-6 h-16 text-left rounded-xl transition-all duration-500 transform hover:scale-[1.02] bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg group overflow-hidden"
              onClick={() => setShowExamModal(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110 z-10">
                <i className="fa-solid fa-door-open"></i>
              </span>
              <span className="text-lg z-10">Enter Exam Room</span>
              <span className="ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 animate-pulse">
                <i className="fas fa-arrow-right"></i>
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-300/50 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700"></div>
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
                className="bg-white shadow-md rounded-2xl h-aouto  flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 
                 animate-[wiggle_3s_ease-in-out_infinite]"
              >
                {/* Status badge */}
                <span>{course.status}</span>
                {/* Course image */}
                <img
                  src={course.courseIcon}
                  alt={course.courseName}
                  className="w-100% h-50% object-contain mb-4 rounded-t-lg "
                />
                <br />
                <div class="flex gap-10 mt-auto ">
                  {/* Course name */}
                  <p class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-red">
                    {course.courseName}
                  </p>
                  {/* Badges */}
                  <div className="flex gap-2 mt-3 justify-center">
                    {/* Code badge */}
                    <span className="back-btn">{course.code}</span>
                  </div>
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
