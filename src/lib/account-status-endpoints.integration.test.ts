import { spawn, type ChildProcess } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Both settings must identify disposable local infrastructure, never Lovable Cloud.
// Run alongside account-status-security.test.ts using a DIFFERENT empty database.
const connection = process.env["ACCOUNT_ENDPOINT_QA_DATABASE_URL"];
const binary = process.env["ACCOUNT_ENDPOINT_QA_POSTGREST_BINARY"];
const migration = readFileSync(
  new URL("../../drizzle/migrations/0018_scope_account_status_helpers.sql", import.meta.url),
  "utf8",
);

describe.skipIf(!connection || !binary)("authenticated account-status HTTP endpoints", () => {
  const owner = "00000000-0000-4000-8000-000000000001";
  const other = "00000000-0000-4000-8000-000000000002";
  const secret = randomBytes(48).toString("hex");
  let api: ChildProcess | undefined;
  let origin = "";

  function bearer(subject: string) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const claims = Buffer.from(JSON.stringify({
      role: "authenticated", sub: subject, exp: Math.floor(Date.now() / 1000) + 300,
    })).toString("base64url");
    const payload = `${header}.${claims}`;
    return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
  }

  beforeAll(async () => {
    if (!connection || !binary) throw new Error("Disposable database and PostgREST binary required");
    const sql = postgres(connection, { max: 1 });
    try {
      // Fail closed rather than overwrite a populated database or existing role setup.
      const existing = await sql`select tablename from pg_tables where schemaname = 'public'`;
      if (existing.length) throw new Error("Endpoint QA requires an empty disposable database");
      await sql.unsafe(`
        CREATE ROLE anon NOLOGIN;
        CREATE ROLE authenticated NOLOGIN;
        CREATE ROLE service_role NOLOGIN;
        CREATE ROLE endpoint_authenticator LOGIN NOINHERIT;
        GRANT anon, authenticated TO endpoint_authenticator;
        CREATE SCHEMA auth;
        CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
          $$ SELECT nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub', '')::uuid $$;
        CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS
          $$ SELECT current_setting('request.jwt.claims', true)::jsonb->>'role' $$;
        GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
        CREATE TABLE public.user_roles(user_id uuid, role public.app_role);
        CREATE TABLE public.subscriptions(
          user_id uuid, environment text, product_id text, status text,
          current_period_end timestamptz
        );
        INSERT INTO public.user_roles VALUES ('${owner}', 'admin'), ('${other}', 'user');
        INSERT INTO public.subscriptions VALUES
          ('${owner}', 'live', 'pro_plan', 'active', now() + interval '1 day');
      `);
      await sql.unsafe(migration);
    } finally {
      await sql.end();
    }
    const socket = createServer();
    await new Promise<void>((resolve) => socket.listen(0, "127.0.0.1", resolve));
    const address = socket.address();
    if (!address || typeof address === "string") throw new Error("No test port available");
    const port = address.port;
    await new Promise<void>((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()));
    origin = `http://127.0.0.1:${port}`;
    const apiConnection = new URL(connection);
    apiConnection.username = "endpoint_authenticator";
    apiConnection.password = "";
    apiConnection.searchParams.set("sslmode", "disable");
    api = spawn(binary, [], {
      stdio: "ignore",
      env: {
        ...process.env,
        PGRST_DB_URI: apiConnection.toString(),
        PGRST_DB_SCHEMAS: "public",
        PGRST_DB_ANON_ROLE: "anon",
        PGRST_DB_PRE_CONFIG: "",
        PGRST_DB_POOL: "1",
        PGRST_DB_POOL_TIMEOUT: "2",
        PGRST_DB_CHANNEL_ENABLED: "false",
        PGRST_JWT_SECRET: secret,
        PGRST_SERVER_HOST: "127.0.0.1",
        PGRST_SERVER_PORT: String(port),
      },
    });
    // PostgREST authenticates each signed JWT then SET ROLE authenticated, just as
    // the hosted Data API does; no mocked auth, fetch, RPC, or database guard.
    for (let attempt = 0; attempt < 100; attempt++) {
      if (api.exitCode !== null) throw new Error("Local endpoint server exited during startup");
      try {
        if ((await fetch(origin)).ok) return;
      } catch { /* Wait for the local socket to open. */ }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error("Local endpoint server did not become ready");
  }, 15000);

  afterAll(async () => {
    const child = api;
    if (!child || child.exitCode !== null) return;
    await new Promise<void>((resolve) => {
      child.once("exit", () => resolve());
      child.kill("SIGTERM");
    });
  });

  async function rpc(name: string, subject: string, args: Record<string, string>, method: "GET" | "POST") {
    const url = new URL(`/rpc/${name}`, origin);
    if (method === "GET") url.search = new URLSearchParams(args).toString();
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${bearer(subject)}`, "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify(args) } : {}),
    });
    expect(response.status).toBe(200);
    return response.json();
  }

  for (const method of ["GET", "POST"] as const) {
    it(`${method} subscription endpoint permits owners and denies non-owner membership disclosure`, async () => {
      const args = { user_uuid: owner, check_env: "live" };
      expect(await rpc("has_active_subscription", owner, args, method)).toBe(true);
      // Denial is deliberately false, not HTTP 403, to avoid membership disclosure.
      expect(await rpc("has_active_subscription", other, args, method)).toBe(false);
      expect(await rpc("has_active_subscription", other, { ...args, user_uuid: other }, method)).toBe(false);
      expect(await rpc("has_active_subscription", owner, { ...args, check_env: "sandbox" }, method)).toBe(false);
    });

    it(`${method} role endpoint permits own roles and denies non-owner role disclosure`, async () => {
      expect(await rpc("has_role", owner, { _user_id: owner, _role: "admin" }, method)).toBe(true);
      expect(await rpc("has_role", other, { _user_id: owner, _role: "admin" }, method)).toBe(false);
      expect(await rpc("has_role", other, { _user_id: other, _role: "user" }, method)).toBe(true);
      expect(await rpc("has_role", owner, { _user_id: other, _role: "user" }, method)).toBe(false);
      expect(await rpc("has_role", other, { _user_id: other, _role: "admin" }, method)).toBe(false);
    });
  }
});