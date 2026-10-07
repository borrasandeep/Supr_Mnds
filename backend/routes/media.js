const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Ensure upload folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|mp4|mov|pdf/.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Only images, videos or PDFs allowed'));
  }
});

// POST /api/media/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { user_id } = req.body;
    const media_type = req.file.mimetype.startsWith('image') ? 'image'
                     : req.file.mimetype.startsWith('video') ? 'video'
                     : req.file.mimetype === 'application/pdf' ? 'document'
                     : 'audio';

    const file_path = `/uploads/${req.file.filename}`;

    const [r] = await db.query(
      `INSERT INTO media (file_name, file_path, media_type, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?)`,
      [req.file.originalname, file_path, media_type, req.file.size, user_id || null]
    );

    res.status(201).json({
      media_id: r.insertId,
      file_path,
      media_type
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/media — list all
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media ORDER BY media_id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;