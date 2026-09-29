import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Set a new password | VerifAI" }, { name: "description", content: "Choose a new password for your VerifAI account." },
    { property: "og:title", content: "Set a new password | VerifAI" }, { property: "og:description", content: "Choose a new password for your VerifAI account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErr(error.message); else navigate({ to: "/reports" });
  }
  return <div className="flex min-h-screen items-center justify-center px-5"><form onSubmit={submit} className="w-full max-w-sm space-y-4 border border-border bg-card p-8"><h1 className="font-display text-2xl font-bold">Set a new password</h1><Input type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" /><Button type="submit" className="w-full">Save password</Button>{err && <p role="alert" className="text-sm text-destructive">{err}</p>}</form></div>;
}
