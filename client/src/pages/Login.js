import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css'; // Ensure this path matches your actual structure

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://csse280.csse.rose-hulman.edu:20052/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Login successful');
      window.location.href = '/calendar.html';
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://csse280.csse.rose-hulman.edu:20052/api/auth/forgot-password', { email: resetEmail });
      alert(res.data.message || 'If that email exists, a reset link was sent.');
      setShowReset(false);
      setResetEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      alert('Password reset failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-submit">Log In</button>
      </form>

      <button type="button" className="link-button" onClick={() => setShowReset(!showReset)}>
        Forgot your password?
      </button>

      {showReset && (
        <form onSubmit={handleReset} className="reset-form">
          <div className="form-field">
            <label htmlFor="resetEmail">Enter your email to reset password</label>
            <input
              id="resetEmail"
              type="email"
              placeholder="yourname@rose-hulman.edu"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-submit">Send Reset Email</button>
        </form>
      )}
    </div>
  );
}
