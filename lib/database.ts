import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '92.204.68.47',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'paulsaxton123',
  password: process.env.DB_PASSWORD || 'Iceland1234!',
  database: process.env.DB_NAME || 'paulsaxton123',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
  ssl: false,
  reconnect: true,
  authPlugins: {
    mysql_native_password: () => () => Buffer.alloc(0)
  }
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Execute query function
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get connection for transactions
export async function getConnection() {
  return await pool.getConnection();
}

export default pool;