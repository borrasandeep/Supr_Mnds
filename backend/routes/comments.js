const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, p.title AS post_title, pl.name AS platform
      FROM comments c
      JOIN post_targets pt ON pt.target_id  = c.target_id
      JOIN posts p         ON p.post_id     = pt.post_id
      JOIN platforms pl    ON pl.platform_id = pt.platform_id
      ORDER BY c.commented_at DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { target_id, author_name, comment_text, sentiment } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO comments (target_id, author_name, comment_text, commented_at, sentiment)
       VALUES (?, ?, ?, NOW(), ?)`,
      [target_id, author_name, comment_text, sentiment || 'neutral']
    );
    res.status(201).json({ comment_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;