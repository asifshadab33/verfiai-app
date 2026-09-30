import { Environment, Paddle } from "@paddle/paddle-node-sdk";

export type PaddleEnv = "sandbox" | "live";
const BASE = "https://connector-gateway.lovable.dev/paddle";

function secret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function connectionKey(env: PaddleEnv) {
  return secret(env === "sandbox" ? "PADDLE_SANDBOX_API_KEY" : "PADDLE_LIVE_API_KEY");
}

export function getPaddleClient(env: PaddleEnv) {
  const key = connectionKey(env);
  return new Paddle(key, {
    environment: BASE as Environment,
    customHeaders: { "X-Connection-Api-Key": key, "Lovable-API-Key": secret("LOVABLE_API_KEY") },
  });
}

export async function gatewayFetch(env: PaddleEnv, path: string) {
  return fetch(`${BASE}${path}`, { headers: {
    "X-Connection-Api-Key": connectionKey(env), "Lovable-API-Key": secret("LOVABLE_API_KEY"),
  } });
}

export async function verifyWebhook(request: Request, env: PaddleEnv) {
  const signature = request.headers.get("paddle-signature");
  const body = await request.text();
  if (!signature || !body) throw new Error("Missing webhook signature or body");
  const secretName = env === "sandbox" ? "PAYMENTS_SANDBOX_WEBHOOK_SECRET" : "PAYMENTS_LIVE_WEBHOOK_SECRET";
  return await getPaddleClient(env).webhooks.unmarshal(body, secret(secretName), signature);
}