import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ensureLocale } from "./lib/locale-dictionaries";
import { isLang } from "./lib/translations";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Hydration skips beforeLoad: load the same URL locale before any browser render or head evaluation.
    dehydrate: (): { locale: string } => ({ locale: new URLSearchParams(router.state.location.searchStr).get("lang") ?? "en" }),
    hydrate: async (data: { locale: string }) => { await ensureLocale(isLang(data.locale) ? data.locale : "en"); },
  });

  return router;
};
