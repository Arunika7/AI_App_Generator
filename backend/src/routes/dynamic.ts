import { Router, Response } from "express";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import pool from "../config/db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { AppConfig } from "../../../shared/config";
import { triggerEvent } from "../services/events";

// We need a way to access the config dynamically in routes. 
// For simplicity, we'll expose a setter or import it directly if it's singleton.
let currentConfig: AppConfig;

export const setAppConfig = (config: AppConfig) => {
  currentConfig = config;
};

const router = Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for CSV

// Wrapper to dynamically enable/disable auth based on config
const conditionalAuth = (req: AuthRequest, res: Response, next: Function) => {
  if (!currentConfig.auth) {
    req.user = { id: 0, email: "guest@system.local" };
    return next();
  }
  return authMiddleware(req, res, next as any);
};

// Middleware to validate entity existence
const validateEntity = (req: AuthRequest, res: Response, next: Function) => {
  const { entity } = req.params;
  const entityConfig = currentConfig.entities.find((e) => e.name === entity);
  
  if (!entityConfig) {
    console.error(`[API ERROR] Invalid entity requested: ${entity}`);
    res.status(400).json({ error: `Invalid entity: '${entity}' not found in configuration` });
    return;
  }
  
  // Attach for downstream handlers
  (req as any).entityConfig = entityConfig;
  next();
};

// GET /api/dynamic/:entity
router.get("/:entity", conditionalAuth, validateEntity, async (req: AuthRequest, res: Response) => {
  const entity = req.params.entity as string;
  const userId = req.user!.id;

  try {
    const query = currentConfig.auth 
      ? `SELECT * FROM ${entity} WHERE user_id = $1 ORDER BY created_at DESC`
      : `SELECT * FROM ${entity} ORDER BY created_at DESC`;
    
    const params = currentConfig.auth ? [userId] : [];
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error(`GET /${entity} Error:`, error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST /api/dynamic/:entity
router.post("/:entity", conditionalAuth, validateEntity, async (req: AuthRequest, res: Response) => {
  const entity = req.params.entity as string;
  const entityConfig = (req as any).entityConfig;
  const userId = req.user!.id;
  
  const fields = entityConfig.fields.map((f: any) => f.name);
  const columns = [...fields];
  const values = fields.map((f: string) => req.body[f] ?? null);
  
  if (currentConfig.auth) {
    columns.push("user_id");
    values.push(userId);
  }

  const placeholders = values.map((_: any, i: number) => `$${i + 1}`).join(", ");
  
  try {
    const query = `INSERT INTO ${entity} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    
    triggerEvent(currentConfig, entity, "CREATE", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`POST /${entity} Error:`, error);
    res.status(400).json({ error: "Failed to create record. Ensure all required fields are valid." });
  }
});

// PUT /api/dynamic/:entity/:id
router.put("/:entity/:id", conditionalAuth, validateEntity, async (req: AuthRequest, res: Response) => {
  const entity = req.params.entity as string;
  const id = req.params.id as string;
  const entityConfig = (req as any).entityConfig;
  const userId = req.user!.id;
  
  const fields = entityConfig.fields.map((f: any) => f.name);
  
  let setClauses = [];
  let values = [];
  let index = 1;

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      setClauses.push(`${field} = $${index}`);
      values.push(req.body[field]);
      index++;
    }
  }

  if (setClauses.length === 0) {
    res.status(400).json({ error: "No valid fields provided for update" });
    return;
  }

  values.push(id);
  let query = `UPDATE ${entity} SET ${setClauses.join(", ")} WHERE id = $${index}`;
  
  if (currentConfig.auth) {
    index++;
    values.push(userId);
    query += ` AND user_id = $${index}`;
  }
  
  query += ` RETURNING *`;

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
       res.status(404).json({ error: "Record not found or unauthorized" });
       return;
    }
    triggerEvent(currentConfig, entity, "UPDATE", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`PUT /${entity}/${id} Error:`, error);
    res.status(400).json({ error: "Failed to update record." });
  }
});

// DELETE /api/dynamic/:entity/:id
router.delete("/:entity/:id", conditionalAuth, validateEntity, async (req: AuthRequest, res: Response) => {
  const entity = req.params.entity as string;
  const id = req.params.id as string;
  const userId = req.user!.id;

  let query = `DELETE FROM ${entity} WHERE id = $1`;
  let values: any[] = [id];

  if (currentConfig.auth) {
    query += ` AND user_id = $2`;
    values.push(userId);
  }

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
       res.status(404).json({ error: "Record not found or unauthorized" });
       return;
    }
    triggerEvent(currentConfig, entity, "DELETE", { id });
    res.status(204).send();
  } catch (error) {
    console.error(`DELETE /${entity}/${id} Error:`, error);
    res.status(500).json({ error: "Failed to delete record." });
  }
});

// CSV IMPORT SYSTEM
// POST /api/dynamic/:entity/import
router.post("/:entity/import", conditionalAuth, validateEntity, upload.single("file"), async (req: AuthRequest, res: Response) => {
  const entity = req.params.entity as string;
  const entityConfig = (req as any).entityConfig;
  const userId = req.user!.id;

  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const results: any[] = [];
  const fields = entityConfig.fields.map((f: any) => f.name);

  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, skip_empty_lines: true }))
    .on("data", (data: any) => {
      // Basic mapping: only pick fields defined in config
      const mappedRow: any = {};
      let hasData = false;
      
      // Case-insensitive matching for columns
      const dataKeys = Object.keys(data);
      
      for (const field of fields) {
        // Try exact match first, then case-insensitive
        const exactKey = dataKeys.find(k => k === field);
        const caseKey = dataKeys.find(k => k.toLowerCase() === field.toLowerCase());
        const key = exactKey || caseKey;
        
        const val = key ? data[key] : null;
        mappedRow[field] = val || null;
        if (val !== null && val !== undefined && val !== "") hasData = true;
      }
      
      if (hasData) results.push(mappedRow);
    })
    .on("end", async () => {
      // Cleanup file
      fs.unlinkSync(req.file!.path);

      if (results.length === 0) {
        res.status(400).json({ error: "Empty CSV or no matching columns found." });
        return;
      }

      // Bulk Insert using transactions
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        let insertedCount = 0;
        for (const row of results) {
           const columns = [...fields];
           const values = fields.map((f: string) => row[f]);
           
           if (currentConfig.auth) {
             columns.push("user_id");
             values.push(userId);
           }

           const placeholders = values.map((_: any, i: number) => `$${i + 1}`).join(", ");
           const query = `INSERT INTO ${entity} (${columns.join(", ")}) VALUES (${placeholders})`;
           
           await client.query(query, values);
           insertedCount++;
        }

        await client.query('COMMIT');
        triggerEvent(currentConfig, entity, "CREATE", { bulkImport: true, count: insertedCount });
        res.json({ message: `Successfully imported ${insertedCount} rows.` });
      } catch (error: any) {
        await client.query('ROLLBACK');
        console.error(`CSV Import Error:`, error);
        res.status(500).json({ error: `Import failed: ${error.message}` });
      } finally {
        client.release();
      }
    });
});

export default router;
