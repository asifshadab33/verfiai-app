export function ToolSignInPrompt({
  tool,
  title = "Sign in required",
  description,
  signInLabel = "Sign in",
}: {
  tool: string;
  title?: string;
  description?: string;
  signInLabel?: string;
}) {
  return (
    <section
      aria-label="Sign in required"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8"
    >
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {description ??
          `Sign in to continue to ${tool}. Your input is not submitted until you sign in.`}
      </p>
      <a
        href="/auth"
        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        {signInLabel}
      </a>
    </section>
  );
}
