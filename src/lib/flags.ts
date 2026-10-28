// Shared flag names/defaults (safe for browser and server).
export const FLAG_DEFAULTS = {
  ANALYST_PLAN_ENABLED: false,
  ANALYST_WAITLIST_ENABLED: true,
  EVIDENCE_LIBRARY_ENABLED: false,
  OPEN_KNOWLEDGE_INDEX_ENABLED: false,
  RESOURCE_DOWNLOADS_ENABLED: false,
  RESOURCE_ADMIN_ENABLED: false,
  DEEP_RESEARCH_ENABLED: false,
  ADVANCED_SOURCE_SCORING_ENABLED: true,
  MODEL_ESCALATION_ROUTING_ENABLED: false,
  PUBLIC_REPORT_SHARING_ENABLED: true,
} as const;
export type FlagKey = keyof typeof FLAG_DEFAULTS;
export const FLAG_KEYS = Object.keys(FLAG_DEFAULTS) as FlagKey[];

