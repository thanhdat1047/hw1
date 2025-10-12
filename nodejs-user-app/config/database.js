const mysql = require('mysql2/promise');
const { getDbConfig } = require('./aws-params');

let pool = null;

const initalizeDatabase = async () => {
  try {
    // Get config from AWS SSM and Secrets Manager
    const dbConfig = await getDbConfig();

    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    console.log('Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

async function getPool() {
  if (!pool) {
    await initalizeDatabase();
  }
  return pool;
}

const testConnection = async () => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();
    console.log('RDS connection test successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

const query = async (sql, params) => {
  try {
    const currentPool = await getPool();
    const [results] = await currentPool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const getUsers = async () => {
  const sql = 'SELECT id, name, email, role FROM users';
  return await query(sql);
};

const getUserById = async (id) => {
  const sql = 'SELECT id, name, email, role FROM users WHERE id = ?';
  const results = await query(sql, [id]);
  return results[0];
};

const createUser = async (userData) => {
  const { name, email, role } = userData;
  const sql = 'INSERT INTO users (name, email, role) VALUES (?, ?, ?)';
  const result = await query(sql, [name, email, role]);
  return { id: result.insertId, name, email, role };
}

module.exports = {
  initializePool: initalizeDatabase,
  testConnection,
  getUsers,
  getUserById,
  createUser
};
