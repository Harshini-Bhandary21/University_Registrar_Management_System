const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool - removed invalid options
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_registrar',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Promisify pool queries
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
    try {
        const [result] = await promisePool.query('SELECT 1');
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await promisePool.query(query, params);
        return { success: true, data: rows };
    } catch (error) {
        console.error('Query error:', error);
        return { success: false, error: error.message };
    }
};

// Transaction helper
const transaction = async (callback) => {
    const connection = await promisePool.getConnection();
    await connection.beginTransaction();
    
    try {
        const result = await callback(connection);
        await connection.commit();
        connection.release();
        return { success: true, data: result };
    } catch (error) {
        await connection.rollback();
        connection.release();
        return { success: false, error: error.message };
    }
};

module.exports = {
    pool: promisePool,
    testConnection,
    executeQuery,
    transaction
};