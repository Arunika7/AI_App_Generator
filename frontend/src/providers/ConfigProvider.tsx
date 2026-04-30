"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AppConfig, parseConfig } from "../../../shared/config";

// Normally, this config would be fetched from an API endpoint on the backend
// that reads the JSON file, or imported directly if it's a monorepo.
// For this platform, let's assume we can fetch it.

interface ConfigContextType {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  loading: true,
  error: null,
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, we fetch from backend: GET /api/config
    // Here we'll simulate it by importing directly (for local development)
    const loadConfig = async () => {
      try {
        const rawConfig = await import("../../../../app-config.json").catch(() => ({}));
        const parsed = parseConfig(rawConfig);
        if (parsed.success) {
           setConfig(parsed.data);
        } else {
           setConfig(parsed.data); // Fallback to safe defaults
           console.warn("Using default config due to parse errors.");
        }
      } catch (err) {
        setError("Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
