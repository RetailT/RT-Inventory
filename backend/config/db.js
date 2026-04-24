const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 3,        // Serverless - keep low
    min: 0,
    idleTimeoutMillis: 10000,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

// Vercel serverless - pool cannot persist between invocations
// So we reconnect if pool is closed/null
let pool = null;

const getPool = async () => {
  try {
    // If pool exists and is connected, return it
    if (pool && pool.connected) {
      return pool;
    }

    // If pool exists but connecting, wait
    if (pool && pool.connecting) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return pool;
    }

    // Create new pool
    pool = await sql.connect(config);
    console.log("✅ MSSQL Connected to", process.env.DB_DATABASE);
    return pool;

  } catch (err) {
    pool = null; // Reset on error so next request retries
    console.error("❌ MSSQL Connection error:", err.message);
    throw err;
  }
};

module.exports = { getPool, sql };