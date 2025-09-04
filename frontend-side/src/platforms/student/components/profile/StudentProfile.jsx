import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from '@mui/material/Button';
function StudentProfile() {
  const [studentData, setStudentData] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseStats, setCourseStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    certificates: 0,
  });

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: (theme.vars ?? theme).palette.text.secondary,
    ...theme.applyStyles("dark", {
      backgroundColor: "#1A2027",
    }),
  }));

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudentAndCourseData = async () => {
      try {
        const studentId = localStorage.getItem("studentId");
        if (!studentId) throw new Error("No student ID found");

        // Fetch student data
        const studentResponse = await axios.get(
          `${API_URL}/cobotKidsKenya/students/${studentId}`
        );

        if (!studentResponse.data.success) {
          throw new Error(
            studentResponse.data.error || "Failed to fetch student data"
          );
        }

        setStudentData(studentResponse.data.student);

        // Fetch all courses from the database
        const coursesResponse = await axios.get(
          `${API_URL}/cobotKidsKenya/courses`
        );

        if (coursesResponse.data.success) {
          setCourseData(coursesResponse.data.courses);

          // Filter courses for this student (assuming courses have studentId field)
          const studentCourses = coursesResponse.data.courses.filter(
            (course) => course.studentId === studentId
          );

          // Calculate statistics
          const completed = studentCourses.filter(
            (c) => c.status === "completed"
          ).length;
          const inProgress = studentCourses.filter(
            (c) => c.status === "enrolled"
          ).length;

          setCourseStats({
            total: studentCourses.length,
            completed,
            inProgress,
            certificates: completed, // or completed + inProgress depending on your logic
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.error || err.message || "Error fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndCourseData();
  }, [API_URL]);

  if (loading) {
    return <div className="loading-message">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!studentData) {
    return <div className="no-data-message">No student data available</div>;
  }

  // Calculate attendance percentage
  const calculateAttendance = () => {
    if (!studentData.attendanceRecords) return "N/A";
    const total = studentData.attendanceRecords.length;
    const present = studentData.attendanceRecords.filter(
      (r) => r.status === "present"
    ).length;
    return `${Math.round((present / total) * 100)}%`;
  };

  return (
    <div className="max-w-full bg-gradient-to-br from-gray-50 to-white shadow-lg border border-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex justify-between flex-wrap rounded-xl overflow-hidden font-inter h-[10%] w-[100%]">
      {/* Profile Info */}
      <div className="flex items-center gap-8 p-8 flex-1">
        {/* Profile Pic */}

        <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-sky-400 to-sky-100 flex justify-center items-center shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <i className="fas fa-user-astronaut text-6xl text-blue-900">
            {/* <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyhuMOA9yuJLNoJDGQFL0lfvwwLoF1SBWMJw&s"></img> */}
          </i>

          {/* Upload Indicator */}
          <div className="absolute bottom-2 right-2 w-9 h-9 bg-orange-600 rounded-full flex justify-center items-center text-white shadow-md transition-transform duration-300 hover:scale-110">
            <i className="fas fa-camera"></i>
          </div>

          {/* Add Photo text */}
          <div className="absolute -bottom-7 w-full text-center text-sm font-medium text-orange-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-bottom-8">
            Add Photo
          </div>
        </div>

        {/* Info Text */}
        <div className="flex-1">
          <h4 className="text-2xl font-bold text-orange-600 tracking-tight">
            {studentData.fname} {studentData.lname}
          </h4>
          <h5 className="text-orange-500 font-semibold inline-block mt-2 mb-4 px-3 py-1 bg-orange-100 rounded-md">
            Class : {studentData.className || "Class Not Available"}
          </h5>
          <p className="text-orange-700 font-semibold leading-relaxed mb-6 max-w-md">
            <strong>School:</strong> {studentData.schoolName || "N/A"} <br />
            <strong>Username:</strong> {studentData.username}
          </p>

          {/* Stats */}
          <Box sx={{ "& > :not(style)": { m: 1 } }}>
            <Fab variant="extended">Points: {studentData.points || 0}</Fab>
            <Fab variant="extended">
              {" "}
              Joined {new Date(studentData.createdAt).toLocaleDateString()}
            </Fab>
            <Fab variant="extended">Performance: {studentData.performance}</Fab>
            <Fab variant="extended">Attendance: {calculateAttendance()}</Fab>
          </Box>
        </div>
      </div>

      {/* Courses Profile */}
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={8}>
            <Item
              sx={{
                height: 70,
                 paddingTop:3,
                 color:"white",
                fontSize:20,
                borderRadius: 1,
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {" "}
              Total Courses
            </Item>
          </Grid>
          <Grid size={4}>
            <Item
              sx={{
                height: 70,
                 paddingTop:3,
                 color:"white",
                fontSize:20,
                borderRadius: 1,
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {" "}
              {courseStats.completed} Completed
            </Item>
          </Grid>
          <Grid size={4}>
            <Item
              sx={{
                height: 70,
                 paddingTop:3,
                 color:"white",
                fontSize:20,
                borderRadius: 1,
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {" "}
              {courseStats.inProgress} In Progress
            </Item>
          </Grid>
          <Grid size={8}>
            <Item
              sx={{
                height: 70,
                color:"white",
                paddingTop:3,
                fontSize:20,
                borderRadius: 1,
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {" "}
              {courseStats.certificates} Certificates
            </Item>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default StudentProfile;
