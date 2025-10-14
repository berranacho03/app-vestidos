import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'appuser',
  password: process.env.MYSQL_PASSWORD || 'secretpassword',
  database: process.env.MYSQL_DATABASE || 'appvestidos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, params?: unknown[]) {
  // pool.execute usa firmas poco precisas; realizamos un casteo local
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows] = await pool.execute(sql, params as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows as any;
}

export default pool;
