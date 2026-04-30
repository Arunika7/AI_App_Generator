import { z } from "zod";

// Zod Schema for robust parsing
export const FieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["text", "number", "email", "date"]),
  required: z.boolean().default(false),
});

export const EntitySchema = z.object({
  name: z.string().min(1),
  fields: z.array(FieldSchema).default([]),
  enableEvents: z.boolean().default(false),
});

export const UIComponentSchema = z.object({
  type: z.enum(["form", "table", "dashboard", "chart", "unknown_type"]),
  entity: z.string().optional(),
});

export const TranslationsSchema = z.record(
  z.string(), // language code like 'en', 'es'
  z.record(z.string(), z.string()) // key-value pairs for translations
);

export const AppConfigSchema = z.object({
  appName: z.string().default("Generated App"),
  auth: z.boolean().default(true),
  entities: z.array(EntitySchema).default([]),
  ui: z.array(UIComponentSchema).default([]),
  translations: TranslationsSchema.default({}),
});

// TypeScript Types extracted from Zod
export type FieldConfig = z.infer<typeof FieldSchema>;
export type EntityConfig = z.infer<typeof EntitySchema>;
export type UIComponentConfig = z.infer<typeof UIComponentSchema>;
export type TranslationsConfig = z.infer<typeof TranslationsSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

/**
 * Utility to safely parse the configuration and provide defaults
 * It will strip unknown fields and log warnings instead of throwing by default,
 * but using z.object(...) already strips unknown fields automatically.
 * 
 * We use safeParse to avoid crashing the server.
 */
export function parseConfig(config: unknown): { success: boolean; data: AppConfig; errors?: any } {
  const result = AppConfigSchema.safeParse(config);
  
  if (!result.success) {
    console.warn("[CONFIG WARNING] Invalid configuration detected. Using defaults where possible, but core issues exist.");
    console.warn(result.error.issues);
    
    // Attempt a more forgiving parse by falling back to defaults if we can, or returning an empty config
    return {
      success: false,
      data: AppConfigSchema.parse({}), // Fallback to absolute defaults
      errors: result.error.issues,
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}
