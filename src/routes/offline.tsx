import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "You're offline | Verfiai" },
      { name: "description", content: "Reconnect to continue using Verfiai." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[70vh] items-center justify-center bg-background px-5 py-16 text-foreground"
    >
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="font-display text-3xl font-bold">You're offline</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Reconnect to the internet to continue checking claims and citations with Verfiai.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
