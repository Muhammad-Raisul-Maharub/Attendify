const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',   // <-- use service name
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'attendify_user',
  password: process.env.DB_PASSWORD || 'attendify_pass',
  database: process.env.DB_NAME || 'attendify_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
})();

module.exports = {
  pool,
  query: async (sql, params) => {
    const [results] = await pool.execute(sql, params);
    return results;
  },
  transaction: async (callback) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  end: () => pool.end()
};