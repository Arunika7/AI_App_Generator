import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Standard PostgreSQL configuration.
// If using neon or supabase, provide the connection string in DATABASE_URL
console.log("Connecting to DB:", process.env.DATABASE_URL);
const isNeon = process.env.DATABASE_URL?.includes("neon.tech");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/appgen",
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("⚠️ [DB] Connection error:", err.message);
  } else {
    console.log("✅ [DB] Connected to PostgreSQL");
  }
});

export default pool;
