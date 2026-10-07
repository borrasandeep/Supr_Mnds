const router = require('express').Router();
const db = require('../db');

router.get('/pending', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.approval_id, p.post_id, p.title, u.username AS requested_by, a.requested_at
      FROM approvals a
      JOIN posts p ON p.post_id = a.post_id
      JOIN users u ON u.user_id = a.requested_by
      WHERE a.status = 'pending'`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/decide', async (req, res) => {
  const { status, approved_by, comments } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Get the post_id for this approval
    const [rows] = await conn.query(
      'SELECT post_id FROM approvals WHERE approval_id = ?', [req.params.id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Approval not found' });
    }
    const postId = rows[0].post_id;

    // Update approval
    await conn.query(
      `UPDATE approvals
         SET status = ?, approved_by = ?, comments = ?, decided_at = NOW()
       WHERE approval_id = ?`,
      [status, approved_by, comments || null, req.params.id]
    );

    // Update post status accordingly
    const newPostStatus = status === 'approved' ? 'approved' : 'draft';
    await conn.query(
      `UPDATE posts SET status = ? WHERE post_id = ?`,
      [newPostStatus, postId]
    );

    await conn.commit();
    res.json({ message: 'Approval updated', post_status: newPostStatus });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;