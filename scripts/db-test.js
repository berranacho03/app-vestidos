require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'appuser',
    password: process.env.MYSQL_PASSWORD || 'secretpassword',
    database: process.env.MYSQL_DATABASE || 'appvestidos',
  };

  try {
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.query('SELECT 1 as ok');
    console.log('DB connected, test query result:', rows);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) test();
