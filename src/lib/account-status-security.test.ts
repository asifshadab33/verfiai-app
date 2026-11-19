import { readFileSync } from "node:fs";
import postgres from "postgres";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../drizzle/migrations/0018_scope_account_status_helpers.sql", import.meta.url),
  "utf8",
);

describe("account-status helper security", () => {
  for (const [name, signature, identity] of [
    ["has_active_subscription", "uuid, text", "user_uuid"],
    ["has_role", "uuid, public.app_role", "_user_id"],
  ]) {
    it(`${name} denies public execution and preserves authenticated and service callers`, () => {
      expect(migration).toContain(`REVOKE ALL ON FUNCTION public.${name}(${signature}) FROM PUBLIC, anon;`);
      expect(migration).toContain(`GRANT EXECUTE ON FUNCTION public.${name}(${signature}) TO authenticated, service_role;`);
    });

    it(`${name} checks caller ownership before reading private membership`, () => {
      const definition = migration.split(`CREATE OR REPLACE FUNCTION public.${name}(`)[1];
      if (definition === undefined) throw new Error(`Missing function definition: ${name}`);
      const body = definition.split("$function$;")[0];
      expect(body).toContain("STABLE SECURITY DEFINER\nSET search_path = public");
      expect(body).toContain(`WHEN auth.role() = 'service_role' OR (auth.uid() IS NOT NULL AND auth.uid() = ${identity})`);
      expect(body).toMatch(/THEN EXISTS \([\s\S]*\)\s+ELSE false\s+END/);
    });
  }

  it("retains existing subscription eligibility and role matching", () => {
    expect(migration).toContain("environment = check_env");
    expect(migration).toContain("product_id = 'pro_plan'");
    expect(migration).toContain("status IN ('active', 'trialing', 'past_due', 'canceled')");
    expect(migration).toContain("(status <> 'canceled' OR current_period_end > now())");
    expect(migration).toContain("(current_period_end IS NULL OR current_period_end > now())");
    expect(migration).toContain("WHERE user_id = _user_id AND role = _role");
  });
});

// This connection must point to an empty disposable database, never Lovable Cloud.
const connection = process.env["ACCOUNT_STATUS_QA_DATABASE_URL"];
describe.skipIf(!connection)("account-status permissions against PostgreSQL", () => {
  const owner = "00000000-0000-4000-8000-000000000001";
  const other = "00000000-0000-4000-8000-000000000002";

  async function check(call: string) {
    if (!connection) throw new Error("Disposable database required");
    const sql = postgres(connection, { max: 1 });
    try {
      await sql.begin(async (tx) => {
        await tx.unsafe(`
          CREATE ROLE anon;
          CREATE ROLE authenticated;
          CREATE ROLE service_role;
          CREATE SCHEMA auth;
          CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
            $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
          CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS
            $$ SELECT nullif(current_setting('request.jwt.claim.role', true), '') $$;
          GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
          CREATE TYPE public.app_role AS ENUM ('admin', 'user');
          CREATE TABLE public.user_roles(user_id uuid, role public.app_role);
          CREATE TABLE public.subscriptions(
            user_id uuid, environment text, product_id text, status text,
            current_period_end timestamptz
          );
          INSERT INTO public.user_roles VALUES ('${owner}', 'admin');
          INSERT INTO public.subscriptions VALUES
            ('${owner}', 'live', 'pro_plan', 'active', now() + interval '1 day');
        `);
        await tx.unsafe(migration);
        async function invoke(role: string, subject: string) {
          await tx`select set_config('request.jwt.claim.role', ${role}, true),
            set_config('request.jwt.claim.sub', ${subject}, true)`;
          await tx.unsafe(`SET LOCAL ROLE ${role}`);
          try {
            return (await tx.unsafe(`SELECT ${call} AS allowed`))[0]?.["allowed"];
          } finally {
            await tx.unsafe("RESET ROLE");
          }
        }

        // Positive fixtures ensure a broken guard would expose real membership.
        expect(await invoke("authenticated", owner)).toBe(true);
        expect(await invoke("authenticated", other)).toBe(false);
        expect(await invoke("authenticated", "")).toBe(false);
        expect(await invoke("service_role", "")).toBe(true);
        await tx`select set_config('request.jwt.claim.role', 'anon', true),
          set_config('request.jwt.claim.sub', ${owner}, true)`;
        await tx.unsafe("SET LOCAL ROLE anon");
        await expect(tx.savepoint((sp) => sp.unsafe(`SELECT ${call}`)))
          .rejects.toMatchObject({ code: "42501" });
        await tx.unsafe("RESET ROLE");
        await tx`select set_config('request.jwt.claim.role', 'authenticated', true),
          set_config('request.jwt.claim.sub', ${other}, true)`;
        await tx.unsafe("SET LOCAL ROLE authenticated");
        await expect(tx.savepoint((sp) => sp`select * from public.user_roles`))
          .rejects.toMatchObject({ code: "42501" });
        await expect(tx.savepoint((sp) => sp`select * from public.subscriptions`))
          .rejects.toMatchObject({ code: "42501" });
        await tx.unsafe("RESET ROLE");
        // Roll back schemas, roles and synthetic membership after every test.
        throw new Error("ROLLBACK_ACCOUNT_STATUS_FIXTURES");
      });
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "ROLLBACK_ACCOUNT_STATUS_FIXTURES")
        throw error;
    } finally {
      await sql.end();
    }
  }

  it("subscription fix denies anonymous and cross-account enumeration while preserving owner and service access", () =>
    check(`public.has_active_subscription('${owner}'::uuid, 'live')`));

  it("role fix denies anonymous and cross-account enumeration while preserving owner and service access", () =>
    check(`public.has_role('${owner}'::uuid, 'admin'::public.app_role)`));
});