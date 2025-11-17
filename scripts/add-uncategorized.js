require('dotenv').config();
const mysql = require('mysql2/promise');

async function addCategory() {
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'appuser',
    password: process.env.MYSQL_PASSWORD || 'secretpassword',
    database: process.env.MYSQL_DATABASE || 'appvestidos',
  };

  try {
    const conn = await mysql.createConnection(config);
    await conn.query("INSERT IGNORE INTO Categories (name) VALUES ('uncategorized')");
    console.log('✓ Category "uncategorized" added successfully');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to add category:', err.message);
    process.exit(1);
  }
}

addCategory();





