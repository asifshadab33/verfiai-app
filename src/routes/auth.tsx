import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileCheck2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in | VerifAI" },
    { name: "description", content: "Sign in to VerifAI with Google or email to generate and save AI research reports." },
    { property: "og:title", content: "Sign in | VerifAI" },
    { property: "og:description", content: "Sign in to generate and save AI research reports." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { if (user) navigate({ to: "/reports" }); }, [user, navigate]);

  async function google() {
    setErr("");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setErr("Google sign-in didn't complete. Please try again.");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setMsg("");
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth" } });
        if (error) throw error; setMsg("Check your email to confirm your account, then sign in.");
      } else if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error; setMsg("If that email has an account, a reset link is on its way.");
      }
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong."); } finally { setBusy(false); }
  }

  return <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-5 py-12">
    <div className="w-full max-w-sm border border-border bg-card p-8 shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><FileCheck2 className="size-5" /></span>Verif<span className="text-brand">AI</span></Link>
      <h1 className="mt-6 font-display text-2xl font-bold">{mode === "up" ? "Create your account" : mode === "reset" ? "Reset password" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to generate reports and keep them in your library.</p>
      {mode !== "reset" && <><Button variant="outline" className="mt-6 w-full" onClick={google}>Continue with Google</Button><div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div></>}
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm font-medium">Email<Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1" /></label>
        {mode !== "reset" && <label className="block text-sm font-medium">Password<Input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-1" /></label>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <LoaderCircle className="animate-spin" />}{mode === "up" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}</Button>
      </form>
      {msg && <p role="status" className="mt-4 text-sm text-brand">{msg}</p>}
      {err && <p role="alert" className="mt-4 text-sm text-destructive">{err}</p>}
      <div className="mt-6 flex flex-col gap-2 text-sm">
        {mode === "in" && <><button className="text-left text-brand hover:underline" onClick={() => setMode("up")}>New here? Create an account</button><button className="text-left text-muted-foreground hover:underline" onClick={() => setMode("reset")}>Forgot password?</button></>}
        {mode !== "in" && <button className="text-left text-brand hover:underline" onClick={() => setMode("in")}>Back to sign in</button>}
      </div>
    </div>
  </div>;
}
