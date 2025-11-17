require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function init() {
  // Use appvestidos database (the default that seems to be configured)
  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'appuser',
    password: process.env.MYSQL_PASSWORD || 'secretpassword',
    database: process.env.MYSQL_DATABASE || 'appvestidos',
    multipleStatements: true,
  };

  try {
    const conn = await mysql.createConnection(config);
    console.log(`Connected to MySQL database: ${config.database}`);

    // Read and execute the init-tables.sql file
    const sqlPath = path.join(__dirname, 'init-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Creating tables...');
    await conn.query(sql);
    
    console.log('✓ Tables initialized successfully!');
    console.log('✓ Categories, Items, Rentals tables created');
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`\n❌ Database '${config.database}' doesn't exist!`);
      console.error('\nCreating database...');
      
      // Create database first
      const configNoDB = { ...config };
      delete configNoDB.database;
      
      const connAdmin = await mysql.createConnection(configNoDB);
      await connAdmin.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
      await connAdmin.end();
      
      // Try again
      const conn = await mysql.createConnection(config);
      const sqlPath = path.join(__dirname, 'init-tables.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await conn.query(sql);
      console.log('✓ Tables initialized successfully!');
      await conn.end();
      process.exit(0);
    } else {
      console.error('Database initialization failed:', err.message);
      process.exit(1);
    }
  }
}

if (require.main === module) init();





