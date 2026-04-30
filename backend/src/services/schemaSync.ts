import pool from "../config/db";
import { AppConfig, FieldConfig } from "../../../shared/config";

/**
 * Maps our generic field types to PostgreSQL column types
 */
const mapToPgType = (type: FieldConfig["type"]): string => {
  switch (type) {
    case "text":
      return "VARCHAR(255)";
    case "number":
      return "NUMERIC";
    case "email":
      return "VARCHAR(255)";
    case "date":
      return "TIMESTAMP";
    default:
      return "TEXT"; // Fallback
  }
};

/**
 * Validates and sanitizes table/column names to prevent SQL injection
 */
const sanitizeIdentifier = (identifier: string): string => {
  return identifier.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
};

/**
 * Synchronizes the database schema with the provided JSON configuration.
 * It uses information_schema to check for existing tables and columns.
 */
export async function syncSchema(config: AppConfig) {
  console.log("🔄 [Schema Sync] Starting synchronization...");
  const client = await pool.connect();

  try {
    // 1. Ensure basic auth tables exist if auth is enabled
    if (config.auth) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ [Schema Sync] Verified core users table.");
    }

    // 2. Process dynamic entities
    for (const entity of config.entities) {
      const tableName = sanitizeIdentifier(entity.name);
      
      // Check if table exists
      const tableCheckRes = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        );
      `, [tableName]);

      const tableExists = tableCheckRes.rows[0].exists;

      if (!tableExists) {
        // Build CREATE TABLE query
        // We always add 'id', 'user_id' (if auth), and 'created_at' as base fields
        let createQuery = `CREATE TABLE ${tableName} (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        
        if (config.auth) {
          createQuery += `, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`;
        }

        for (const field of entity.fields) {
          const colName = sanitizeIdentifier(field.name);
          const colType = mapToPgType(field.type);
          const required = field.required ? "NOT NULL" : "";
          createQuery += `, ${colName} ${colType} ${required}`;
        }
        
        createQuery += `);`;

        await client.query(createQuery);
        console.log(`✅ [Schema Sync] Created new table: ${tableName}`);
      } else {
        // Table exists, check for missing columns
        for (const field of entity.fields) {
          const colName = sanitizeIdentifier(field.name);
          
          const colCheckRes = await client.query(`
            SELECT data_type
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = $1 
              AND column_name = $2
          `, [tableName, colName]);

          if (colCheckRes.rows.length === 0) {
            const colType = mapToPgType(field.type);
            // We cannot easily add NOT NULL to an existing table if it has rows without defaults, 
            // so we add it as nullable to avoid crashes.
            const alterQuery = `ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colType};`;
            await client.query(alterQuery);
            console.log(`⚠️ [Schema Sync] Added missing column '${colName}' to table '${tableName}'.`);
          } else {
            // Check for type changes - we never mutate types or drop columns to ensure data safety
            const existingType = colCheckRes.rows[0].data_type;
            const expectedType = mapToPgType(field.type).split('(')[0].toLowerCase();
            
            // Basic matching since PG maps types like VARCHAR to character varying
            const isMismatch = existingType !== expectedType 
                && !(existingType === 'character varying' && expectedType === 'varchar')
                && !(existingType === 'timestamp without time zone' && expectedType === 'timestamp');

            if (isMismatch) {
              console.warn(`[SCHEMA WARNING] Type mismatch detected for column '${colName}' in table '${tableName}'. Existing: ${existingType}, Expected: ${expectedType}. Skipping alteration to ensure data safety.`);
            }
          }
        }
      }
    }
    console.log("✅ [Schema Sync] Synchronization complete.");
  } catch (error: any) {
    console.error("❌ [Schema Sync] Failed during sync:", error.message);
    // We intentionally don't throw here to allow the server to start even if sync fails
  } finally {
    client.release();
  }
}
