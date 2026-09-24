import dotenv from 'dotenv'
dotenv.config()

import { Pool } from 'pg'

const ConnectionString = process.env.NEON
const pool = new Pool({
  connectionString: ConnectionString,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
});

export default pool;
