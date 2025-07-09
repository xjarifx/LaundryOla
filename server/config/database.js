import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  // Remove these invalid options:
  // acquireTimeout: 60000,  ❌ Invalid for mysql2
  // timeout: 60000,         ❌ Invalid for mysql2
  
  // Use these instead:
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Export the pool for queries
export default pool;