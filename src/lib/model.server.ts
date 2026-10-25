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
  "cerebras:llama-3.3-70b": "Llama 3.3 70B (Cerebras)",
  "cerebras:deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill 70B (Cerebras)",
  "deepinfra:Qwen/Qwen2.5-72B-Instruct": "Qwen 2.5 72B (DeepInfra)",
  "sambanova:Meta-Llama-3.3-70B-Instruct": "Llama 3.3 70B (SambaNova)",
  "nvidia:meta/llama-3.3-70b-instruct": "Llama 3.3 70B (NVIDIA)",
  "nvidia:deepseek-ai/deepseek-r1": "DeepSeek R1 (NVIDIA)",
  "groq:openai/gpt-oss-120b": "GPT-OSS 120B (Groq)",
  "groq:openai/gpt-oss-20b": "GPT-OSS 20B (Groq)",
  "gemini:gemini-3.8-flash": "Gemini 3.8 Flash",
  "google/gemma-4-26b-a4b-it:free": "Gemma 4 (OpenRouter free)",
  "nvidia/nemotron-3-super-120b-a12b:free": "Nemotron 3 Super (OpenRouter free)",
  "mistral:mistral-small-latest": "Mistral Small",
  "deepseek:deepseek-chat": "DeepSeek V3",
  "dashscope:qwen-plus": "Qwen Plus (DashScope)",
  "github:openai/gpt-4o-mini": "GPT-4o mini (GitHub Models)",
  "deepseek/deepseek-chat": "DeepSeek V3 (OpenRouter)",
  "qwen/qwen-2.5-72b-instruct": "Qwen 2.5 72B (OpenRouter)",
  "deepinfra:deepseek-ai/DeepSeek-V3": "DeepSeek V3 (DeepInfra)",
  "mistralai/mistral-nemo": "Mistral Nemo (OpenRouter)",
};

export const ROUTES = {
  // Cheap, fast claim extraction.
  triage: ["cerebras:llama-3.3-70b", "groq:openai/gpt-oss-20b", "groq:openai/gpt-oss-120b", "sambanova:Meta-Llama-3.3-70B-Instruct", "google/gemma-4-26b-a4b-it:free", "nvidia/nemotron-3-super-120b-a12b:free", "gemini:gemini-3.8-flash", "deepinfra:Qwen/Qwen2.5-72B-Instruct", "github:openai/gpt-4o-mini", "qwen/qwen-2.5-72b-instruct"],
  // Synthesis and consensus evaluation.
  evaluation: ["cerebras:llama-3.3-70b", "groq:openai/gpt-oss-120b", "sambanova:Meta-Llama-3.3-70B-Instruct", "google/gemma-4-26b-a4b-it:free", "nvidia/nemotron-3-super-120b-a12b:free", "cerebras:deepseek-r1-distill-llama-70b", "nvidia:meta/llama-3.3-70b-instruct", "nvidia:deepseek-ai/deepseek-r1", "gemini:gemini-3.8-flash", "mistral:mistral-small-latest", "deepseek:deepseek-chat", "deepinfra:deepseek-ai/DeepSeek-V3", "mistralai/mistral-nemo", "dashscope:qwen-plus", "deepinfra:Qwen/Qwen2.5-72B-Instruct", "github:openai/gpt-4o-mini", "deepseek/deepseek-chat", "qwen/qwen-2.5-72b-instruct"],
} as const;

/** Route tables; overridable server-side via env (comma-separated model ids). Providers without keys are skipped at call time. */
export function getRoute(name: "triage" | "evaluation"): string[] {
  const env = process.env[name === "triage" ? "MODEL_ROUTE_TRIAGE" : "MODEL_ROUTE_EVALUATION"];
  const list = (env ? env.split(",") : [...ROUTES[name]]).map(s => s.trim()).filter(Boolean);
  return list.length ? list : [...ROUTES[name]];
}

