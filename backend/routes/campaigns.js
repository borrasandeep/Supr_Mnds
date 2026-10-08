const router = require('express').Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { name, description, start_date, end_date, status, created_by } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO campaigns (name, description, start_date, end_date, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, start_date, end_date, status || 'draft', created_by]
    );
    res.status(201).json({ campaign_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, u.username AS creator_name, u.full_name AS creator_full
      FROM campaigns c
      LEFT JOIN users u ON u.user_id = c.created_by
      ORDER BY c.created_at DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update campaign
router.put('/:id', async (req, res) => {
  const { name, description, start_date, end_date, status, created_by } = req.body;
  try {
    await db.query(
      `UPDATE campaigns
         SET name=?, description=?, start_date=?, end_date=?, status=?, created_by=?
       WHERE campaign_id=?`,
      [name, description, start_date, end_date, status, created_by, req.params.id]
    );
    res.json({ message: 'Campaign updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;