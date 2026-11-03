// ModelProvider: cost-aware model routing through OpenRouter. Triage and
// extraction run on the cheap route; synthesis/evaluation keeps the
// established engine order with automatic failover. Keys stay server-side.
import { meter } from "./metering.server";

// Approximate USD per 1M tokens (input, output) — estimates for metering only,
// never shown to users or billed. Providers used through their free tier are
// metered at $0; paid models keep published-list estimates.
const FREE = { in: 0, out: 0 };
const RATES: Record<string, { in: number; out: number }> = {
  // Free-tier providers (Cerebras, Groq, SambaNova, NVIDIA, GitHub Models).
  "cerebras:llama-3.3-70b": FREE,
  "cerebras:deepseek-r1-distill-llama-70b": FREE,
  "groq:openai/gpt-oss-120b": FREE,
  "groq:openai/gpt-oss-20b": FREE,
  "sambanova:Meta-Llama-3.3-70B-Instruct": FREE,
  "nvidia:meta/llama-3.3-70b-instruct": FREE,
  "nvidia:deepseek-ai/deepseek-r1": FREE,
  "github:openai/gpt-4o-mini": FREE,
  // OpenRouter :free variants.
  "google/gemma-4-26b-a4b-it:free": FREE,
  "nvidia/nemotron-3-super-120b-a12b:free": FREE,
  // Paid models (published list prices at time of writing).
  "deepseek/deepseek-chat": { in: 0.27, out: 1.1 },
  "deepseek:deepseek-chat": { in: 0.27, out: 1.1 },
  "qwen/qwen-2.5-72b-instruct": { in: 0.35, out: 0.35 },
  // Lovable AI Gateway (published list-price estimates; billed as workspace credits).
  "lovable:google/gemini-2.5-flash-lite": { in: 0.1, out: 0.4 },
  "lovable:openai/gpt-5-nano": { in: 0.05, out: 0.4 },
};
const FALLBACK_RATES = { in: 0.35, out: 0.35 };
/** Providers accessed through their free tier meter at $0 regardless of model id. */
const FREE_TIER_PROVIDERS = new Set(["cerebras", "groq", "sambanova", "nvidia", "github"]);

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
  "lovable:google/gemini-2.5-flash-lite": "Gemini 2.5 Flash Lite (Lovable AI)",
  "lovable:openai/gpt-5-nano": "GPT-5 Nano (Lovable AI)",
};

export const ROUTES = {
  // Cheap, fast claim extraction.
  triage: [
    "cerebras:llama-3.3-70b",
    "groq:openai/gpt-oss-20b",
    "groq:openai/gpt-oss-120b",
    "sambanova:Meta-Llama-3.3-70B-Instruct",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "lovable:google/gemini-2.5-flash-lite",
    "lovable:openai/gpt-5-nano",
    "gemini:gemini-3.8-flash",
    "deepinfra:Qwen/Qwen2.5-72B-Instruct",
    "github:openai/gpt-4o-mini",
    "qwen/qwen-2.5-72b-instruct",
  ],
  // Synthesis and consensus evaluation.
  evaluation: [
    "cerebras:llama-3.3-70b",
    "groq:openai/gpt-oss-120b",
    "sambanova:Meta-Llama-3.3-70B-Instruct",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "cerebras:deepseek-r1-distill-llama-70b",
    "nvidia:meta/llama-3.3-70b-instruct",
    "nvidia:deepseek-ai/deepseek-r1",
    "lovable:google/gemini-2.5-flash-lite",
    "lovable:openai/gpt-5-nano",
    "gemini:gemini-3.8-flash",
    "mistral:mistral-small-latest",
    "deepseek:deepseek-chat",
    "deepinfra:deepseek-ai/DeepSeek-V3",
    "mistralai/mistral-nemo",
    "dashscope:qwen-plus",
    "deepinfra:Qwen/Qwen2.5-72B-Instruct",
    "github:openai/gpt-4o-mini",
    "deepseek/deepseek-chat",
    "qwen/qwen-2.5-72b-instruct",
  ],
} as const;

/** Route tables; overridable server-side via env (comma-separated model ids). Providers without keys are skipped at call time. */
export function getRoute(name: "triage" | "evaluation"): string[] {
  const env = process.env[name === "triage" ? "MODEL_ROUTE_TRIAGE" : "MODEL_ROUTE_EVALUATION"];
  const list = (env ? env.split(",") : [...ROUTES[name]]).map((s) => s.trim()).filter(Boolean);
  return list.length ? list : [...ROUTES[name]];
}

