const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sa.account_id, sa.account_name, sa.account_handle,
             sa.is_active, u.username, p.name AS platform
      FROM social_accounts sa
      JOIN users u     ON u.user_id     = sa.user_id
      JOIN platforms p ON p.platform_id = sa.platform_id
      ORDER BY sa.account_id`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { user_id, platform_id, account_name, account_handle, access_token } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO social_accounts (user_id, platform_id, account_name, account_handle, access_token)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, platform_id, account_name, account_handle, access_token]
    );
    res.status(201).json({ account_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM social_accounts WHERE account_id = ?', [req.params.id]);
    res.json({ message: 'Account deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;