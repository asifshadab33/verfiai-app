import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { BookOpen, BriefcaseBusiness, ChevronRight, ClipboardCopy, ExternalLink, FileSearch, GraduationCap, Newspaper, Search, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { ContentPage } from '@/components/verifai/ContentPage';
import { SOURCE_DATABASES, type Profession, type Reliability, type SystemSourceNode } from '@/lib/source-databases';

const professions = [
  { value: 'all', label: 'All sources', icon: BookOpen },
  { value: 'journalism', label: 'Journalism', icon: Newspaper },
  { value: 'legal', label: 'Legal', icon: FileSearch },
  { value: 'equity', label: 'Equity', icon: BriefcaseBusiness },
  { value: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { value: 'academic', label: 'Academic', icon: GraduationCap },
] as const;

type ProfessionFilter = Profession | 'all';
type ReliabilityFilter = 'all' | Extract<Reliability, 'High Verification Anchor' | 'Dynamic Coverage'>;

export const Route = createFileRoute('/sources')({
  head: () => ({ meta: [
    { title: 'Research Source Directory | Verfiai' },
    { name: 'description', content: 'Search public research databases by field, region, and purpose, with supplied catalog descriptions and registry links.' },
    { property: 'og:title', content: 'Research Source Directory | Verfiai' },
    { property: 'og:description', content: 'Search public research databases by field, region, and purpose, with supplied catalog descriptions and registry links.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ], links: [{ rel: 'canonical', href: 'https://verfiai.app/sources' }] }),
  component: SourceDirectory,
});

function SourceDirectory() {
  const [profession, setProfession] = useState<ProfessionFilter>('all');
  const [reliability, setReliability] = useState<ReliabilityFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SystemSourceNode | null>(null);
  const search = query.trim().toLocaleLowerCase();
  const available = SOURCE_DATABASES.filter(source =>
    (reliability === 'all' || source.reliabilityVerdict === reliability) &&
    (!search || [source.name, source.region, source.coreUtility].some(value => value.toLocaleLowerCase().includes(search)))
  );
  const items = available.filter(source => profession === 'all' || source.profession === profession);

  async function copySource(source: SystemSourceNode) {
    const context = `Research source to consider: ${source.name}\nRegistry: ${source.targetUrl}\nRegion: ${source.region}\nResearch purpose: ${source.coreUtility}\nCheck the registry directly for current coverage, access rules, and supporting evidence. Do not assume this source has been searched or verified.`;
    try {
      await navigator.clipboard.writeText(context);
      toast.success(`Prompt context copied for ${source.name}`);
    } catch {
      toast.error('Could not copy. Check your browser clipboard permissions and try again.');
    }
  }

  return <ContentPage title="Research source directory" intro="Explore public research databases by field and open their websites directly.">
    <Toaster position="bottom-right" />
    <p className="mb-8 max-w-3xl border-s-2 border-warning bg-warning-soft p-4 text-sm leading-6">Descriptions, reliability categories, and historical trends in this directory were supplied for the catalog, not independently verified or used to score reports. Check each source’s coverage, currency and terms before relying on it. Copying prompt context does not connect a database to Verfiai or search it automatically.</p>

    <div className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
      <div>
        <label htmlFor="source-search" className="mb-2 block text-sm font-semibold">Search sources</label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="source-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, region, or research purpose" className="h-11 bg-card ps-10 pe-12" />
          {query && <Button type="button" size="icon" variant="ghost" className="absolute end-1 top-1/2 size-9 -translate-y-1/2" onClick={() => setQuery('')} aria-label="Clear search" title="Clear search"><X className="size-4" /></Button>}
        </div>
      </div>
      <label htmlFor="source-reliability" className="text-sm font-semibold">Catalog reliability
        <select id="source-reliability" className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 font-normal text-foreground" value={reliability} onChange={event => setReliability(event.target.value as ReliabilityFilter)}>
          <option value="all">All levels</option>
          <option value="High Verification Anchor">High Verification Anchor</option>
          <option value="Dynamic Coverage">Dynamic Coverage</option>
        </select>
      </label>
    </div>

    <div role="group" aria-label="Filter sources by profession" className="mb-6 flex flex-wrap gap-2">
      {professions.map(({ value, label, icon: Icon }) => {
        const count = value === 'all' ? available.length : available.filter(source => source.profession === value).length;
        return <Button key={value} type="button" size="sm" className="h-11 gap-2" variant={profession === value ? 'default' : 'outline'} aria-pressed={profession === value} onClick={() => setProfession(value)}><Icon aria-hidden="true" className="size-4" />{label}<span className="text-xs opacity-75">{count}</span></Button>;
      })}
    </div>
    <p role="status" className="mb-5 text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'source' : 'sources'}</p>
    {items.length === 0 ? <div className="border-y border-border py-10 text-center"><p className="font-semibold">No sources match these filters.</p><Button type="button" variant="link" onClick={() => { setQuery(''); setReliability('all'); setProfession('all'); }}>Clear all filters</Button></div> :
      <div className="grid gap-5 md:grid-cols-2">{items.map(source => <article key={source.id} className="flex min-w-0 flex-col rounded-md border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-display text-xl font-bold">{source.name}</h2><span className="rounded-sm border border-border bg-secondary px-2 py-1 text-xs font-medium">{source.reliabilityVerdict}</span></div>
        <p className="mt-3 text-sm leading-6">{source.coreUtility}</p>
        <dl className="mt-4 grid gap-2 text-sm text-muted-foreground"><div><dt className="inline font-semibold text-foreground">Field: </dt><dd className="inline capitalize">{source.profession}</dd></div><div><dt className="inline font-semibold text-foreground">Region: </dt><dd className="inline">{source.region}</dd></div><div><dt className="inline font-semibold text-foreground">Access: </dt><dd className="inline">{source.accessMethod}</dd></div></dl>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => setSelected(source)}>10-year trend <ChevronRight aria-hidden="true" className="size-4" /></Button>
          <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => void copySource(source)} title={`Copy prompt context for ${source.name}`}><ClipboardCopy aria-hidden="true" className="size-4" />Inject as AI Source</Button>
          <Button asChild variant="link" size="sm" className="min-h-11 px-1"><a href={source.targetUrl} target="_blank" rel="noopener noreferrer">Open registry <ExternalLink aria-hidden="true" className="size-4" /><span className="sr-only">for {source.name} (opens in a new tab)</span></a></Button>
        </div>
      </article>)}</div>}

    <Sheet open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <SheetContent side="right" className="w-[min(100vw,28rem)] overflow-y-auto border-s border-border bg-background p-7 sm:max-w-md">
        <SheetHeader className="mt-8 text-start">
          <SheetTitle className="font-display text-2xl">{selected?.name}</SheetTitle>
          <SheetDescription>Catalog evolution · supplied summary, not an independently verified 10-year history</SheetDescription>
        </SheetHeader>
        {selected && <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Decadal evolution</h3>
          <p className="mt-3 text-base leading-7">{selected.decadalEvolution}</p>
          <p className="mt-6 text-sm text-muted-foreground">This is a supplied description, not a measured trend or an active data connection. Confirm changes directly with the registry.</p>
          <Button asChild variant="outline" className="mt-6"><a href={selected.targetUrl} target="_blank" rel="noopener noreferrer">Open registry <ExternalLink className="size-4" /></a></Button>
        </div>}
      </SheetContent>
    </Sheet>
  </ContentPage>;
}