/** OpenAI-compatible endpoints per provider prefix; a missing key quietly skips that provider. */
export const PROVIDERS: Record<string, { url: string; keyEnv: string; json: boolean }> = {
  cerebras: {
    url: "https://api.cerebras.ai/v1/chat/completions",
    keyEnv: "CEREBRAS_API_KEY",
    json: true,
  },
  deepinfra: {
    url: "https://api.deepinfra.com/v1/openai/chat/completions",
    keyEnv: "DEEPINFRA_API_KEY",
    json: true,
  },
  sambanova: {
    url: "https://api.sambanova.ai/v1/chat/completions",
    keyEnv: "SAMBANOVA_API_KEY",
    json: false,
  },
  nvidia: {
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    keyEnv: "NVIDIA_API_KEY",
    json: false,
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    keyEnv: "GROQ_API_KEY",
    json: true,
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    keyEnv: "GEMINI_API_KEY",
    json: true,
  },
  github: {
    url: "https://models.github.ai/inference/chat/completions",
    keyEnv: "GITHUB_MODELS_TOKEN",
    json: true,
  },
  mistral: {
    url: "https://api.mistral.ai/v1/chat/completions",
    keyEnv: "MISTRAL_API_KEY",
    json: true,
  },
  deepseek: {
    url: "https://api.deepseek.com/chat/completions",
    keyEnv: "DEEPSEEK_API_KEY",
    json: true,
  },
  dashscope: {
    url: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    keyEnv: "DASHSCOPE_API_KEY",
    json: true,
  },
  lovable: {
    url: "https://ai.gateway.lovable.dev/v1/chat/completions",
    keyEnv: "LOVABLE_API_KEY",
    json: true,
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    keyEnv: "OPENROUTER_API_KEY",
    json: true,
  },
};
const PREFIX = new RegExp(
  `^(${Object.keys(PROVIDERS)
    .filter((k) => k !== "openrouter")
    .join("|")}):(.+)$`,
);
export function resolveModel(id: string) {
  const m = id.match(PREFIX);
  return m?.[1] && m[2] ? { provider: m[1], model: m[2] } : { provider: "openrouter", model: id };
}
/** True when the provider for this model id has a key configured. */
export const hasKey = (id: string) => {
  const cfg = PROVIDERS[resolveModel(id).provider];
  return cfg ? !!process.env[cfg.keyEnv] : false;
};
/** Sentinel statuses: rate limit, unavailable, out of credits → fail over immediately. */
export const SENTINEL_STATUSES = [402, 429, 503] as const;

// Provider cooldown (in-memory per worker). Hard failures (402/429/5xx/401/403,
// timeout/abort) cool immediately; soft failures (400/404, empty or invalid
// output) cool only after 3 consecutive ones. A success clears the soft count.
// When every keyed provider is cooling, the full route is used anyway.
const cooldownMs = () => {
  for (const k of ["PROVIDER_COOLDOWN_MS", "MODEL_COOLDOWN_MS"]) {
    const n = Number(process.env[k]);
    if (process.env[k] && Number.isFinite(n) && n > 0) return n;
  }
  return 5 * 60_000;
};
const SOFT_FAILURE_LIMIT = 3;
const cooldownUntil = new Map<string, number>();
const softFailures = new Map<string, number>();
const coolProvider = (provider: string) => {
  cooldownUntil.set(provider, Date.now() + cooldownMs());
  softFailures.delete(provider);
};
const isCooling = (provider: string) => (cooldownUntil.get(provider) ?? 0) > Date.now();
function softFailure(provider: string) {
  const n = (softFailures.get(provider) ?? 0) + 1;
  if (n >= SOFT_FAILURE_LIMIT) coolProvider(provider);
  else softFailures.set(provider, n);
}
const isHardStatus = (status: number) =>
  status === 401 || status === 402 || status === 403 || status === 429 || status >= 500;
/** Models whose providers are not cooling; falls back to the full list when all are cooling. */
function routable(models: string[]): string[] {
  const fresh = models.filter((m) => !isCooling(resolveModel(m).provider));
  return fresh.length ? fresh : models;
}

// Recent per-provider outcomes (last 10) for the "least busy" health tiebreak.
const recentOutcomes = new Map<string, boolean[]>();
function recordOutcome(provider: string, ok: boolean) {
  const list = recentOutcomes.get(provider) ?? [];
  list.push(ok);
  if (list.length > 10) list.shift();
  recentOutcomes.set(provider, list);
}
const isUnhealthy = (provider: string) => {
  const list = recentOutcomes.get(provider) ?? [];
  return list.length >= 5 && list.filter(Boolean).length / list.length < 0.5;
};

