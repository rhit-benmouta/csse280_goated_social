const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ message: 'User created successfully' });
  } catch (e) {
    console.error('Error during signup:', e);
    res.status(400).json({ error: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, role: user.role });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Security best practice: don't reveal if user exists
      return res.status(200).json({ message: 'If that email exists, a reset message was sent.' });
    }

    // Generate random 6-character alphanumeric password
    const newPassword = Math.random().toString(36).slice(-6);
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Send new password via email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Or use a real SMTP server
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"Goated Social" <no-reply@goatedsocial.com>',
      to: email,
      subject: 'Your Password Has Been Reset',
      text: `Your new password is: ${newPassword}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'A new password has been sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
