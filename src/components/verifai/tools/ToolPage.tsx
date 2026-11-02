import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

export type ToolNote = { title: string; body: ReactNode };

/** Shared frame for every free-tool page: title, privacy line, the tool, short honest notes, link back to the hub. */
export function ToolPage({ title, intro, privacy, notes, children }: { title: string; intro: string; privacy: string; notes: ToolNote[]; children: ReactNode }) {
  return <ContentPage title={title} intro={intro}>
    <p className="mb-5 text-xs leading-5 text-muted-foreground">{privacy}</p>
    {children}
    {notes.map(n => <PageSection key={n.title} title={n.title}><div>{n.body}</div></PageSection>)}
    <PageSection title="More free tools"><p>Verfiai&rsquo;s free tools help you check facts, sources and writing. <Link to="/tools" className="text-brand underline">Browse all free tools</Link> or <Link to="/fact-checker" className="text-brand underline">check a claim against sources</Link>.</p></PageSection>
  </ContentPage>;
}
