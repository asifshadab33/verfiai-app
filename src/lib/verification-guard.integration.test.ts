import { createClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "crypto";
import { describe, expect, it } from "vitest";

// Opt-in real database checks. Keys remain in environment and are never printed.
const url = process.env["SUPABASE_URL"];
const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
describe.skipIf(!url || !key)("atomic verification guardrails", () => {
  function db() {
    if (!url || !key) throw new Error("Server test access unavailable");
    return createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
  }
  const hash = () => createHash("sha256").update(`day3-test:${randomUUID()}`).digest("hex");
  it("atomically accepts only five concurrent guest requests and resets after one hour", async () => {
    const client = db(),
      subject = hash();
    try {
      const responses = await Promise.all(
        Array.from({ length: 8 }, () =>
          client.rpc("reserve_verification_request", {
            p_subject_hash: subject,
            p_authenticated: false,
          }),
        ),
      );
      expect(responses.every((r) => !r.error)).toBe(true);
      expect(responses.filter((r) => r.data?.[0]?.allowed).length).toBe(5);
      const row = await client
        .from("verification_rate_limits")
        .select("window_start, attempts")
        .eq("subject_hash", subject)
        .single();
      expect(row.data?.attempts).toBe(5);
      expect(
        Date.parse(responses[0]?.data?.[0]?.resets_at ?? "") -
          Date.parse(row.data?.window_start ?? ""),
      ).toBe(3600000);
      await client
        .from("verification_rate_limits")
        .update({ window_start: new Date(Date.now() - 3600001).toISOString() })
        .eq("subject_hash", subject);
      const reset = await client.rpc("reserve_verification_request", {
        p_subject_hash: subject,
        p_authenticated: false,
      });
      expect(reset.data?.[0]?.remaining).toBe(4);
    } finally {
      await client.from("verification_rate_limits").delete().eq("subject_hash", subject);
    }
  }, 30000);
  it("atomically accepts only twenty signed-in requests with a one-day reset", async () => {
    const client = db(),
      subject = hash();
    try {
      const responses = await Promise.all(
        Array.from({ length: 23 }, () =>
          client.rpc("reserve_verification_request", {
            p_subject_hash: subject,
            p_authenticated: true,
          }),
        ),
      );
      expect(responses.every((r) => !r.error)).toBe(true);
      expect(responses.filter((r) => r.data?.[0]?.allowed).length).toBe(20);
      const row = await client
        .from("verification_rate_limits")
        .select("window_start, attempts")
        .eq("subject_hash", subject)
        .single();
      expect(row.data?.attempts).toBe(20);
      expect(
        Date.parse(responses[0]?.data?.[0]?.resets_at ?? "") -
          Date.parse(row.data?.window_start ?? ""),
      ).toBe(86400000);
    } finally {
      await client.from("verification_rate_limits").delete().eq("subject_hash", subject);
    }
  }, 30000);
});
