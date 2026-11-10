import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { ShareToolButton } from "./ShareToolButton";

export type ToolNote = { title: string; body: ReactNode };

/** Shared frame for every free-tool page: title, privacy line, the tool, short honest notes, link back to the hub. */
export function ToolPage({
  title,
  intro,
  description,
  privacy,
  styleControls = true,
  notes = [],
  children,
}: {
  title: string;
  intro?: string;
  description?: string;
  privacy?: string;
  styleControls?: boolean;
  notes?: ToolNote[];
  children: ReactNode;
}) {
  const resolvedIntro = intro ?? description ?? "";
  const resolvedPrivacy =
    privacy ?? "Your entries stay in your browser and are not stored by this tool.";

  return (
    <ContentPage title={title} intro={resolvedIntro}>
      <ShareToolButton title={title} />
      {styleControls ? (
        <div className="tool-page-content">
          <p className="mb-5 text-xs leading-5 text-muted-foreground">{resolvedPrivacy}</p>
          {children}
        </div>
      ) : (
        <>
          <p className="mb-5 text-xs leading-5 text-muted-foreground">{resolvedPrivacy}</p>
          {children}
        </>
      )}
      <aside className="my-8 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm leading-6 text-muted-foreground">
        Need more than a quick check? The{" "}
        <Link to="/app" className="inline-flex min-h-11 items-center text-brand underline">
          Verfiai AI Research Engine
        </Link>{" "}
        turns a question into a sourced report you can verify — free during our community year.
      </aside>
      {notes.map((n) => (
        <PageSection key={n.title} title={n.title}>
          <div>{n.body}</div>
        </PageSection>
      ))}
      <PageSection title="More free tools">
        <p>
          Verfiai&rsquo;s free tools help you check facts, sources and writing.{" "}
          <Link to="/tools" className="inline-flex min-h-11 items-center text-brand underline">
            Browse all free tools
          </Link>{" "}
          or{" "}
          <Link
            to="/fact-checker"
            className="inline-flex min-h-11 items-center text-brand underline"
          >
            check a claim against sources
          </Link>
          .
        </p>
      </PageSection>
    </ContentPage>
  );
}

export default ToolPage;
