const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// List all users (never return password_hash)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, username, email, full_name, role, is_active, created_at FROM users ORDER BY user_id'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create user
router.post('/', async (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, hash, full_name || null, role || 'editor']
    );
    res.status(201).json({ user_id: r.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: e.message });
  }
});

// Update user (password optional)
router.put('/:id', async (req, res) => {
  const { username, email, password, full_name, role, is_active } = req.body;
  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users SET username=?, email=?, password_hash=?, full_name=?, role=?, is_active=?
         WHERE user_id=?`,
        [username, email, hash, full_name, role, is_active, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE users SET username=?, email=?, full_name=?, role=?, is_active=?
         WHERE user_id=?`,
        [username, email, full_name, role, is_active, req.params.id]
      );
    }
    res.json({ message: 'User updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id=?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;