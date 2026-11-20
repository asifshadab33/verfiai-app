import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { BadgeCheck, CreditCard, FileText, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/verifai/ContentPage";
import { getAccountStatus } from "@/lib/account-status.functions";
import { supabase } from "@/integrations/supabase/client";

const accountOptions = (userId: string) => queryOptions({
  queryKey: ["account-status", userId],
  queryFn: () => getAccountStatus(),
  staleTime: 0,
  gcTime: 0,
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountOptions(context.accountOwner.id)),
  head: () => ({ meta: [
    { title: "My account | Verfiai" },
    { name: "description", content: "Your private Verfiai subscription status and account roles." },
    { property: "og:title", content: "My account | Verfiai" },
    { property: "og:description", content: "Your private Verfiai account dashboard." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: Dashboard,
  errorComponent: ({ reset }) => <ContentPage title="My account" intro="Account details are unavailable right now.">
    <p role="alert">We couldn’t check your account. No subscription or role status is shown.</p>
    <Button className="mt-5" onClick={reset}><RefreshCw />Try again</Button>
  </ContentPage>,
  pendingComponent: () => <ContentPage title="My account" intro=""><p role="status">Loading your account…</p></ContentPage>,
});

function Dashboard() {
  const { accountOwner } = Route.useRouteContext();
  const query = useSuspenseQuery(accountOptions(accountOwner.id));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { activeSubscription, roles } = query.data;
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }
  return <ContentPage title="My account" intro="Your membership and account access.">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
      <div className="min-w-0"><p className="text-sm text-muted-foreground">Signed in as</p><p className="mt-1 break-all font-semibold">{accountOwner.email ?? "Account owner"}</p></div>
      <div className="flex gap-2">
        <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw className={query.isFetching ? "animate-spin" : ""} />Refresh</Button>
        <Button variant="ghost" onClick={signOut}><LogOut />Sign out</Button>
      </div>
    </div>
    {query.isRefetchError && <p role="alert" className="mt-4 text-destructive">Refresh failed. The last checked details are shown below.</p>}
    <div className="grid gap-6 py-8 md:grid-cols-2">
      <section aria-labelledby="subscription-heading" className="rounded-lg border border-border bg-card p-6">
        <CreditCard className="size-6 text-brand" />
        <h2 id="subscription-heading" className="mt-4 font-display text-xl font-bold">Subscription status</h2>
        <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-success-soft px-3 py-2 font-semibold text-success"><BadgeCheck className="size-4" />{activeSubscription ? "Active subscription" : "Community access"}</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{activeSubscription ? "Your existing subscription is currently eligible for access." : "No active subscription. Verfiai is free during the community-access period."}</p>
        {activeSubscription && <Button asChild variant="link" className="mt-3 px-0"><Link to="/reports">Existing billing management</Link></Button>}
      </section>
      <section aria-labelledby="roles-heading" className="rounded-lg border border-border bg-card p-6">
        <ShieldCheck className="size-6 text-brand" />
        <h2 id="roles-heading" className="mt-4 font-display text-xl font-bold">Account roles</h2>
        {roles.length ? <ul className="mt-4 flex flex-wrap gap-2">{roles.map(role => <li key={role} className="rounded-md bg-secondary px-3 py-2 font-semibold capitalize">{role}</li>)}</ul> : <p className="mt-4 text-muted-foreground">No assigned roles</p>}
      </section>
    </div>
    <nav aria-label="Account navigation" className="flex flex-wrap gap-3 border-t border-border pt-6">
      <Button asChild variant="outline"><Link to="/reports"><FileText />My reports</Link></Button>
      <Button asChild variant="outline"><Link to="/account/usage"><CreditCard />Credits and usage</Link></Button>
    </nav>
  </ContentPage>;
}