// Lovable AI: optional, kill-switched, and capped by this month's metered spend.
const lovableEvery = () => {
  const n = Math.floor(Number(process.env["LOVABLE_AI_EVERY"]));
  return Number.isFinite(n) && n > 0 ? n : 5;
};
const lovableCapUsd = () => {
  const v = process.env["LOVABLE_AI_MONTHLY_USD_CAP"];
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : 1;
};
let lovableSpend: { at: number; month: string; usd: number } | null = null;
async function lovableMonthSpendUsd(): Promise<number> {
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
  if (lovableSpend && lovableSpend.month === month && Date.now() - lovableSpend.at < 5 * 60_000)
    return lovableSpend.usd;
  let usd = lovableSpend?.month === month ? lovableSpend.usd : 0;
  try {
    const { admin } = await import("./db.server");
    const db = await admin();
    const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const { data, error } = await db
      .from("usage_meter")
      .select("estimated_cost_usd")
      .eq("event_type", "ai_model_call")
      .eq("provider", "lovable")
      .gte("created_at", since)
      .limit(20000);
    if (!error) usd = (data ?? []).reduce((sum, r) => sum + Number(r.estimated_cost_usd ?? 0), 0);
  } catch {
    /* keep the last known value; never throw */
  }
  lovableSpend = { at: Date.now(), month, usd };
  return usd;
}
/** Drops lovable models when disabled, or when this month's estimated spend has reached the cap. */
async function applyLovablePolicy(models: string[]): Promise<string[]> {
  if (!models.some((m) => resolveModel(m).provider === "lovable")) return models;
  const allowed =
    process.env["LOVABLE_AI_ENABLED"] !== "false" &&
    (await lovableMonthSpendUsd()) < lovableCapUsd();
  return allowed ? models : models.filter((m) => resolveModel(m).provider !== "lovable");
}

/**
 * Stateless per-minute rotation by provider. Leader pool: free-tier providers,
 * OpenRouter ":free" models and (on its share slot only) lovable. Paid models and
 * gemini never lead and keep their route order as the tail. MODEL_ROTATION=off
 * restores the plain route order.
 */
export function rotateRoute(models: string[], now = Date.now()): string[] {
  if (process.env["MODEL_ROTATION"] === "off") return models;
  const slot = Math.floor(now / 60_000);
  const lovableLeads = slot % lovableEvery() === 0;
  const isPool = (m: string) => {
    const p = resolveModel(m).provider;
    return FREE_TIER_PROVIDERS.has(p) || m.endsWith(":free") || p === "lovable";
  };
  const groupKey = (m: string) => {
    const p = resolveModel(m).provider;
    return p === "openrouter" ? "openrouter:free" : p;
  };
  const groups = new Map<string, string[]>();
  for (const m of models.filter(isPool)) {
    const k = groupKey(m);
    groups.set(k, [...(groups.get(k) ?? []), m]);
  }
  const providers = [...groups.keys()].filter((p) => p !== "lovable" || lovableLeads);
  const lovableTail = lovableLeads ? [] : (groups.get("lovable") ?? []);
  let order: string[] = [];
  if (providers.length) {
    const start = slot % providers.length;
    const rotated = [...providers.slice(start), ...providers.slice(0, start)];
    // Health tiebreak: a would-be leader with <50% success over >=5 recent samples yields the lead.
    const healthyIdx = rotated.findIndex(
      (p) => !isUnhealthy(p === "openrouter:free" ? "openrouter" : p),
    );
    if (healthyIdx > 0) {
      const [lead] = rotated.splice(healthyIdx, 1);
      rotated.unshift(lead!);
    }
    order = rotated.flatMap((p) => groups.get(p) ?? []);
  }
  return [...order, ...lovableTail, ...models.filter((m) => !isPool(m))];
}
/** Full ordering pipeline used by runRoute() and synthesize(). */
async function orderedRoute(name: "triage" | "evaluation"): Promise<string[]> {
  return rotateRoute(routable(await applyLovablePolicy(getRoute(name).filter(hasKey))));
}

