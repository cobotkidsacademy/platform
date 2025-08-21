import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/header/Header";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOverlay, setCurrentOverlay] = useState(null); // 'notes' or 'assignment'
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://platform-zl0a.onrender.com/cobotKidsKenya/courses/${courseId}`
        );
        setCourse(response.data);
        setTopics(response.data.topics || []);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load course data"
        );
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const openNotesOverlay = (topic) => {
    setSelectedTopic(topic);
    setCurrentOverlay("notes");
  };

  const openAssignmentOverlay = (topic) => {
    setSelectedTopic(topic);
    setCurrentOverlay("assignment");
  };

  const closeOverlay = () => {
    setCurrentOverlay(null);
    setSelectedTopic(null);
  };

  if (loading) {
    return (
      <div className="course-detail-container">
        <Header />
        <div className="loading">Loading course data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail-container">
        <Header />
        <div className="error">{error}</div>
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-container">
        <Header />
        <div className="error">Course not found</div>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
      <div className="course-detail-content w-full max-w-5xl mx-auto p-4 sm:p-6">
        {/* Course Header */}
        <div className="course-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Course Info */}
          <div className="course-info flex items-center gap-4">
            <img
              src={course.courseIcon}
              alt={course.courseName}
              className="w-50 h-26 sm:w-50 sm:h-26  object-contain "
            />
            <div className="course-details">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {course.courseName}
              </h1>
              <p className="course-code text-sm sm:text-base text-gray-500">
                Code: {course.code}
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            className="back-btn"
            onClick={() => navigate("/studentdashboard")}
          >
            ← Back to Home
          </button>
        </div>

        {/* Topics Section */}
        <div className="topics-section">
          <h2 className="text-[2rem] text-gray-800 text-center">Course Topics</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={course.courseIcon}
                  alt={topic.name}
                  className="w-100% h-50% object-contain mb-4"
                />
                <h6 className="text-lg font-semibold text-gray-800">
                  {topic.name}
                </h6>
                <p className="text-sm text-gray-500 mb-4">
                  {topic.notes?.length || 0} notes available
                </p>
                <div className="flex gap-3 mt-auto">
                  <button
                    className="back-btn"
                    onClick={() => openNotesOverlay(topic)}
                  >
                    View Notes
                  </button>
                  <button
                    className="back-btn"
                    onClick={() => openAssignmentOverlay(topic)}
                  >
                    View Assignment
                  </button>
                </div>
              </div>
            ))}
          </div>

          {topics.length === 0 && (
            <div className="no-topics">
              <p>No topics available for this course yet.</p>
            </div>
          )}
        </div>

        {/* Notes Overlay */}
        {currentOverlay === "notes" && selectedTopic && (
          <div className="overlay">
            <button className="note-close-btn" onClick={closeOverlay}>
              Back TO TOPICS
            </button>
            <div className="overlay-content">
              <h2>Notes for: {selectedTopic.name}</h2>
              <div className="notes-list">
                {selectedTopic.notes?.length > 0 ? (
                  selectedTopic.notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <h3>Topic {index + 1}</h3>
                      <div className="note-content">
                        <div>
                          {/* <p>Lorem ipsu repudiandae incidunt cumque quam corporis, vel distinctio? Esse soluta iure numquam recusandae sit maxime excepturi, quae repellat nobis aliquam architecto enim consectetur velit facere ut rem tempora.</p> */}
                          <p>{note.content}</p>
                        </div>
                        <div>
                          {note.images?.length > 0 && (
                            <div className="note-images">
                              {note.images.map((img, i) => (
                                <img
                                  key={i}
                                  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzByYTNjZnNkM2FsN2pyMnA4eTgwZ3FvMWlwYTkwYXVzN2ppcmU0ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uwE0bmgRskj4T2sasc/giphy.gif"
                                  alt={`Note ${index + 1} image ${i + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No notes available for this topic.</p>
                )}
              </div>
              {/* Course Link Button at bottom of Notes Overlay */}
              {course.courseLink && (
                <div className="overlay-footer">
                  <a
                    href={course.courseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="course-link-btn"
                  >
                    Go To {selectedTopic.name}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignment Overlay */}
        {currentOverlay === "assignment" && selectedTopic && (
          <div className="overlay">
            <div className="overlay-content">
              <button className="close-btn" onClick={closeOverlay}>
                ×
              </button>
              <h2>Assignment for: {selectedTopic.name}</h2>
              <div className="assignment-content">
                {selectedTopic.coursework?.length > 0 ? (
                  selectedTopic.coursework.map((assignment, index) => (
                    <div key={index} className="assignment-item">
                      <h3>Assignment {index + 1}</h3>
                      <p>{assignment.content}</p>
                      <div className="assignment-meta">
                        <span>
                          Due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No assignments available for this topic.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
