const router = require('express').Router();
const db = require('../db');

const DB = process.env.DB_NAME || 'social_media_cms';

// List all tables with accurate row counts
router.get('/tables', async (req, res) => {
  try {
    const [tables] = await db.query(
      `SELECT TABLE_NAME AS name
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME`,
      [DB]
    );

    const result = [];
    for (const t of tables) {
      const [[row]] = await db.query(`SELECT COUNT(*) AS count FROM \`${t.name}\``);
      result.push({ name: t.name, rows: row.count });
    }
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get rows of a specific table (up to 200)
router.get('/table/:name', async (req, res) => {
  const name = req.params.name;
  try {
    // Whitelist check — prevent SQL injection via table name
    const [tables] = await db.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [DB, name]
    );
    if (tables.length === 0) return res.status(404).json({ error: 'Table not found' });

    const [rows] = await db.query(`SELECT * FROM \`${name}\` LIMIT 200`);
    res.json({
      table: name,
      columns: rows.length ? Object.keys(rows[0]) : [],
      rows,
      count: rows.length
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Run a raw read-only query
router.post('/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'SQL query required' });
  }

  const trimmed = sql.trim().toLowerCase();
  const safe = ['select', 'show', 'describe', 'desc', 'explain'].some(w => trimmed.startsWith(w));
  if (!safe) {
    return res.status(403).json({ error: 'Only SELECT / SHOW / DESCRIBE / EXPLAIN queries are allowed' });
  }

  try {
    const [rows] = await db.query(sql);
    const isResultSet = Array.isArray(rows);
    res.json({
      rows: isResultSet ? rows : [],
      columns: isResultSet && rows.length ? Object.keys(rows[0]) : [],
      count: isResultSet ? rows.length : 0
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;