// In-memory routing summary (per provider + model route) for diagnostics; the
// durable record is the ai_model_call rows meter() writes to usage_meter.
type RouteStat = { attempts: number; successes: number; totalLatencyMs: number };
const routeStats = new Map<string, RouteStat>();
function recordStat(provider: string, modelRoute: string, latencyMs: number, success: boolean) {
  const key = `${provider}|${modelRoute}`;
  const s = routeStats.get(key) ?? { attempts: 0, successes: 0, totalLatencyMs: 0 };
  s.attempts += 1;
  s.totalLatencyMs += latencyMs;
  if (success) s.successes += 1;
  routeStats.set(key, s);
  maybeLogSummary();
}
/** Aggregated routing outcomes: provider, model_route, attempts, success rate, average latency. */
export function modelRoutingSummary() {
  return [...routeStats.entries()]
    .map(([key, s]) => {
      const [provider, model_route] = key.split("|");
      return {
        provider,
        model_route,
        attempts: s.attempts,
        successes: s.successes,
        avg_latency_ms: Math.round(s.totalLatencyMs / s.attempts),
      };
    })
    .sort((a, b) => b.attempts - a.attempts);
}
/** Test hook: clears in-memory cooldown and summary state. */
export function resetModelRoutingState() {
  cooldownUntil.clear();
  softFailures.clear();
  recentOutcomes.clear();
  routeStats.clear();
  summaryLoggedAt = 0;
  lovableSpend = null;
}

// Logged summary of the durable ai_model_call metering rows (usage_meter), to
// inform route reordering. Never throws; diagnostics must not break model calls.
let summaryLoggedAt = 0;
export async function logModelCallSummary(hours = 24): Promise<
  {
    provider: string;
    model_route: string;
    calls: number;
    successes: number;
    avg_latency_ms: number;
  }[]
> {
  try {
    const { admin } = await import("./db.server");
    const db = await admin();
    const since = new Date(Date.now() - hours * 3600_000).toISOString();
    const { data, error } = await db
      .from("usage_meter")
      .select("provider, model_route, latency_ms, success")
      .eq("event_type", "ai_model_call")
      .gte("created_at", since)
      .limit(5000);
    if (error) return [];
    const agg = new Map<
      string,
      { provider: string; model_route: string; calls: number; successes: number; latency: number }
    >();
    for (const r of data ?? []) {
      const key = `${r.provider ?? "?"}|${r.model_route ?? "?"}`;
      const a = agg.get(key) ?? {
        provider: r.provider ?? "?",
        model_route: r.model_route ?? "?",
        calls: 0,
        successes: 0,
        latency: 0,
      };
      a.calls += 1;
      if (r.success) a.successes += 1;
      a.latency += r.latency_ms ?? 0;
      agg.set(key, a);
    }
    const rows = [...agg.values()]
      .map((a) => ({
        provider: a.provider,
        model_route: a.model_route,
        calls: a.calls,
        successes: a.successes,
        avg_latency_ms: a.calls ? Math.round(a.latency / a.calls) : 0,
      }))
      .sort((x, y) => y.calls - x.calls);
    console.info("ai_model_call summary (last 24h)", JSON.stringify(rows));
    return rows;
  } catch {
    return [];
  }
}
/** Fire-and-forget: logs the metering summary at most once every 50 recorded calls. */
function maybeLogSummary() {
  const calls = [...routeStats.values()].reduce((s, r) => s + r.attempts, 0);
  if (calls > 0 && calls % 50 === 0 && summaryLoggedAt !== calls) {
    summaryLoggedAt = calls;
    void logModelCallSummary();
  }
}
const timeoutMs = () => {
  const n = Number(process.env["MODEL_TIMEOUT_MS"]);
  return Number.isFinite(n) && n > 0 ? n : 45000;
};

/** JSON mode providers require the word "json" somewhere in the messages. */
export const withJsonWord = (system: string, user: string) =>
  /json/i.test(system + user) ? system : `${system}\n\nRespond with a single valid JSON object.`;

export type CallMeta = {
  userId?: string | null;
  guestFingerprint?: string;
  reportId?: string;
  purpose?: string;
};

