require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function init() {
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'appuser',
    password: process.env.MYSQL_PASSWORD || 'secretpassword',
    multipleStatements: true,
  };

  try {
    const conn = await mysql.createConnection(config);
    console.log('Connected to MySQL');

    // Read the init.sql file
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing init.sql...');
    await conn.query(sql);
    
    console.log('Database initialized successfully!');
    console.log('✓ rentalDB database created');
    console.log('✓ Tables: Categories, Items, Rentals');
    console.log('✓ Sample data inserted');
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) init();





