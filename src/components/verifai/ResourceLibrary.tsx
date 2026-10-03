import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { Download, FileText, GraduationCap, Scale, ShieldCheck, TrendingUp } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FREE_RESOURCES, type ResourceItem, type ResourceIcon } from '@/data/freeResources';
import { downloadResource } from '@/lib/resource-download';

const ICONS: Record<ResourceIcon, typeof FileText> = { FileText, Scale, TrendingUp, ShieldCheck, GraduationCap };
const emailSchema = z.string().trim().max(255).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.');

// This event contains only a template id; never include names, emails or other personal data.
function trackResourceEvent(type: 'resource_download_clicked' | 'resource_download_completed', id: string) {
  window.dispatchEvent(new CustomEvent(type, { detail: { resourceId: id } }));
}

export function ResourceLibrary() {
  const [selected, setSelected] = useState<ResourceItem | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function open(resource: ResourceItem) {
    trackResourceEvent('resource_download_clicked', resource.id);
    setSelected(resource); setEmail(''); setName(''); setAgreed(false); setError(''); setDone(false);
  }
  async function startDownload(resource: ResourceItem) {
    if (busy) return;
    setBusy(true); setError('');
    try {
      await downloadResource(resource);
      trackResourceEvent('resource_download_completed', resource.id);
      setDone(true);
    } catch {
      setError('The download could not start. Please try again.');
    } finally { setBusy(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) { setError(result.error.issues[0]?.message ?? 'Enter a valid email address.'); return; }
    if (name.trim().length > 100) { setError('Name must be 100 characters or fewer.'); return; }
    if (!agreed) { setError('Please agree to the Privacy Policy, or skip and download directly.'); return; }
    if (selected) void startDownload(selected);
  }

  return <section id="templates" aria-labelledby="templates-title" className="scroll-mt-24 border-t border-border bg-secondary/40">
    <div className="mx-auto max-w-7xl px-5 py-16">
      <h2 id="templates-title" className="font-display text-3xl font-bold">Free Research Templates &amp; Verification Guides</h2>
      <p className="mt-3 max-w-3xl text-muted-foreground">Download our professionally designed, source-linked templates. Built for journalists, paralegals, analysts, compliance officers, and researchers.</p>
      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{FREE_RESOURCES.map(resource => {
        const Icon = ICONS[resource.iconName];
        return <article key={resource.id} className="flex min-w-0 flex-col rounded-md border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-brand"><Icon aria-hidden className="size-6" /></span><span className="text-xs font-semibold text-muted-foreground">{resource.format} · {resource.size}</span></div>
          <p className="mt-5 text-xs font-bold uppercase text-brand">{resource.audienceLabel}</p>
          <h3 className="mt-2 font-display text-lg font-bold">{resource.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{resource.description}</p>
          <Button variant="outline" className="mt-5 min-h-11 self-start" onClick={() => open(resource)}><Download aria-hidden /> Download Free Template</Button>
        </article>;
      })}</div>
      <p className="mt-6 text-xs text-muted-foreground">Templates contain synthetic, illustrative examples and blank fields. Source links are yours to add; no findings are pre-verified.</p>
    </div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle>{done ? 'Download starting…' : selected?.title}</DialogTitle><DialogDescription>{done ? 'Your template is downloading now.' : 'Get this free template. We respect your privacy. Downloads start immediately; we do not send email or store the address entered here.'}</DialogDescription></DialogHeader>
        {done ? <div role="status" className="space-y-4"><p className="text-sm">If your download did not start, try again.</p><Button variant="outline" disabled={busy || !selected} onClick={() => { if (selected) void startDownload(selected); }}><Download aria-hidden /> Download again</Button></div> : <form onSubmit={submit} noValidate className="space-y-4">
          <div><label htmlFor="resource-email" className="mb-1.5 block text-sm font-semibold">Email address</label><Input id="resource-email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={e => { setEmail(e.target.value); setError(''); }} aria-invalid={!!error && !emailSchema.safeParse(email).success} aria-describedby={error ? 'resource-error' : undefined} /></div>
          <div><label htmlFor="resource-name" className="mb-1.5 block text-sm font-semibold">Name (optional)</label><Input id="resource-name" autoComplete="name" maxLength={100} value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="flex items-center gap-2"><Checkbox id="resource-privacy" checked={agreed} onCheckedChange={value => setAgreed(value === true)} /><label htmlFor="resource-privacy" className="text-sm">I agree to the <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand underline">Privacy Policy</Link></label></div>
          {error && <p id="resource-error" role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="min-h-11 w-full"><Download aria-hidden /> Download Free Template</Button>
          <Button type="button" variant="link" disabled={busy} className="min-h-11 w-full" onClick={() => { if (selected) void startDownload(selected); }}>Skip and download directly</Button>
        </form>}
      </DialogContent>
    </Dialog>
  </section>;
}
