import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WorkspacePage, WorkspaceError, WorkspaceMissing, SourceLink, ItemDate } from '@/components/account/WorkspacePage';
import { getMemberFacts, saveMemberFact, deleteMemberFact } from '@/lib/workspace.functions';
import { factSchema, workspaceHead } from '@/lib/workspace';
const factsOptions = (owner: string) => queryOptions({ queryKey: ['member-facts', owner], queryFn: () => getMemberFacts(), staleTime: 0, gcTime: 0 });
export const Route = createFileRoute('/_authenticated/dashboard_/facts')({
  loader: ({ context }) => context.queryClient.ensureQueryData(factsOptions(context.accountOwner.id)),
  head: () => workspaceHead('My facts', 'Your private claims, notes and source links in Verfiai.'),
  component: FactsPage, errorComponent: WorkspaceError, notFoundComponent: WorkspaceMissing,
});
function FactsPage() {
  const { accountOwner } = Route.useRouteContext(); const { data } = useSuspenseQuery(factsOptions(accountOwner.id));
  const save = useServerFn(saveMemberFact); const remove = useServerFn(deleteMemberFact); const client = useQueryClient();
  const empty = { claim: '', notes: '', source_url: '' }; const [values, setValues] = useState(empty); const [editId, setEditId] = useState<string>(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function refresh() { await client.invalidateQueries({ queryKey: ['member-facts', accountOwner.id] }); }
  return <WorkspacePage title="My facts" intro="A private notebook of claims, evidence and questions worth revisiting.">
    <form className="space-y-4 border-b border-border pb-8" onSubmit={async event => { event.preventDefault(); const parsed = factSchema.safeParse(values); if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your fields.'); return; } setBusy(true); setError(''); try { await save({ data: { ...parsed.data, ...(editId ? { id: editId } : {}) } }); await refresh(); setValues(empty); setEditId(undefined); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save.'); } finally { setBusy(false); } }}>
      <h2 className="font-display text-xl font-bold">{editId ? 'Edit fact' : 'Add a fact'}</h2>
      <div><Label htmlFor="fact-claim">Claim</Label><Textarea id="fact-claim" required maxLength={2000} value={values.claim} onChange={e => setValues({ ...values, claim: e.target.value })} /></div>
      <div><Label htmlFor="fact-notes">Notes and evidence</Label><Textarea id="fact-notes" rows={4} maxLength={10000} value={values.notes} onChange={e => setValues({ ...values, notes: e.target.value })} /></div>
      <div><Label htmlFor="fact-source">Source link (optional)</Label><Input id="fact-source" type="url" placeholder="https://" maxLength={2000} value={values.source_url} onChange={e => setValues({ ...values, source_url: e.target.value })} /></div>
      <p className="text-sm text-muted-foreground">Only you can see these notes. Saving a claim does not verify it.</p>
      <div className="flex gap-2"><Button disabled={busy}>{busy ? 'Saving…' : 'Save fact'}</Button>{editId && <Button type="button" variant="ghost" disabled={busy} onClick={() => { setEditId(undefined); setValues(empty); }}>Cancel</Button>}</div>
    </form>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    <h2 className="mt-8 font-display text-xl font-bold">Saved facts · {data.length}</h2>
    {!data.length && <div className="py-10"><BookOpen className="mb-3 size-8 text-brand" /><p className="text-muted-foreground">No saved facts yet.</p></div>}
    <div className="divide-y divide-border">{data.map(fact => <article key={fact.id} className="py-6"><h3 className="whitespace-pre-wrap break-words text-lg font-semibold">{fact.claim}</h3><p className="my-3 whitespace-pre-wrap break-words text-muted-foreground">{fact.notes}</p><SourceLink url={fact.source_url} /><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-muted-foreground"><ItemDate date={fact.created_at} /></span><div className="flex gap-2"><Button variant="ghost" disabled={busy} onClick={() => { setEditId(fact.id); setValues({ claim: fact.claim, notes: fact.notes, source_url: fact.source_url }); document.getElementById('fact-claim')?.focus(); }}><Pencil />Edit</Button><Button variant="ghost" disabled={busy} onClick={async () => { if (!window.confirm('Delete this private fact?')) return; setBusy(true); setError(''); try { await remove({ data: { id: fact.id } }); await refresh(); if (editId === fact.id) { setEditId(undefined); setValues(empty); } } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete.'); } finally { setBusy(false); } }}><Trash2 />Delete</Button></div></div></article>)}</div>
  </WorkspacePage>;
}
