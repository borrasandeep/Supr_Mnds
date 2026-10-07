const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const [rows] = await db.query(
      'SELECT user_id, username, email, full_name, role, is_active, password_hash FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Check password. Accept either bcrypt hash or legacy plain '$2b$10$abcdefghijklmnopqrstuv' placeholder.
    let ok = false;
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      ok = await bcrypt.compare(password, user.password_hash);
    }
    // Fallback: for seeded demo users whose hash was a placeholder, accept the literal "password123"
    if (!ok && user.password_hash === '$2b$10$abcdefghijklmnopqrstuv' && password === 'password123') {
      ok = true;
    }

    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

    // Return user info (NEVER the hash)
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;