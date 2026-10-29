import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
  retainSearchParams,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { isLang } from "../lib/translations";
import { translations } from "../lib/i18n/interface";
import { ensureLocale } from "../lib/locale-dictionaries";
import { documentLanguage } from "../lib/page-language";
import { FreeAccessBanner } from "../components/verifai/FreeAccessBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: import("@tanstack/react-router").ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: (search: Record<string, unknown>): { lang?: string } =>
    typeof search["lang"] === "string" ? { lang: search["lang"] } : {},
  search: { middlewares: [retainSearchParams(["lang"])] },
  beforeLoad: async ({ location }) => {
    const value = new URLSearchParams(location.searchStr).get("lang");
    await ensureLocale(isLang(value) ? value : "en");
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "laL9g1UCAP24-hZ0mMHpacn4qhSPs_1cVaXht6sAYUU" },
      { property: "og:site_name", content: "Verfiai" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
       { rel: "preconnect", href: "https://fonts.googleapis.com" },
       { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
       { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const value = new URLSearchParams(location.searchStr).get("lang");
  const lang = documentLanguage(location.pathname, value);
  return (
    <html lang={lang} dir={translations[lang].dir}>
      <head>
        {/* Restore the saved locale before first paint so there is no English-then-localized flash. Keep in sync with STORAGE_KEY in lib/locale.tsx. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var q=new URLSearchParams(location.search).get("lang");var l=localStorage.getItem("verifai-lang");if(!q&&l&&/^(es|fr|de|pt|it|nl|ru|tr|ar|hi|bn|ur|fa|zh|ja|ko|id|sw)$/.test(l)){var u=new URL(location.href);u.searchParams.set("lang",l);location.replace(u.href);}}catch(e){}` }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  useEffect(() => {
    // Fallback skip-link target for routes whose <main> lacks a declarative id.
    // Routes that render id="main-content" themselves (home, auth, ContentPage) are
    // left untouched so server and client markup match and hydration stays clean.
    const main = document.querySelector("main");
    if (main && !main.id) { main.id = "main-content"; main.tabIndex = -1; }
    let current = true;
    void import("../lib/posthog").then(({ trackPage }) => {
      if (current) trackPage(location.pathname);
    }).catch(() => { /* Analytics must never block the app. */ });
    return () => { current = false; };
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <FreeAccessBanner />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground">Skip to main content</a>
      <Outlet />
    </QueryClientProvider>
  );
}
