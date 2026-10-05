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
  "deepseek/deepseek-chat": "DeepSeek V3",
  "qwen/qwen-2.5-72b-instruct": "Qwen 2.5 72B",
};

/** Route tables; overridable server-side via env (comma-separated model ids). */
export function getRoute(name: "triage" | "evaluation"): string[] {
  const envKey = name === "triage" ? "MODEL_ROUTE_TRIAGE" : "MODEL_ROUTE_EVALUATION";
  const dflt = name === "triage" ? "qwen/qwen-2.5-72b-instruct" : "deepseek/deepseek-chat,qwen/qwen-2.5-72b-instruct";
  const list = (process.env[envKey] ?? dflt).split(",").map(s => s.trim()).filter(Boolean);
  return list.length ? list : ["qwen/qwen-2.5-72b-instruct"];
}

export type CallMeta = { userId?: string | null; guestFingerprint?: string; reportId?: string; purpose?: string };

// Internal error codes — never shown to users; callers map them to friendly notices.
export async function callEngine(model: string, system: string, user: string, meta?: CallMeta): Promise<string> {
  const key = process.env["OPENROUTER_API_KEY"];
  if (!key) throw new Error("engine-missing");
  const t0 = Date.now();
  const estimate = (outLen: number) => {
    const r = RATES[model] ?? FALLBACK_RATES;
    return ((system.length + user.length) / 4 * r.in + outLen / 4 * r.out) / 1e6;
  };
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "HTTP-Referer": "https://verfiai.app", "X-Title": "Verfiai" },
      body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    if (!res.ok) { console.error("OpenRouter", model, res.status, (await res.text()).slice(0, 300)); throw new Error(res.status === 402 ? "credits" : "engine"); }
    const json = await res.json() as { choices?: { message?: { content?: string } }[] };
    const txt = (json.choices?.[0]?.message?.content ?? "").replace(/^```(?:json)?\s*|\s*```$/g, "");
    void meter({ userId: meta?.userId ?? null, guestFingerprint: meta?.guestFingerprint, event: "ai_model_call", provider: "openrouter", modelRoute: model, latencyMs: Date.now() - t0, success: true, estimatedCostUsd: estimate(txt.length) });
    return txt;
  } catch (e) {
    if (!(e instanceof Error && e.message === "engine-missing"))
      void meter({ userId: meta?.userId ?? null, guestFingerprint: meta?.guestFingerprint, event: "ai_model_call", provider: "openrouter", modelRoute: model, latencyMs: Date.now() - t0, success: false, estimatedCostUsd: estimate(0) });
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
