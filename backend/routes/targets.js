const router = require('express').Router();
const db = require('../db');

router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.title, pl.name AS platform, sa.account_name,
             pt.scheduled_at, pt.status
      FROM post_targets pt
      JOIN posts p            ON p.post_id     = pt.post_id
      JOIN platforms pl       ON pl.platform_id = pt.platform_id
      JOIN social_accounts sa ON sa.account_id  = pt.account_id
      WHERE pt.status = 'scheduled' AND pt.scheduled_at >= NOW()
      ORDER BY pt.scheduled_at`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/status', async (req, res) => {
  const { status, error_message } = req.body;
  try {
    await db.query(
      `UPDATE post_targets SET status=?, error_message=?, published_at = IF(?='published', NOW(), published_at)
       WHERE target_id=?`,
      [status, error_message || null, status, req.params.id]
    );
    await db.query(
      `INSERT INTO publish_logs (target_id, action, status, message) VALUES (?, 'status-update', ?, ?)`,
      [req.params.id, status, error_message || null]
    );
    res.json({ message: 'Target updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;