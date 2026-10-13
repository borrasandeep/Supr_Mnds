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
      WHERE pt.status = 'scheduled'
      ORDER BY pt.scheduled_at DESC`);
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

// GET /api/targets/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/calendar', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end required' });
  try {
    const [rows] = await db.query(`
      SELECT pt.target_id, pt.post_id, pt.scheduled_at, pt.status,
             p.title, p.post_type,
             pl.platform_id, pl.name AS platform,
             sa.account_id, sa.account_name
      FROM post_targets pt
      JOIN posts p             ON p.post_id     = pt.post_id
      JOIN platforms pl        ON pl.platform_id = pt.platform_id
      JOIN social_accounts sa  ON sa.account_id  = pt.account_id
      WHERE pt.scheduled_at BETWEEN ? AND ?
      ORDER BY pt.scheduled_at
    `, [start + ' 00:00:00', end + ' 23:59:59']);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/targets/:id/reschedule
router.put('/:id/reschedule', async (req, res) => {
  const { scheduled_at } = req.body;
  if (!scheduled_at) return res.status(400).json({ error: 'scheduled_at required' });
  try {
    await db.query(
      `UPDATE post_targets SET scheduled_at = ?, status = 'scheduled' WHERE target_id = ?`,
      [scheduled_at, req.params.id]
    );
    await db.query(
      `INSERT INTO publish_logs (target_id, action, status, message)
       VALUES (?, 'reschedule', 'success', ?)`,
      [req.params.id, 'Rescheduled to ' + scheduled_at]
    );
    res.json({ message: 'Rescheduled' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/targets/needs-attention
router.get('/needs-attention', async (req, res) => {
  try {
    const [overdue] = await db.query(`
      SELECT pt.target_id, pt.post_id, pt.scheduled_at, p.title,
             pl.name AS platform, sa.account_name
      FROM post_targets pt
      JOIN posts p             ON p.post_id     = pt.post_id
      JOIN platforms pl        ON pl.platform_id = pt.platform_id
      JOIN social_accounts sa  ON sa.account_id  = pt.account_id
      WHERE pt.status = 'scheduled' AND pt.scheduled_at < NOW()
      ORDER BY pt.scheduled_at ASC
      LIMIT 10
    `);

    const [failed] = await db.query(`
      SELECT pt.target_id, pt.post_id, p.title,
             pl.name AS platform, pt.error_message
      FROM post_targets pt
      JOIN posts p             ON p.post_id     = pt.post_id
      JOIN platforms pl        ON pl.platform_id = pt.platform_id
      WHERE pt.status = 'failed'
      ORDER BY pt.created_at DESC
      LIMIT 10
    `);

    const [approvals] = await db.query(`
      SELECT a.approval_id, a.post_id, p.title, a.requested_at,
             u.full_name AS requested_by,
             DATEDIFF(NOW(), a.requested_at) AS days_waiting
      FROM approvals a
      JOIN posts p ON p.post_id = a.post_id
      LEFT JOIN users u ON u.user_id = a.requested_by
      WHERE a.status = 'pending' AND DATEDIFF(NOW(), a.requested_at) >= 2
      ORDER BY a.requested_at ASC
      LIMIT 10
    `);

    res.json({ overdue, failed, approvals });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/targets/activity
router.get('/activity', async (req, res) => {
  try {
    const [rows] = await db.query(`
      (
        SELECT 'approval' AS kind, a.decided_at AS at, p.title AS title,
               u.full_name AS actor, a.status AS status
        FROM approvals a
        JOIN posts p ON p.post_id = a.post_id
        LEFT JOIN users u ON u.user_id = a.approved_by
        WHERE a.status != 'pending' AND a.decided_at IS NOT NULL
        ORDER BY a.decided_at DESC LIMIT 5
      )
      UNION ALL
      (
        SELECT 'publish' AS kind, MAX(pl.logged_at) AS at, p.title AS title,
               pl.action AS actor, pl.status AS status
        FROM publish_logs pl
        JOIN post_targets pt ON pt.target_id = pl.target_id
        JOIN posts p ON p.post_id = pt.post_id
        GROUP BY p.post_id, p.title, pl.action, pl.status
        ORDER BY MAX(pl.logged_at) DESC LIMIT 5
      )
      ORDER BY at DESC
      LIMIT 8
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;