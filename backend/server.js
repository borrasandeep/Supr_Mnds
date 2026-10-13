const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

/* ---------- Middleware ---------- */
// CORS — allow any origin during development
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- Static uploads ---------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------- API Routes ---------- */
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/platforms', require('./routes/platforms'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/accounts',  require('./routes/accounts'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/posts',     require('./routes/posts'));
app.use('/api/targets',   require('./routes/targets'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/media',     require('./routes/media'));
app.use('/api/admin',     require('./routes/admin'));

/* ---------- Root health check ---------- */
app.get('/', (req, res) => {
  res.json({
    message: 'Supr_Mnds API is running',
    timestamp: new Date().toISOString()
  });
});

/* ---------- 404 handler ---------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ---------- Error handler (multer, JSON parse, etc.) ---------- */
app.use((err, req, res, next) => {
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: err.message });
  }
  next();
});

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});