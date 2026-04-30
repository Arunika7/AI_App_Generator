"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppConfig, parseConfig } from "../../../shared/config";
import api from "../lib/api";

interface ConfigContextType {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  loading: true,
  error: null,
  refreshConfig: async () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch directly from the new builder API
      // Use standard fetch if api instance base URL is problematic, but api.get is cleaner
      const res = await api.get("/builder/config");
      const parsed = parseConfig(res.data);
      if (parsed.success) {
        setConfig(parsed.data);
        setError(null);
      } else {
        setConfig(parsed.data); // Fallback to whatever it could parse
        console.warn("Using partial/default config due to parse errors.", parsed.error);
      }
    } catch (err) {
      console.error("Failed to fetch configuration", err);
      setError("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <ConfigContext.Provider value={{ config, loading, error, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
