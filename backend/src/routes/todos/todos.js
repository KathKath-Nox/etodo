const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');

// Get all todos for user
router.get('/', auth, (req, res) => {
  const userId = req.userId;
  const query = 'SELECT * FROM todo WHERE user_id = ? ORDER BY created_at DESC';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Error fetching todos', error: err });
    }
    res.json(results);
  });
});

// Get single todo
router.get('/:id', auth, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const query = 'SELECT * FROM todo WHERE id = ? AND user_id = ?';
  
  db.query(query, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Error fetching todo', error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ msg: 'Todo not found' });
    }
    res.json(results[0]);
  });
});

// Create todo
router.post('/', auth, (req, res) => {
  const { title, description, due_time, status } = req.body;
  const userId = req.userId;

  if (!title) {
    return res.status(400).json({ msg: 'Title is required' });
  }

  const query = 'INSERT INTO todo (title, description, due_time, status, user_id) VALUES (?, ?, ?, ?, ?)';
  const values = [title, description || '', due_time || new Date(), status || 'not started', userId];

  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Error creating todo', error: err });
    }
    res.status(201).json({ 
      id: results.insertId, 
      title, 
      description, 
      due_time: due_time || new Date(), 
      status: status || 'not started',
      user_id: userId 
    });
  });
});

// Update todo
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { title, description, due_time, status } = req.body;
  const userId = req.userId;

  const query = 'UPDATE todo SET title = ?, description = ?, due_time = ?, status = ? WHERE id = ? AND user_id = ?';
  const values = [title, description || '', due_time, status, id, userId];

  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Error updating todo', error: err });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ msg: 'Todo not found' });
    }
    res.json({ msg: 'Todo updated successfully' });
  });
});

// Delete todo
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const query = 'DELETE FROM todo WHERE id = ? AND user_id = ?';

  db.query(query, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Error deleting todo', error: err });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ msg: 'Todo not found' });
    }
    res.json({ msg: 'Todo deleted successfully' });
  });
});

module.exports = router;