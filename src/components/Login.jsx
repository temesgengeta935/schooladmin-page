import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/mockData';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const admin = storage.get('admin');
      
      if (email === admin?.email && password === admin?.password) {
        onLogin();
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Logo/Brand Header */}
        <div className="brand">
          <div className="logo">
            <span className="icon">🏫</span>
            <h1 className="title">Maryouth Academy</h1>
          </div>
          <p className="subtitle">School Administration System</p>
        </div>

        {/* Login Form Card */}
        <div className="login-card">
          <div className="card-header">
            <h2>Admin Log In</h2>
            <p>Please enter your details</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="input"
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox"
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              
              <button type="button" className="forgot-link">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : 'Log In'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="login-footer">
            <p className="footer-text">
              © 2024 Maryouth Academy. All rights reserved.
            </p>
            <div className="footer-links">
              <a href="/privacy" className="footer-link">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="/terms" className="footer-link">Terms of Service</a>
              <span className="separator">•</span>
              <a href="/support" className="footer-link">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;