const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const users = [
  { username: 'sandeep',  password: 'sandeep123'  },
  { username: 'swaroop',  password: 'swaroop123'  },
  { username: 'thanuj',   password: 'thanuj123'   },
  { username: 'yaswanth', password: 'yaswanth123' },
  { username: 'navadeep', password: 'navadeep123' },
  { username: 'gokul',    password: 'gokul123'    }
];

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'social_media_cms',
    charset: 'utf8mb4_unicode_ci'
  });

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const [r] = await conn.query(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hash, u.username]
    );
    if (r.affectedRows > 0) {
      console.log(`✅ ${u.username}  →  ${u.password}`);
    } else {
      console.log(`❌ No user found with username: ${u.username}`);
    }
  }

  const [all] = await conn.query('SELECT user_id, username, role FROM users ORDER BY user_id');
  console.log('\n--- Current users ---');
  console.table(all);

  await conn.end();
})();