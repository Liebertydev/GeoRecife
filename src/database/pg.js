const { Pool } = require('pg');

// Pool para session store — precisa de conexão estável (Session Mode)
const sessionPool = new Pool({
  connectionString: process.env.DIRECT_URL, // porta 5432
  ssl: { rejectUnauthorized: false }
});

// Pool para queries gerais — pode usar pooler (Transaction Mode)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // porta 6543
  ssl: { rejectUnauthorized: false }
});

module.exports = { pool, sessionPool };