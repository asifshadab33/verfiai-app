import { describe, expect, it, vi } from "vitest";
import { readAccountStatus } from "./account-status";

describe("owner dashboard account status", () => {
  it("reads subscription and all roles only for the authenticated owner", async () => {
    const rpc = vi.fn().mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    expect(await readAccountStatus({ rpc }, "verified-owner", "live"))
      .toEqual({ activeSubscription: true, roles: ["admin", "user"] });
    expect(rpc.mock.calls).toEqual([
      ["has_active_subscription", { user_uuid: "verified-owner", check_env: "live" }],
      ["has_role", { _user_id: "verified-owner", _role: "admin" }],
      ["has_role", { _user_id: "verified-owner", _role: "moderator" }],
      ["has_role", { _user_id: "verified-owner", _role: "user" }],
    ]);
  });
  it("does not invent subscription or roles when every endpoint returns false", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null });
    expect(await readAccountStatus({ rpc }, "owner", "sandbox"))
      .toEqual({ activeSubscription: false, roles: [] });
  });
  it.each([0, 1, 2, 3])("rejects partial results when endpoint %i fails", async (failed) => {
    let index = 0;
    const rpc = vi.fn().mockImplementation(async () => index++ === failed
      ? { data: null, error: new Error("permission denied") }
      : { data: true, error: null });
    await expect(readAccountStatus({ rpc }, "owner", "live")).rejects.toThrow("could not load");
  });
  it("rejects missing endpoint data rather than presenting it as no membership", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    await expect(readAccountStatus({ rpc }, "owner", "live")).rejects.toThrow("could not load");
  });
});