/** OpenAI-compatible endpoints per provider prefix; a missing key quietly skips that provider. */
export const PROVIDERS: Record<string, { url: string; keyEnv: string; json: boolean }> = {
  cerebras: { url: "https://api.cerebras.ai/v1/chat/completions", keyEnv: "CEREBRAS_API_KEY", json: true },
  deepinfra: { url: "https://api.deepinfra.com/v1/openai/chat/completions", keyEnv: "DEEPINFRA_API_KEY", json: true },
  sambanova: { url: "https://api.sambanova.ai/v1/chat/completions", keyEnv: "SAMBANOVA_API_KEY", json: false },
  nvidia: { url: "https://integrate.api.nvidia.com/v1/chat/completions", keyEnv: "NVIDIA_API_KEY", json: false },
  groq: { url: "https://api.groq.com/openai/v1/chat/completions", keyEnv: "GROQ_API_KEY", json: true },
  gemini: { url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", keyEnv: "GEMINI_API_KEY", json: true },
  github: { url: "https://models.github.ai/inference/chat/completions", keyEnv: "GITHUB_MODELS_TOKEN", json: true },
  mistral: { url: "https://api.mistral.ai/v1/chat/completions", keyEnv: "MISTRAL_API_KEY", json: true },
  deepseek: { url: "https://api.deepseek.com/chat/completions", keyEnv: "DEEPSEEK_API_KEY", json: true },
  dashscope: { url: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", keyEnv: "DASHSCOPE_API_KEY", json: true },
  openrouter: { url: "https://openrouter.ai/api/v1/chat/completions", keyEnv: "OPENROUTER_API_KEY", json: true },
};
const PREFIX = new RegExp(`^(${Object.keys(PROVIDERS).filter(k => k !== "openrouter").join("|")}):(.+)$`);
export function resolveModel(id: string) {
  const m = id.match(PREFIX);
  return m?.[1] && m[2] ? { provider: m[1], model: m[2] } : { provider: "openrouter", model: id };
}
/** True when the provider for this model id has a key configured. */
export const hasKey = (id: string) => { const cfg = PROVIDERS[resolveModel(id).provider]; return cfg ? !!process.env[cfg.keyEnv] : false; };
/** Sentinel statuses: rate limit, unavailable, out of credits → fail over immediately. */
export const SENTINEL_STATUSES = [402, 429, 503] as const;
const timeoutMs = () => { const n = Number(process.env["MODEL_TIMEOUT_MS"]); return Number.isFinite(n) && n > 0 ? n : 45000; };

/** JSON mode providers require the word "json" somewhere in the messages. */
export const withJsonWord = (system: string, user: string) => /json/i.test(system + user) ? system : `${system}\n\nRespond with a single valid JSON object.`;

export type CallMeta = { userId?: string | null; guestFingerprint?: string; reportId?: string; purpose?: string };

// Internal error codes — never shown to users; callers map them to friendly notices.
export async function callEngine(model: string, system: string, user: string, meta?: CallMeta, maxTokens = 3500): Promise<string> {
  const { provider, model: providerModel } = resolveModel(model);
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new Error("engine-missing");
  const key = process.env[cfg.keyEnv];
  if (!key) throw new Error("engine-missing");
  const t0 = Date.now();
  const estimate = (outLen: number) => {
    const r = RATES[model] ?? FALLBACK_RATES;
    return ((system.length + user.length) / 4 * r.in + outLen / 4 * r.out) / 1e6;
  };
  // JSON mode (e.g. Groq) rejects requests whose messages never mention "json" with HTTP 400.
  const sys = cfg.json ? withJsonWord(system, user) : system;
  // Groq's on-demand TPM limit counts input plus requested output, not just output.
  const outputTokens = provider === "groq" ? Math.min(maxTokens, Math.max(512, 7500 - Math.ceil((sys.length + user.length) / 3))) : maxTokens;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs()),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(provider === "openrouter" ? { "HTTP-Referer": "https://verfiai.app", "X-Title": "Verfiai" } : {}) },
      body: JSON.stringify({ model: providerModel, temperature: 0.2, max_tokens: outputTokens, ...(cfg.json ? { response_format: { type: "json_object" } } : {}), messages: [{ role: "system", content: sys }, { role: "user", content: user }] }),
    });
    if (!res.ok) {
      // Provider bodies can contain account identifiers or credential-bearing links.
      // Status plus provider/model is sufficient for diagnostics; never log the body.
      console.error("model provider", provider, providerModel, res.status);
      throw new Error(res.status === 402 ? "credits" : res.status === 429 ? "rate-limited" : res.status === 503 ? "unavailable" : "engine");
    }
    const json = await res.json() as { choices?: { message?: { content?: string } }[] };
    const txt0 = (json.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
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
  const models = getRoute(name).filter(hasKey);
  let lastErr: unknown;
  for (const m of models) {
    try { return await callEngine(m, system, user, meta, name === "triage" ? 2500 : 3500); }
    catch (e) { lastErr = e; /* try the next model; details stay in server logs */ }
  }
  throw lastErr instanceof Error ? lastErr : new Error("engine");
}

/** Synthesis route with engine labels (used by report generation). */
export async function synthesize(system: string, user: string, meta?: CallMeta, validate?: (raw: string) => boolean): Promise<{ raw: string; engine: string }> {
  for (const m of getRoute("evaluation").filter(hasKey)) {
    try {
      const raw = await callEngine(m, system, user, meta);
      if (validate && !validate(raw)) continue;
      return { raw, engine: LABELS[m] ?? m };
    }
    catch { /* try the next engine */ }
  }
  throw new Error("The report could not be generated right now. Please try again in a few minutes.");
}
