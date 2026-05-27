const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const db = require('../../config/db');

// GET /user
router.get('/', auth, async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.execute('SELECT * FROM user WHERE id = ?', [req.userId]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// GET /user/todos
router.get('/todos', auth, async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.execute('SELECT * FROM todo WHERE user_id = ?', [req.userId]);
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// GET /user/:id or /user/:email
router.get('/:param', auth, async (req, res) => {
  try {
    const { param } = req.params;
    const connection = await db.getConnection();
    
    let query = 'SELECT * FROM user WHERE id = ?';
    let value = param;

    if (isNaN(param)) {
      query = 'SELECT * FROM user WHERE email = ?';
      value = param;
    }

    const [rows] = await connection.execute(query, [value]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// PUT /user/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, firstname, name } = req.body;

    if (!email || !password || !firstname || !name) {
      return res.status(400).json({ msg: 'Bad parameter' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await db.getConnection();

    await connection.execute(
      'UPDATE user SET email = ?, password = ?, firstname = ?, name = ? WHERE id = ?',
      [email, hashedPassword, firstname, name, id]
    );

    const [rows] = await connection.execute('SELECT * FROM user WHERE id = ?', [id]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// DELETE /user/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await db.getConnection();

    await connection.execute('DELETE FROM user WHERE id = ?', [id]);
    connection.release();

    res.json({ msg: `Successfully deleted record number: ${id}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

module.exports = router;