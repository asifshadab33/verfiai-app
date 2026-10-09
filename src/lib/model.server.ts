// ModelProvider: cost-aware model routing through OpenRouter. Triage and
// extraction run on the cheap route; synthesis/evaluation keeps the
// established engine order with automatic failover. Keys stay server-side.
import { meter } from "./metering.server";

// Approximate USD per 1M tokens (input, output) — estimates for metering only,
// never shown to users or billed.
const RATES: Record<string, { in: number; out: number }> = {
  "deepseek/deepseek-chat": { in: 0.27, out: 1.1 },
  "qwen/qwen-2.5-72b-instruct": { in: 0.35, out: 0.35 },
};
const FALLBACK_RATES = { in: 0.35, out: 0.35 };

const LABELS: Record<string, string> = {
  "groq:llama-3.3-70b-versatile": "Llama 3.3 70B (Groq)",
  "gemini:gemini-2.0-flash": "Gemini 2.0 Flash",
  "github:gpt-4o-mini": "GPT-4o mini (GitHub Models)",
  "mistral:mistral-small-latest": "Mistral Small",
  "deepseek/deepseek-chat": "DeepSeek V3",
  "qwen/qwen-2.5-72b-instruct": "Qwen 2.5 72B",
};

/** Route tables; overridable server-side via env (comma-separated model ids). */
export function getRoute(name: "triage" | "evaluation"): string[] {
  const envKey = name === "triage" ? "MODEL_ROUTE_TRIAGE" : "MODEL_ROUTE_EVALUATION";
  // Free-tier cascade first (Groq → Gemini → GitHub Models); OpenRouter engines stay as the paid last resort.
  const dflt = name === "triage" ? "qwen/qwen-2.5-72b-instruct" : "groq:llama-3.3-70b-versatile,gemini:gemini-2.0-flash,github:gpt-4o-mini,mistral:mistral-small-latest,deepseek/deepseek-chat,qwen/qwen-2.5-72b-instruct";
  const list = (process.env[envKey] ?? dflt).split(",").map(s => s.trim()).filter(Boolean);
  return list.length ? list : ["qwen/qwen-2.5-72b-instruct"];
}

/** OpenAI-compatible endpoints per provider prefix; a missing key skips that provider. */
const PROVIDERS: Record<string, { url: string; keyEnv: string; json: boolean }> = {
  groq: { url: "https://api.groq.com/openai/v1/chat/completions", keyEnv: "GROQ_API_KEY", json: true },
  gemini: { url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", keyEnv: "GEMINI_API_KEY", json: true },
  github: { url: "https://models.github.ai/inference/chat/completions", keyEnv: "GITHUB_MODELS_TOKEN", json: true },
  mistral: { url: "https://api.mistral.ai/v1/chat/completions", keyEnv: "MISTRAL_API_KEY", json: true },
  openrouter: { url: "https://openrouter.ai/api/v1/chat/completions", keyEnv: "OPENROUTER_API_KEY", json: true },
};
export function resolveModel(id: string) {
  const m = id.match(/^(groq|gemini|github|mistral):(.+)$/);
  return m ? { provider: m[1]!, model: m[2]! } : { provider: "openrouter", model: id };
}
const timeoutMs = () => { const n = Number(process.env["MODEL_TIMEOUT_MS"]); return Number.isFinite(n) && n > 0 ? n : 45000; };

export type CallMeta = { userId?: string | null; guestFingerprint?: string; reportId?: string; purpose?: string };

// Internal error codes — never shown to users; callers map them to friendly notices.
export async function callEngine(model: string, system: string, user: string, meta?: CallMeta): Promise<string> {
  const { provider, model: providerModel } = resolveModel(model);
  const cfg = PROVIDERS[provider]!;
  const key = process.env[cfg.keyEnv];
  if (!key) throw new Error("engine-missing");
  const t0 = Date.now();
  const estimate = (outLen: number) => {
    const r = RATES[model] ?? FALLBACK_RATES;
    return ((system.length + user.length) / 4 * r.in + outLen / 4 * r.out) / 1e6;
  };
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs()),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(provider === "openrouter" ? { "HTTP-Referer": "https://verfiai.app", "X-Title": "Verfiai" } : {}) },
      body: JSON.stringify({ model: providerModel, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    if (!res.ok) { console.error("OpenRouter", model, res.status, (await res.text()).slice(0, 300)); throw new Error(res.status === 402 ? "credits" : res.status === 429 ? "rate-limited" : "engine"); }
    const json = await res.json() as { choices?: { message?: { content?: string } }[] };
    const txt0 = (json.choices?.[0]?.message?.content ?? "").replace(/^```(?:json)?\s*|\s*```$/g, "");
    const txt = txt0.trim();
    if (!txt) throw new Error("engine-empty");
    void meter({ userId: meta?.userId ?? null, ...(meta?.guestFingerprint ? { guestFingerprint: meta.guestFingerprint } : {}), event: "ai_model_call", provider, modelRoute: model, latencyMs: Date.now() - t0, success: true, estimatedCostUsd: estimate(txt.length) });
    return txt;
  } catch (e) {
    if (!(e instanceof Error && e.message === "engine-missing"))
      void meter({ userId: meta?.userId ?? null, ...(meta?.guestFingerprint ? { guestFingerprint: meta.guestFingerprint } : {}), event: "ai_model_call", provider, modelRoute: model, latencyMs: Date.now() - t0, success: false, estimatedCostUsd: estimate(0) });
    throw e;
  }
}

/** Fails over across the route's models without exposing provider errors to users. */
export async function runRoute(name: "triage" | "evaluation", system: string, user: string, meta?: CallMeta): Promise<string> {
  const models = getRoute(name);
  let lastErr: unknown;
  for (const m of models) {
    try { return await callEngine(m, system, user, meta); }
    catch (e) { lastErr = e; /* try the next model; details stay in server logs */ }
  }
  throw lastErr instanceof Error ? lastErr : new Error("engine");
}

/** Synthesis route with engine labels (used by report generation). */
export async function synthesize(system: string, user: string, meta?: CallMeta): Promise<{ raw: string; engine: string }> {
  for (const m of getRoute("evaluation")) {
    try { return { raw: await callEngine(m, system, user, meta), engine: LABELS[m] ?? m }; }
    catch { /* try the next engine */ }
  }
  throw new Error("The report could not be generated right now. Please try again in a few minutes.");
}
