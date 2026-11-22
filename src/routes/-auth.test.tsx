// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, Suspense } from "react";

const mocks = vi.hoisted(() => ({
  oauth: vi.fn(), navigate: vi.fn(), signUp: vi.fn(),
  authState: { user: null as { id: string } | null, loading: false },
}));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  createFileRoute: () => (options: { component: () => React.ReactNode }) => options,
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
  useNavigate: () => mocks.navigate,
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => mocks.authState }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { signUp: mocks.signUp } } }));
vi.mock("@/integrations/lovable/index", () => ({ lovable: { auth: { signInWithOAuth: mocks.oauth } } }));

import { Route } from "./auth";
import { AuthPage } from "@/components/verifai/AuthPage";

async function mountAuth() {
  const Page = (Route as unknown as { component: (() => React.ReactNode) & { preload?: () => Promise<void> } }).component;
  await Page.preload?.();
  await act(async () => { render(<Suspense fallback={null}><Page /></Suspense>); });
}

describe("managed social sign-in", () => {
  beforeEach(() => {
    mocks.oauth.mockReset(); mocks.navigate.mockReset(); mocks.signUp.mockReset();
    mocks.authState.user = null; mocks.authState.loading = false;
  });
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

  it("waits for callback session hydration before replacing auth with the dashboard", async () => {
    mocks.authState.loading = true;
    const view = render(<AuthPage />);
    expect(mocks.navigate).not.toHaveBeenCalled();
    mocks.authState.user = { id: "new-account" };
    view.rerender(<AuthPage />);
    expect(mocks.navigate).not.toHaveBeenCalled();
    mocks.authState.loading = false;
    view.rerender(<AuthPage />);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith({ to: "/dashboard", replace: true }));
  });

  it.each(["Microsoft", "Lovable"])("lands a new %s popup account on the dashboard only after session confirmation", async (name) => {
    const view = render(<AuthPage initialMode="up" />);
    mocks.oauth.mockResolvedValue({ redirected: false, error: null });
    fireEvent.click(screen.getByRole("button", { name: `Continue with ${name}` }));
    await waitFor(() => expect(mocks.oauth).toHaveBeenCalledOnce());
    expect(mocks.navigate).not.toHaveBeenCalled();
    mocks.authState.user = { id: "new-account" };
    view.rerender(<AuthPage initialMode="up" />);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith({ to: "/dashboard", replace: true }));
  });

  it("creates an email account with a public confirmation callback without treating signup as a session", async () => {
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
    render(<AuthPage initialMode="up" />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new-member@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-only-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(mocks.signUp).toHaveBeenCalledExactlyOnceWith({
      email: "new-member@example.com", password: "test-only-password",
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    }));
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when email signup fails", async () => {
    mocks.signUp.mockResolvedValue({ error: new Error("Signup unavailable") });
    render(<AuthPage initialMode="up" />);
    fireEvent.submit(screen.getByRole("button", { name: "Create account" }).closest("form") as HTMLFormElement);
    await screen.findByRole("alert");
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});