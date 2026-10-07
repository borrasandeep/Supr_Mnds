const router = require('express').Router();
const db = require('../db');

// Platform-wise summary
router.get('/by-platform', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pl.name,
             SUM(a.likes)           AS total_likes,
             SUM(a.comments_count)  AS total_comments,
             SUM(a.shares)          AS total_shares,
             AVG(a.engagement_rate) AS avg_engagement
      FROM analytics a
      JOIN post_targets pt ON pt.target_id  = a.target_id
      JOIN platforms pl    ON pl.platform_id = pt.platform_id
      GROUP BY pl.name
      ORDER BY avg_engagement DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Top posts
router.get('/top-posts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.post_id, p.title,
             SUM(a.likes + a.shares + a.comments_count) AS total_engagement
      FROM posts p
      JOIN post_targets pt ON pt.post_id  = p.post_id
      JOIN analytics a     ON a.target_id = pt.target_id
      GROUP BY p.post_id, p.title
      ORDER BY total_engagement DESC
      LIMIT 5`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add analytics record
router.post('/', async (req, res) => {
  const { target_id, impressions, reach, likes, comments_count, shares, clicks, views, engagement_rate } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO analytics
       (target_id, impressions, reach, likes, comments_count, shares, clicks, views, engagement_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [target_id, impressions, reach, likes, comments_count, shares, clicks, views, engagement_rate]
    );
    res.status(201).json({ analytics_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;