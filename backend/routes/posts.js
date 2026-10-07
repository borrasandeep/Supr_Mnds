const router = require('express').Router();
const db = require('../db');

// List posts with creator + campaign + targets
router.get('/', async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.username AS author, c.name AS campaign
      FROM posts p
      JOIN users u          ON u.user_id     = p.user_id
      LEFT JOIN campaigns c ON c.campaign_id = p.campaign_id
      ORDER BY p.created_at DESC`);

    for (const post of posts) {
      const [targets] = await db.query(`
        SELECT pt.target_id, pt.adapted_content, pt.scheduled_at,
               pt.status, pl.name AS platform, sa.account_name
        FROM post_targets pt
        JOIN platforms pl       ON pl.platform_id = pt.platform_id
        JOIN social_accounts sa ON sa.account_id  = pt.account_id
        WHERE pt.post_id = ?`, [post.post_id]);
      post.targets = targets;

      const [media] = await db.query(`
        SELECT m.media_id, m.file_path, m.media_type, m.file_name
        FROM post_media pm
        JOIN media m ON m.media_id = pm.media_id
        WHERE pm.post_id = ?
        ORDER BY pm.display_order`, [post.post_id]);
      post.media = media;
    }
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create post + targets in one call
router.post('/', async (req, res) => {
  const { user_id, campaign_id, title, content, post_type, targets, media_ids } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO posts (user_id, campaign_id, title, content, post_type, status)
       VALUES (?, ?, ?, ?, ?, 'draft')`,
      [user_id, campaign_id || null, title, content, post_type || 'text']
    );
    const postId = r.insertId;

    // Link media
    if (Array.isArray(media_ids)) {
      for (let i = 0; i < media_ids.length; i++) {
        await conn.query(
          `INSERT INTO post_media (post_id, media_id, display_order) VALUES (?, ?, ?)`,
          [postId, media_ids[i], i]
        );
      }
    }

    // Platform targets
    if (Array.isArray(targets)) {
      for (const t of targets) {
        await conn.query(
          `INSERT INTO post_targets
             (post_id, account_id, platform_id, adapted_content, scheduled_at, status, platform_options)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            postId, t.account_id, t.platform_id, t.adapted_content || content,
            t.scheduled_at || null, t.scheduled_at ? 'scheduled' : 'pending',
            t.platform_options ? JSON.stringify(t.platform_options) : null
          ]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ post_id: postId });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Update post + its platform targets
router.put('/:id', async (req, res) => {
  const { user_id, campaign_id, title, content, post_type, status, targets, media_ids } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Update the post
    await conn.query(
      `UPDATE posts
       SET user_id=?, campaign_id=?, title=?, content=?, post_type=?, status=?
       WHERE post_id=?`,
      [user_id, campaign_id || null, title, content, post_type || 'text', status || 'draft', req.params.id]
    );

    // Replace all targets (delete old, insert new)
    if (Array.isArray(targets)) {
      await conn.query('DELETE FROM post_targets WHERE post_id = ?', [req.params.id]);

      for (const t of targets) {
        await conn.query(
          `INSERT INTO post_targets
             (post_id, account_id, platform_id, adapted_content, scheduled_at, status, platform_options)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.params.id,
            t.account_id,
            t.platform_id,
            t.adapted_content || content,
            t.scheduled_at || null,
            t.scheduled_at ? 'scheduled' : 'pending',
            t.platform_options ? JSON.stringify(t.platform_options) : null
          ]
        );
      }
    }

    // Optionally add new media
    if (Array.isArray(media_ids) && media_ids.length > 0) {
      for (let i = 0; i < media_ids.length; i++) {
        await conn.query(
          `INSERT INTO post_media (post_id, media_id, display_order) VALUES (?, ?, ?)`,
          [req.params.id, media_ids[i], i]
        );
      }
    }

    await conn.commit();
    res.json({ message: 'Post updated', post_id: +req.params.id });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM posts WHERE post_id=?', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Request approval for a post
router.post('/:id/request-approval', async (req, res) => {
  const { requested_by } = req.body;
  try {
    // Check post exists
    const [posts] = await db.query('SELECT post_id FROM posts WHERE post_id = ?', [req.params.id]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

    // Check no pending approval already
    const [existing] = await db.query(
      'SELECT approval_id FROM approvals WHERE post_id = ? AND status = "pending"',
      [req.params.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Approval already pending for this post' });
    }

    // Create approval request
    const [r] = await db.query(
      `INSERT INTO approvals (post_id, requested_by, status)
       VALUES (?, ?, 'pending')`,
      [req.params.id, requested_by || null]
    );

    // Update post status
    await db.query(`UPDATE posts SET status = 'pending' WHERE post_id = ?`, [req.params.id]);

    res.status(201).json({ approval_id: r.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;