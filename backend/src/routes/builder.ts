import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { AppConfig, parseConfig } from "../../../shared/config";
import { setAppConfig } from "./dynamic";
import { syncSchema } from "../services/schemaSync";
import { parsePromptToConfig } from "../services/aiParser";

const router = Router();
const configPath = path.join(__dirname, "../../../app-config.json");

// Helper to read config safely
const readConfig = (): AppConfig => {
  if (!fs.existsSync(configPath)) {
    return parseConfig({}).data;
  }
  const rawData = fs.readFileSync(configPath, "utf-8");
  try {
    return parseConfig(JSON.parse(rawData)).data;
  } catch {
    return parseConfig({}).data;
  }
};

// GET /api/builder/config - Returns current configuration
router.get("/config", (req: Request, res: Response) => {
  const config = readConfig();
  res.json(config);
});

// PUT /api/builder/config - Updates config and triggers live schema sync
router.put("/config", async (req: Request, res: Response) => {
  const newConfigData = req.body;
  
  // Validate with Zod
  const parsed = parseConfig(newConfigData);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid configuration format", details: parsed.errors });
  }

  const validConfig = parsed.data;

  try {
    // 1. Write to file
    fs.writeFileSync(configPath, JSON.stringify(validConfig, null, 2), "utf-8");
    
    // 2. Update runtime memory (so API routes work instantly)
    setAppConfig(validConfig);
    
    // 3. Sync Database schema without restarting server
    await syncSchema(validConfig);
    
    res.json({ message: "Configuration synced successfully!", config: validConfig });
  } catch (error) {
    console.error("[BUILDER ERROR] Failed to update config:", error);
    res.status(500).json({ error: "Internal server error during config sync" });
  }
});

// POST /api/builder/generate - Convers natural language prompt to JSON
router.post("/generate", (req: Request, res: Response) => {
  const { prompt, currentConfig } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const aiResult = parsePromptToConfig(prompt, currentConfig);
  res.json(aiResult);
});

export default router;
