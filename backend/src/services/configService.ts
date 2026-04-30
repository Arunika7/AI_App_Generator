import pool from "../config/db";
import { AppConfig, parseConfig } from "../../../shared/config";
import { syncSchema } from "./schemaSync";

let cachedConfig: AppConfig | null = null;

/**
 * Fetches the latest configuration from the database.
 * Uses an in-memory cache for high performance.
 */
export async function getConfig(): Promise<AppConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  console.log("[CONFIG LOAD] Fetching from database...");
  try {
    const result = await pool.query(
      "SELECT config FROM app_configs ORDER BY updated_at DESC LIMIT 1"
    );

    if (result.rows.length > 0) {
      const parsed = parseConfig(result.rows[0].config);
      cachedConfig = parsed.data;
      return cachedConfig;
    }
  } catch (error) {
    console.error("[CONFIG LOAD ERROR] Failed to load from DB:", error);
  }

  // Cold Start Fallback: Use defaults if DB is empty or fails
  console.warn("[CONFIG LOAD] No config found in DB. Using defaults.");
  cachedConfig = parseConfig({}).data;
  return cachedConfig;
}

/**
 * Saves a new configuration version to the database.
 * Validates the config, updates the cache, and triggers schema sync safely.
 */
export async function saveConfig(config: AppConfig): Promise<AppConfig> {
  console.log("[CONFIG SAVE] Validating and persisting new version...");

  // 1. Validate before saving (Double check even though UI might validate)
  const parsed = parseConfig(config);
  if (!parsed.success) {
    throw new Error("Invalid configuration detected. Save aborted.");
  }

  const validConfig = parsed.data;

  try {
    // 2. Insert new row to maintain history
    await pool.query(
      "INSERT INTO app_configs (config) VALUES ($1)",
      [JSON.stringify(validConfig)]
    );

    // 3. Update in-memory cache
    cachedConfig = validConfig;
    console.log("[CONFIG SAVE] Success! Cache updated.");

    // 4. Safe Schema Sync
    try {
      console.log("[CONFIG SAVE] Triggering schema synchronization...");
      await syncSchema(validConfig);
    } catch (syncError) {
      console.error("[SCHEMA SYNC ERROR] Data saved but schema sync failed:", syncError);
      // We don't throw here to allow the builder UI to remain functional
    }

    return validConfig;
  } catch (error) {
    console.error("[CONFIG SAVE ERROR] Failed to persist config:", error);
    throw error;
  }
}
