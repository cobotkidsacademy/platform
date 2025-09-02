import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function TutorLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        console.log('Login attempt started', { username });
        
        if (!username || !password) {
            const errorMsg = 'Both username and password are required';
            console.error('Validation error:', errorMsg);
            setError(errorMsg);
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/cobotKidsKenya/tutors/login`, 
                { username, password },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Login response:', response.data);

            if (response.data?.success) {
                console.log('Login successful for tutor:', username);
                localStorage.setItem('tutor_token', response.data.data.token);
                localStorage.setItem('tutor_profile', JSON.stringify(response.data.data.tutor));
                navigate("/tutorDashBoard");
            } else {
                const errorMsg = response.data?.error || "Login failed - no error details provided";
                console.error('Login failed:', errorMsg);
                setError(errorMsg);
            }
        } catch (err) {
            let errorMsg = 'Login failed. Please try again.';
            
            if (err.response) {
                // Server responded with a status code outside 2xx
                console.error('Server error:', {
                    status: err.response.status,
                    data: err.response.data,
                    headers: err.response.headers
                });
                
                errorMsg = err.response.data?.error || 
                         (err.response.status === 401 ? 'Invalid username or password' : 
                         `Server error (${err.response.status})`);
            } else if (err.request) {
                // No response received
                console.error('Network error:', err.request);
                errorMsg = 'Network error - please check your connection';
            } else {
                // Other errors
                console.error('Unexpected error:', err.message);
            }

            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="student-login-container">
            <div className="login-form">
                <h2>Welcome Back!</h2>
                <p className="subtitle">Please login to continue</p>
                
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            placeholder='Enter Username'
                            autoComplete='username'
                            name='username'
                            className='form-control rounded-0'
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password"><strong>Password</strong></label>
                        <input
                            type="password"
                            placeholder='Enter Password'
                            name='password'
                            className='form-control rounded-0'
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            autoComplete='current-password'
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-success w-100 rounded-0"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="ms-2">Logging in...</span>
                            </>
                        ) : 'Login'}
                    </button>
                </form>
                
                <div className="bg-white p-3 rounded w-25 mt-3">
                    <p>Don't have an account?</p>
                    <Link 
                        to="/tutorCreateAuth" 
                        className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default TutorLoginPage;