// Internal error codes — never shown to users; callers map them to friendly notices.
export async function callEngine(
  model: string,
  system: string,
  user: string,
  meta?: CallMeta,
  maxTokens = 3500,
): Promise<string> {
  const { provider, model: providerModel } = resolveModel(model);
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new Error("engine-missing");
  const key = process.env[cfg.keyEnv];
  if (!key) throw new Error("engine-missing");
  const t0 = Date.now();
  const estimate = (outLen: number) => {
    const r =
      RATES[model] ??
      (FREE_TIER_PROVIDERS.has(provider) || model.endsWith(":free") ? FREE : FALLBACK_RATES);
    return (((system.length + user.length) / 4) * r.in + (outLen / 4) * r.out) / 1e6;
  };
  // JSON mode (e.g. Groq) rejects requests whose messages never mention "json" with HTTP 400.
  const sys = cfg.json ? withJsonWord(system, user) : system;
  // Groq's on-demand TPM limit counts input plus requested output, not just output.
  const outputTokens =
    provider === "groq"
      ? Math.min(maxTokens, Math.max(512, 7500 - Math.ceil((sys.length + user.length) / 3)))
      : maxTokens;
  // Reasoning models (gpt-5-nano) reject non-default temperature and max_tokens.
  const reasoning = provider === "lovable" && providerModel.startsWith("openai/gpt-5");
  const sampling = reasoning
    ? { max_completion_tokens: outputTokens }
    : { temperature: 0.2, max_tokens: outputTokens };
  let classified = false;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs()),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(provider === "lovable" ? { "X-Lovable-AIG-SDK": "fetch" } : {}),
        ...(provider === "openrouter"
          ? { "HTTP-Referer": "https://verfiai.app", "X-Title": "Verfiai" }
          : {}),
      },
      body: JSON.stringify({
        model: providerModel,
        ...sampling,
        ...(cfg.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      // Provider bodies can contain account identifiers or credential-bearing links.
      // Status plus provider/model is sufficient for diagnostics; never log the body.
      console.error("model provider", provider, providerModel, res.status);
      if (isHardStatus(res.status)) coolProvider(provider);
      else softFailure(provider);
      classified = true;
      throw new Error(
        res.status === 402
          ? "credits"
          : res.status === 429
            ? "rate-limited"
            : res.status === 503
              ? "unavailable"
              : "engine",
      );
    }
    let json: { choices?: { message?: { content?: string } }[] };
    try {
      json = (await res.json()) as typeof json;
    } catch {
      softFailure(provider);
      classified = true;
      throw new Error("engine-empty");
    }
    const txt0 = (json.choices?.[0]?.message?.content ?? "")
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim()
      .replace(/^```(?:json)?\s*|\s*```$/g, "");
    const txt = txt0.trim();
    if (!txt) {
      softFailure(provider);
      classified = true;
      throw new Error("engine-empty");
    }
    softFailures.delete(provider);
    recordOutcome(provider, true);
    recordStat(provider, model, Date.now() - t0, true);
    void meter({
      userId: meta?.userId ?? null,
      ...(meta?.guestFingerprint ? { guestFingerprint: meta.guestFingerprint } : {}),
      event: "ai_model_call",
      provider,
      modelRoute: model,
      latencyMs: Date.now() - t0,
      success: true,
      estimatedCostUsd: estimate(txt.length),
    });
    return txt;
  } catch (e) {
    if (!(e instanceof Error && e.message === "engine-missing")) {
      // Network errors, timeouts and aborts cool the provider immediately.
      if (!classified) coolProvider(provider);
      recordOutcome(provider, false);
      recordStat(provider, model, Date.now() - t0, false);
      void meter({
        userId: meta?.userId ?? null,
        ...(meta?.guestFingerprint ? { guestFingerprint: meta.guestFingerprint } : {}),
        event: "ai_model_call",
        provider,
        modelRoute: model,
        latencyMs: Date.now() - t0,
        success: false,
        estimatedCostUsd: estimate(0),
      });
    }
    throw e;
  }
}

/** Fails over across the route's models without exposing provider errors to users. */
export async function runRoute(
  name: "triage" | "evaluation",
  system: string,
  user: string,
  meta?: CallMeta,
): Promise<string> {
  const models = await orderedRoute(name);
  let lastErr: unknown;
  for (const m of models) {
    try {
      return await callEngine(m, system, user, meta, name === "triage" ? 2500 : 3500);
    } catch (e) {
      lastErr = e; /* try the next model; details stay in server logs */
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("engine");
}

/** Synthesis route with engine labels (used by report generation). */
export async function synthesize(
  system: string,
  user: string,
  meta?: CallMeta,
  validate?: (raw: string) => boolean,
): Promise<{ raw: string; engine: string }> {
  for (const m of await orderedRoute("evaluation")) {
    try {
      const raw = await callEngine(m, system, user, meta);
      if (validate && !validate(raw)) {
        softFailure(resolveModel(m).provider);
        continue;
      }
      return { raw, engine: LABELS[m] ?? m };
    } catch {
      /* try the next engine */
    }
  }
  throw new Error(
    "The report could not be generated right now. Please try again in a few minutes.",
  );
}
