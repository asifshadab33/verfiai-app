// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, Suspense } from "react";

const mocks = vi.hoisted(() => ({ oauth: vi.fn(), navigate: vi.fn() }));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  createFileRoute: () => (options: { component: () => React.ReactNode }) => options,
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
  useNavigate: () => mocks.navigate,
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {} } }));
vi.mock("@/integrations/lovable/index", () => ({ lovable: { auth: { signInWithOAuth: mocks.oauth } } }));

import { Route } from "./auth";

async function mountAuth() {
  const Page = (Route as unknown as { component: (() => React.ReactNode) & { preload?: () => Promise<void> } }).component;
  await Page.preload?.();
  await act(async () => { render(<Suspense fallback={null}><Page /></Suspense>); });
}

describe("managed social sign-in", () => {
  beforeEach(() => { mocks.oauth.mockReset(); mocks.navigate.mockReset(); });
  afterEach(cleanup);

  it.each(["Microsoft", "Lovable", "Google"])("dispatches %s with a same-origin public callback", async (name) => {
    mocks.oauth.mockResolvedValue({ redirected: true });
    await mountAuth();
    fireEvent.click(await screen.findByRole("button", { name: `Continue with ${name}` }));
    await waitFor(() => expect(mocks.oauth).toHaveBeenCalledExactlyOnceWith(name.toLowerCase(), {
      redirect_uri: `${window.location.origin}/auth`,
    }));
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it.each(["Microsoft", "Lovable"])("recovers from a %s provider failure", async (name) => {
    mocks.oauth.mockRejectedValue(new Error("provider unavailable"));
    await mountAuth();
    fireEvent.click(await screen.findByRole("button", { name: `Continue with ${name}` }));
    await screen.findByRole("alert");
    expect((screen.getByRole("button", { name: `Continue with ${name}` }) as HTMLButtonElement).disabled).toBe(false);
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});