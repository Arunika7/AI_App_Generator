import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { AppConfig, parseConfig } from "../../../shared/config";
import { setAppConfig } from "./dynamic";
import { getConfig, saveConfig } from "../services/configService";
import { parsePromptToConfig } from "../services/aiParser";

const router = Router();
// GET /api/builder/config - Returns current configuration
router.get("/config", async (req: Request, res: Response) => {
  const config = await getConfig();
  res.json(config);
});

// PUT /api/builder/config - Updates config and triggers live schema sync
router.put("/config", async (req: Request, res: Response) => {
  try {
    const newConfigData = req.body;
    const validConfig = await saveConfig(newConfigData);
    
    // Update runtime memory for dynamic routes
    setAppConfig(validConfig);
    
    res.json({ message: "Configuration synced successfully!", config: validConfig });
  } catch (error: any) {
    console.error("[BUILDER ERROR] Failed to update config:", error);
    res.status(400).json({ error: error.message || "Failed to update configuration" });
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
