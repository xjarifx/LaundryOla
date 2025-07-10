import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// SSL Configuration
let sslConfig = {};
if (process.env.NODE_ENV === 'production') {
  try {
    const caCert = fs.readFileSync('./ca-certificate.crt');
    sslConfig = {
      ssl: {
        ca: caCert,
        rejectUnauthorized: true
      }
    };
  } catch (error) {
    console.warn('SSL certificate not found, using basic SSL');
    sslConfig = {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
  }
} else {
  // Development with Aiven still needs SSL
  sslConfig = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ...sslConfig,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Export the pool for queries
export default pool;