const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, firstname } = req.body;

  // Validation
  if (!email || !password || !firstname || !name) {
    return res.status(400).json({ msg: 'Please provide email, password, firstname, and name (lastname)' });
  }

  try {
    // Check if user already exists
    db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ msg: 'Database error', error: err });
      }

      if (results.length > 0) {
        return res.status(400).json({ msg: 'Email already in use' });
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 8);

      // Insert user (name = lastname, firstname = firstname)
      db.query(
        'INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, firstname],
        (err, results) => {
          if (err) {
            return res.status(500).json({ msg: 'Error creating user', error: err });
          }

          // Create JWT token
          const token = jwt.sign({ id: results.insertId }, process.env.SECRET || 'your_secret_key', {
            expiresIn: '7d'
          });

          res.status(201).json({
            msg: 'User registered successfully',
            token,
            userId: results.insertId,
            name: `${firstname} ${name}`
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error during registration', error });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  try {
    // Find user
    db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ msg: 'Database error', error: err });
      }

      if (results.length === 0) {
        return res.status(401).json({ msg: 'Email or password is incorrect' });
      }

      const user = results[0];

      // Check password
      const isPasswordCorrect = await bcryptjs.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ msg: 'Email or password is incorrect' });
      }

      // Create JWT token
      const token = jwt.sign({ id: user.id }, process.env.SECRET || 'your_secret_key', {
        expiresIn: '7d'
      });

      res.json({
        msg: 'Login successful',
        token,
        userId: user.id,
        name: user.name
      });
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error during login', error });
  }
});

module.exports = router;