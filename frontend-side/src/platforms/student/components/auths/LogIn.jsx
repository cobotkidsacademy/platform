import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./StudentAuth.css";

// Get API URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL ;

function LogIn() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const navigate = useNavigate();

  const validateUsername = (input) => {
    const regex = /^[a-z]{3}-[a-z]+\.[a-z]+$/;
    return regex.test(input);
  };

  const handleUsernameChange = (e) => {
    let input = e.target.value;
    
    // Convert spaces to dots
    input = input.replace(/\s+/g, '.');
    
    // Remove any special characters (only allow letters, hyphen, dot)
    input = input.replace(/[^a-zA-Z-.]/g, '');
    
    // Convert to lowercase
    input = input.toLowerCase();
    
    // Auto-format the username as user types
    if (input.length > 0) {
      // If user tries to type hyphen in wrong position, ignore it
      if (input.length <= 3 && input.includes('-')) {
        input = input.replace('-', '');
      }
      
      // Auto-insert hyphen after 3 characters if not present
      if (input.length > 3 && !input.includes('-')) {
        input = input.substring(0, 3) + "-" + input.substring(3);
      }
      
      // If we have a hyphen, handle the name parts
      if (input.includes('-')) {
        const parts = input.split('-');
        const schoolCode = parts[0].substring(0, 3); // Ensure school code is exactly 3 chars
        let namePart = parts.length > 1 ? parts[1] : '';
        
        // Handle multiple dots in name part
        if (namePart.includes('.')) {
          const nameParts = namePart.split('.');
          namePart = nameParts[0] + (nameParts.length > 1 ? '.' + nameParts.slice(1).join('') : '');
        }
        
        input = schoolCode + '-' + namePart;
      }
    }
    
    setUserName(input);
    setUsernameError(validateUsername(input) ? "" : "Username must be in format: abc-firstname.lastname");
  };

  // Auto-validate username when it changes
  useEffect(() => {
    if (userName.length > 0) {
      setUsernameError(validateUsername(userName) ? "" : "Username must be in format: abc-firstname.lastname");
    }
  }, [userName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateUsername(userName)) {
      setUsernameError("Please enter a valid username in format: abc-firstname.lastname");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Use the environment variable for API URL
      const response = await axios.post(`${API_BASE_URL}/cobotKidsKenya/students/login`, {
        userName,
        password
      });

      if (response.data.success) {
        // Store both student and class information
        localStorage.setItem('studentId', response.data.data.student.id);
        localStorage.setItem('classId', response.data.data.class.id);
        
        // Optional: Store the entire class object if needed
        localStorage.setItem('classInfo', JSON.stringify(response.data.data.class));
        
        // Store school info if needed
        localStorage.setItem('schoolInfo', JSON.stringify(response.data.data.school));
        console.log(localStorage)
        navigate('/studentdashboard', { 
          state: { 
            student: response.data.data.student,
            classInfo: response.data.data.class,
            schoolInfo: response.data.data.school
          } 
        });
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
     <div class="student-login-container">
        <div class="login-form">
            <h2>Welcome Back!</h2>
            <p class="subtitle">Please login to continue</p>
             <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">User Name</label>
            <input
              type="text"
              placeholder="sra-james.smith"
              value={userName}
              onChange={handleUsernameChange}
              className={usernameError ? "invalid-input" : ""}
              required
              style={{fontSize:"1.5rem"}}
              maxLength={50}
            />
            <div className="input-hint">
              Format: schoolcode-firstname.lastname (e.g., sra-james.smith or type "sra james smith")
            </div>
            {usernameError && (
              <div className="error-message">{usernameError}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              className="form-control rounded-0"
              maxLength={4}
              style={{fontSize:"2.5rem"}}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading || !validateUsername(userName) || password.length < 4}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>     

            <div class="signup-section">
                <p>Don't have an account?</p>
                <a href="#" class="signup-btn">
                    Ask Your Teacher
                </a>
            </div>
        </div>
    </div>
  );
}

export default LogIn;