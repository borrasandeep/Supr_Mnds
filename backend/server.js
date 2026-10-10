const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authenticateToken, requireRole } = require('./middleware/auth');

const app = express();

// Restrict CORS to your frontend origins only
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// ----- PUBLIC ROUTE (login only) -----
app.use('/api/auth', require('./routes/auth'));

// ----- PROTECTED ROUTES -----
app.use('/api/platforms', authenticateToken, require('./routes/platforms'));
app.use('/api/users',     authenticateToken, requireRole('admin'), require('./routes/users'));
app.use('/api/accounts',  authenticateToken, require('./routes/accounts'));
app.use('/api/campaigns', authenticateToken, require('./routes/campaigns'));
app.use('/api/posts',     authenticateToken, require('./routes/posts'));
app.use('/api/targets',   authenticateToken, require('./routes/targets'));
app.use('/api/analytics', authenticateToken, require('./routes/analytics'));
app.use('/api/comments',  authenticateToken, require('./routes/comments'));
app.use('/api/approvals', authenticateToken, requireRole('admin', 'manager'), require('./routes/approvals'));
app.use('/api/admin',     authenticateToken, requireRole('admin'), require('./routes/admin'));
app.use('/api/media',     authenticateToken, require('./routes/media'));

app.use('/uploads', express.static('uploads'));

// PUBLIC ROUTE: for the login page stats
app.get('/api/stats', async (req, res) => {
  try {
    const db = require('./db');
    const [[p]] = await db.query('SELECT COUNT(*) AS c FROM platforms');
    const [[u]] = await db.query('SELECT COUNT(*) AS c FROM users');
    const [[po]] = await db.query('SELECT COUNT(*) AS c FROM posts');
    res.json({ platforms: p.c, users: u.c, posts: po.c });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.json({ message: 'Social Media CMS API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));