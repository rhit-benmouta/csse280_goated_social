import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles.css';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    driveLink: '', // ⬅️ New field
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let emailErr = '';
    let passwordErr = '';

    if (!form.email.includes('rose-hulman.edu')) {
      emailErr = 'Email must be a rose-hulman.edu address';
    }

    if (form.password.length > 6) {
      passwordErr = 'Password must be 6 characters or fewer';
    }

    setErrors({ email: emailErr, password: passwordErr });

    setIsValid(
      form.name.trim() !== '' &&
      emailErr === '' &&
      passwordErr === '' &&
      (form.role !== 'ta' || form.driveLink.trim() !== '') // ⬅️ Require driveLink if TA
    );
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://csse280.csse.rose-hulman.edu:20052/api/auth/signup', form);
      alert('Signup successful! You can now log in.');

       // 2. If the user is a TA, also add them to the TA collection
    if (form.role === 'ta') {
      await axios.post('http://localhost:20052/api/tas', {
      name: form.name,
      driveLink: form.driveLink,
    });
    }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Signup failed: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>

        <div className="form-field">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
            className={form.name.trim() === '' ? 'input-error' : ''}
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="yourname@rose-hulman.edu"
            value={form.email}
            onChange={handleChange}
            required
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <small className="error">{errors.email}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password (max 6 characters)</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <small className="error">{errors.password}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="ta">TA</option>
          </select>
        </div>

        {form.role === 'ta' && (
          <div className="form-field">
            <label htmlFor="driveLink">Google Drive Link</label>
            <input
              id="driveLink"
              type="url"
              name="driveLink"
              placeholder="Enter your Google Drive link"
              value={form.driveLink}
              onChange={handleChange}
              required
              className={form.driveLink.trim() === '' ? 'input-error' : ''}
            />
          </div>
        )}

        <button type="submit" className="form-submit" disabled={!isValid}>
          Register
        </button>
      </form>
    </div>
  );
}