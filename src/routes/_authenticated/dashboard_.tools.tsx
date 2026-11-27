import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspacePage, WorkspaceError, WorkspaceMissing } from '@/components/account/WorkspacePage';
import { getMemberTools, setMemberTool } from '@/lib/workspace.functions';
import { WORKSPACE_TOOLS, workspaceHead } from '@/lib/workspace';
const toolsOptions = (owner: string) => queryOptions({ queryKey: ['member-tools', owner], queryFn: () => getMemberTools(), staleTime: 0, gcTime: 0 });
export const Route = createFileRoute('/_authenticated/dashboard_/tools')({
  loader: ({ context }) => context.queryClient.ensureQueryData(toolsOptions(context.accountOwner.id)), head: () => workspaceHead('My tools', 'Your private collection of Verfiai research tool shortcuts.'), component: ToolsPage, errorComponent: WorkspaceError, notFoundComponent: WorkspaceMissing,
});
function ToolsPage() {
  const { accountOwner } = Route.useRouteContext(); const { data } = useSuspenseQuery(toolsOptions(accountOwner.id)); const save = useServerFn(setMemberTool); const client = useQueryClient(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const saved = WORKSPACE_TOOLS.filter(tool => data.includes(tool.key));
  function toolCard(tool: typeof WORKSPACE_TOOLS[number]) { const selected = data.includes(tool.key); return <article key={tool.key} className="flex flex-col rounded-lg border border-border bg-card p-5"><h3 className="font-semibold">{tool.title}</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">{tool.note}</p><div className="mt-5 flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link to={tool.path} search={'search' in tool ? tool.search : {}}>Open<ArrowUpRight /></Link></Button><Button variant="ghost" size="sm" aria-label={`${selected ? 'Unsave' : 'Save'} ${tool.title}`} aria-pressed={selected} disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await save({ data: { key: tool.key, saved: !selected } }); await client.invalidateQueries({ queryKey: ['member-tools', accountOwner.id] }); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save tool.'); } finally { setBusy(false); } }}><Bookmark className={selected ? 'fill-current text-brand' : ''} />{selected ? 'Saved' : 'Save'}</Button></div></article>; }
  return <WorkspacePage title="My tools" intro="Your shortcuts for everyday research.">{error && <p role="alert" className="mb-4 text-destructive">{error}</p>}<h2 className="mb-5 font-display text-xl font-bold">Saved tools · {saved.length}</h2>{saved.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{saved.map(toolCard)}</div> : <p className="py-5 text-muted-foreground">No saved tools yet.</p>}<section className="mt-10 border-t border-border pt-8"><h2 className="mb-5 font-display text-xl font-bold">Research essentials</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{WORKSPACE_TOOLS.filter(tool => !data.includes(tool.key)).map(toolCard)}</div><Button asChild variant="link" className="mt-5 px-0"><Link to="/tools">Browse all free tools<ArrowUpRight /></Link></Button></section></WorkspacePage>;
}
