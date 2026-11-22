import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileCheck2, Grid2X2, LoaderCircle } from "lucide-react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export function AuthPage({ initialMode = "in" }: { initialMode?: "in" | "up" }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"in" | "up" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "microsoft" | "lovable" | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  async function socialSignIn(provider: "google" | "microsoft" | "lovable") {
    if (oauthBusy || busy) return;
    setErr("");
    setMsg("");
    setOauthBusy(provider);
    const name = { google: "Google", microsoft: "Microsoft", lovable: "Lovable" }[provider];
    try {
      const r = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + "/auth",
      });
      if (r.error) setErr(`${name} sign-in didn't complete. Please try again.`);
      if (r.redirected) return;
    } catch {
      setErr(`${name} sign-in didn't complete. Please try again.`);
    } finally {
      setOauthBusy(null);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        setMsg("Check your email to confirm your account, then sign in.");
      } else if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setMsg("If that email has an account, a reset link is on its way.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-dvh items-center justify-center bg-secondary/40 px-5 py-12"
    >
      <div className="w-full max-w-sm border border-border bg-card p-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileCheck2 className="size-5" />
          </span>
          Verfiai
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold">
          {mode === "up"
            ? "Create your account"
            : mode === "reset"
              ? "Reset password"
              : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "up" ? "Create an account with email, Microsoft or Lovable. Microsoft and Lovable can create your account on your first sign-in." : "Sign in to generate reports and keep them in your library."}
        </p>
        {mode !== "reset" && (
          <>
            <div className="mt-6 space-y-3">
              <Button type="button" variant="outline" className="w-full" disabled={busy || oauthBusy !== null} onClick={() => socialSignIn("google")}>
                {oauthBusy === "google" && <LoaderCircle aria-hidden="true" className="animate-spin" />}
                Continue with Google
              </Button>
              <Button type="button" variant="outline" className="w-full" disabled={busy || oauthBusy !== null} onClick={() => socialSignIn("microsoft")}>
                {oauthBusy === "microsoft" ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Grid2X2 aria-hidden="true" />}
                Continue with Microsoft
              </Button>
              <Button type="button" variant="outline" className="w-full" disabled={busy || oauthBusy !== null} onClick={() => socialSignIn("lovable")}>
                {oauthBusy === "lovable" ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <LovableMark />}
                Continue with Lovable
              </Button>
            </div>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm font-medium">
            Email
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </label>
          {mode !== "reset" && (
            <label className="block text-sm font-medium">
              Password
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </label>
          )}
          <Button type="submit" className="w-full" disabled={busy || oauthBusy !== null}>
            {busy && <LoaderCircle className="animate-spin" />}
            {mode === "up" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
          </Button>
        </form>
        {msg && (
          <p role="status" className="mt-4 text-sm text-brand">
            {msg}
          </p>
        )}
        {err && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {err}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 text-sm">
          {mode === "in" && (
            <>
              <Link to="/signup" className="text-left text-brand hover:underline">
                New here? Create an account
              </Link>
              <button
                className="text-left text-muted-foreground hover:underline"
                onClick={() => setMode("reset")}
              >
                Forgot password?
              </button>
            </>
          )}
          {mode !== "in" && (
            <Link to="/auth" className="text-left text-brand hover:underline" onClick={() => setMode("in")}>
              Back to sign in
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
