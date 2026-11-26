import { Link, useRouter } from '@tanstack/react-router';
import { BookOpen, LayoutDashboard, MessageSquare, Wrench, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentPage } from '@/components/verifai/ContentPage';
export function WorkspaceNav() {
  const links = [ { to: '/dashboard', label: 'Account', Icon: LayoutDashboard }, { to: '/dashboard/facts', label: 'My facts', Icon: BookOpen }, { to: '/dashboard/tools', label: 'My tools', Icon: Wrench }, { to: '/dashboard/posts', label: 'My posts', Icon: MessageSquare }, { to: '/community', label: 'Community feed', Icon: Rss } ] as const;
  return <nav aria-label="Your workspace" className="mb-8 flex flex-wrap gap-2 border-b border-border pb-5">{links.map(({ to, label, Icon }) => <Button asChild variant="outline" key={to}><Link to={to} activeProps={{ className: 'bg-secondary text-foreground' }} activeOptions={{ exact: true }}><Icon className="size-4" />{label}</Link></Button>)}</nav>;
}
export function WorkspacePage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <ContentPage title={title} intro={intro}><WorkspaceNav />{children}</ContentPage>;
}
export function WorkspaceError() {
  const router = useRouter();
  return <WorkspacePage title="Workspace unavailable" intro=""><p role="alert">We couldn’t load this page. Your saved items haven’t changed.</p><Button className="mt-4" onClick={() => void router.invalidate()}>Try again</Button></WorkspacePage>;
}
export function WorkspaceMissing() { return <WorkspacePage title="Not found" intro="This item is no longer available." ><Button asChild><Link to="/community">Back to feed</Link></Button></WorkspacePage>; }
export function SourceLink({ url }: { url: string }) { return url ? <a href={url} target="_blank" rel="noopener noreferrer ugc nofollow" className="break-all text-sm text-brand underline">View source ↗</a> : null; }
export function ItemDate({ date }: { date: string }) { return <time dateTime={date}>{new Date(date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time>; }
