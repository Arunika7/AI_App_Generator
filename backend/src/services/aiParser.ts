// aiParser.ts
import { AppConfig, EntityConfig } from "../../../shared/config";

const COMMON_ENTITIES: Record<string, { synonyms: string[], defaultFields: string[], related: string[] }> = {
  gym: { synonyms: ["fitness", "workout", "club"], defaultFields: ["name", "membership_type", "join_date", "phone"], related: ["trainers", "classes", "equipment"] },
  crm: { synonyms: ["customers", "clients", "leads", "sales"], defaultFields: ["name", "email", "phone", "company", "status"], related: ["deals", "notes", "tasks"] },
  task: { synonyms: ["todo", "management", "project", "kanban"], defaultFields: ["title", "description", "status", "due_date"], related: ["users", "comments", "tags"] },
  school: { synonyms: ["students", "university", "college", "education"], defaultFields: ["name", "enrollment_number", "grade", "email"], related: ["courses", "teachers", "grades"] },
  library: { synonyms: ["books", "lending", "inventory"], defaultFields: ["title", "author", "isbn", "published_date"], related: ["members", "loans", "categories"] }
};

const COMMON_FIELDS = ["name", "email", "phone", "age", "status", "title", "description", "date", "price", "amount", "location", "address", "company"];
const FIELD_TYPE_MAP: Record<string, string> = {
  email: "email", date: "date", join_date: "date", due_date: "date", published_date: "date", created_at: "date",
  age: "number", price: "number", amount: "number", quantity: "number"
};

export const parsePromptToConfig = (prompt: string, currentConfig?: AppConfig) => {
  const normalized = prompt.toLowerCase();
  
  // Base configuration to return
  let newConfig: AppConfig = currentConfig ? JSON.parse(JSON.stringify(currentConfig)) : {
    appName: "Dynamic App",
    auth: false,
    entities: [],
    ui: [],
    translations: {}
  };

  const isAddition = normalized.includes("add") || normalized.includes("include");
  const isRemoval = normalized.includes("remove") || normalized.includes("delete");
  const isAuthToggle = normalized.includes("auth") || normalized.includes("login") || normalized.includes("signup");
  
  if (isAuthToggle && (normalized.includes("enable") || normalized.includes("add"))) {
    newConfig.auth = true;
    return { config: newConfig, message: "Authentication system enabled for the application." };
  }
  
  if (isAuthToggle && (normalized.includes("disable") || normalized.includes("remove"))) {
    newConfig.auth = false;
    return { config: newConfig, message: "Authentication system disabled." };
  }
  
  // 1. Detect if modifying existing entity
  let activeEntity = newConfig.entities.length > 0 ? newConfig.entities[newConfig.entities.length - 1] : null;
  
  // Find fields mentioned in prompt
  const words = normalized.replace(/[,.]/g, " ").split(/\s+/);
  const mentionedFields = words.filter(w => COMMON_FIELDS.includes(w) || w.includes("field"));
  
  if (isAddition && activeEntity) {
    // Conversational: "Add email field"
    words.forEach(word => {
      if (COMMON_FIELDS.includes(word) || (!["add", "field", "a", "an", "the", "to", "and"].includes(word) && word.length > 3)) {
        if (!activeEntity!.fields.some(f => f.name === word) && word !== "field") {
          activeEntity!.fields.push({
            name: word,
            type: (FIELD_TYPE_MAP[word] || "text") as "text" | "number" | "email" | "date",
            required: false
          });
        }
      }
    });
    return { config: newConfig, message: `Added new fields to '${activeEntity.name}'.` };
  }

  if (isRemoval && activeEntity) {
     words.forEach(word => {
       activeEntity!.fields = activeEntity!.fields.filter(f => f.name !== word);
     });
     return { config: newConfig, message: `Removed specified fields from '${activeEntity.name}'.` };
  }

  // 2. Generate brand new entity
  let detectedEntity = "custom_entity";
  let suggestedFields = new Set<string>();
  let suggestions: string[] = [];

  for (const key of Object.keys(COMMON_ENTITIES)) {
    const data = COMMON_ENTITIES[key];
    if (normalized.includes(key) || data.synonyms.some(s => normalized.includes(s))) {
      detectedEntity = key;
      data.defaultFields.forEach(f => suggestedFields.add(f));
      suggestions = data.related;
      break;
    }
  }

  // If no main entity detected but fields requested, use a generic name based on prompt
  if (detectedEntity === "custom_entity") {
     const possibleNouns = words.filter(w => w.length > 4 && !COMMON_FIELDS.includes(w) && !["create", "build", "make"].includes(w));
     if (possibleNouns.length > 0) detectedEntity = possibleNouns[0] + "s";
  }

  words.forEach(word => {
    if (COMMON_FIELDS.includes(word)) suggestedFields.add(word);
  });

  if (suggestedFields.size === 0) {
    suggestedFields.add("name");
    suggestedFields.add("description");
  }

  const fields = Array.from(suggestedFields).map(f => ({
    name: f,
    type: (FIELD_TYPE_MAP[f] || "text") as "text" | "number" | "email" | "date",
    required: f === "name" || f === "title" || f === "email"
  }));

  // Append new entity
  newConfig.entities.push({
    name: detectedEntity,
    enableEvents: true,
    fields
  });

  // Append UI
  newConfig.ui.push({ type: "form", entity: detectedEntity });
  newConfig.ui.push({ type: "table", entity: detectedEntity });
  if (normalized.includes("dashboard") || normalized.includes("chart")) {
    newConfig.ui.push({ type: "chart", entity: detectedEntity });
  }

  return { config: newConfig, message: `Created new entity '${detectedEntity}' with ${fields.length} fields.` };
};
