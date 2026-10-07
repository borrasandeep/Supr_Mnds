const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM platforms ORDER BY platform_id');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  const { name, base_url, char_limit, supports_images, supports_videos, supports_links } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO platforms (name, base_url, char_limit, supports_images, supports_videos, supports_links)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, base_url, char_limit, supports_images, supports_videos, supports_links]
    );
    res.status(201).json({ platform_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;