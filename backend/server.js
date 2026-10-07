const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/platforms', require('./routes/platforms'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/accounts',  require('./routes/accounts'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/posts',     require('./routes/posts'));
app.use('/api/targets',   require('./routes/targets'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/media', require('./routes/media'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.json({ message: 'Social Media CMS API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));