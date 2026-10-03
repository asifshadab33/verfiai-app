import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentPage } from '@/components/verifai/ContentPage';
import { SOURCE_DATABASES, type Profession } from '@/lib/source-databases';

const professions: Array<{ value: Profession | 'all'; label: string }> = [
  { value: 'all', label: 'All sources' },
  { value: 'journalism', label: 'Journalism' },
  { value: 'legal', label: 'Legal' },
  { value: 'equity', label: 'Equity' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'academic', label: 'Academic' },
];

export const Route = createFileRoute('/sources')({
  head: () => ({ meta: [
    { title: 'Research Source Directory | Verfiai' },
    { name: 'description', content: 'Browse research databases by profession, with supplied catalog descriptions, access methods and direct links.' },
    { property: 'og:title', content: 'Research Source Directory | Verfiai' },
    { property: 'og:description', content: 'Browse research databases by profession, with supplied catalog descriptions, access methods and direct links.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: SourceDirectory,
});

function SourceDirectory() {
  const [filter, setFilter] = useState<Profession | 'all'>('all');
  const items = SOURCE_DATABASES.filter(source => filter === 'all' || source.profession === filter);
  return <ContentPage title="Research source directory" intro="Explore public research databases by field and open their websites directly.">
    <p className="mb-8 max-w-3xl border-s-2 border-warning bg-warning-soft p-4 text-sm leading-6">Descriptions and reliability categories in this directory were supplied for the catalog, not independently verified or used to score reports. Check each source’s coverage, currency and terms before relying on it.</p>
    <div role="group" aria-label="Filter sources by profession" className="mb-7 flex flex-wrap gap-2">
      {professions.map(option => <Button key={option.value} type="button" size="sm" variant={filter === option.value ? 'default' : 'outline'} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}</Button>)}
    </div>
    <p role="status" className="mb-5 text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'source' : 'sources'}</p>
    <div className="grid gap-5 md:grid-cols-2">{items.map(source => <article key={source.id} className="flex flex-col rounded-md border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-display text-xl font-bold">{source.name}</h2><span className="rounded-sm border border-border bg-secondary px-2 py-1 text-xs font-medium">{source.reliabilityVerdict}</span></div>
      <p className="mt-3 text-sm leading-6">{source.coreUtility}</p>
      <dl className="mt-4 grid gap-2 text-sm text-muted-foreground"><div><dt className="inline font-semibold text-foreground">Field: </dt><dd className="inline capitalize">{source.profession}</dd></div><div><dt className="inline font-semibold text-foreground">Region: </dt><dd className="inline">{source.region}</dd></div><div><dt className="inline font-semibold text-foreground">Access: </dt><dd className="inline">{source.accessMethod}</dd></div></dl>
      <a href={source.targetUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand underline underline-offset-4">Visit website <ExternalLink className="size-4" aria-hidden="true" /><span className="sr-only">for {source.name} (opens in a new tab)</span></a>
    </article>)}</div>
  </ContentPage>;
}