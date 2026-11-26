import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { postSchema } from '@/lib/workspace';
export type PostValues = { title: string; body: string; author_name: string; source_url: string };
export function PostEditor({ initial, submit, cancel }: { initial?: PostValues; submit: (values: PostValues) => Promise<void>; cancel?: () => void }) {
  const [values, setValues] = useState(initial ?? { title: '', body: '', author_name: 'Community member', source_url: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <form className="space-y-4 border-b border-border pb-8" onSubmit={async event => { event.preventDefault(); const parsed = postSchema.safeParse(values); if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check the post fields.'); return; } setBusy(true); setError(''); try { await submit(parsed.data); setValues({ ...values, title: '', body: '', source_url: '' }); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to publish.'); } finally { setBusy(false); } }}>
    <div><Label htmlFor="post-name">Display name</Label><Input id="post-name" value={values.author_name} maxLength={60} required onChange={e => setValues({ ...values, author_name: e.target.value })} /></div>
    <div><Label htmlFor="post-title">Claim or discussion title</Label><Input id="post-title" value={values.title} maxLength={200} required onChange={e => setValues({ ...values, title: e.target.value })} /></div>
    <div><Label htmlFor="post-body">Evidence and discussion</Label><Textarea id="post-body" rows={5} value={values.body} maxLength={10000} required onChange={e => setValues({ ...values, body: e.target.value })} /></div>
    <div><Label htmlFor="post-source">Source link (optional)</Label><Input id="post-source" type="url" placeholder="https://" value={values.source_url} maxLength={2000} onChange={e => setValues({ ...values, source_url: e.target.value })} /></div>
    <p className="text-sm text-muted-foreground">Visible to signed-in members. Community claims are not verified verdicts. Do not include confidential material.</p>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="flex gap-2"><Button disabled={busy} type="submit">{busy ? 'Saving…' : initial ? 'Save changes' : 'Publish post'}</Button>{cancel && <Button type="button" variant="ghost" disabled={busy} onClick={cancel}>Cancel</Button>}</div>
  </form>;
}
