import { readFileSync } from "node:fs";
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