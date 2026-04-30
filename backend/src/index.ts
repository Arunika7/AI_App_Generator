import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import { parseConfig } from "../../shared/config";
import { syncSchema } from "./services/schemaSync";
import authRoutes from "./routes/auth";
import dynamicRoutes, { setAppConfig } from "./routes/dynamic";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic rate limiting is added to prevent abuse of dynamic endpoints
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

const PORT = process.env.PORT || 5000;

// Load config
const loadConfig = async () => {
  try {
    const configPath = path.join(__dirname, "../../app-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("[CONFIG WARNING] app-config.json not found! System will use empty defaults.");
      return parseConfig({}).data; // Fallback
    }
    const rawData = fs.readFileSync(configPath, "utf-8");
    const parsed = parseConfig(JSON.parse(rawData));
    return parsed.data;
  } catch (error) {
    console.error("[CONFIG ERROR] Failed to read/parse config file. Using defaults.");
    return parseConfig({}).data;
  }
};

const init = async () => {
  const config = await loadConfig();
  
  // Set config for dynamic routes
  setAppConfig(config);

  // Sync schema
  await syncSchema(config);

  // Request logger for observability
  app.use((req, res, next) => {
    console.log(`[API REQUEST] ${req.method} ${req.url}`);
    next();
  });

  // Mount routes
  app.use("/api/auth", authRoutes);
  app.use("/api/dynamic", dynamicRoutes);

  // Fallback error handler with structured logging
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[API ERROR] Uncaught Exception:", err);
    res.status(500).json({ error: "Something went wrong!" });
  });

  app.listen(PORT, () => {
    console.log(`🚀 [Server] Platform running on http://localhost:${PORT}`);
  });
};

init();
