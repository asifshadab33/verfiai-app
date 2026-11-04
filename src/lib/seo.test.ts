import { describe, expect, it } from "vitest";
import { pageSeoLinks } from "./seo";
import { languages } from "./translations";
import { sitemapPaths } from "../routes/sitemap[.]xml";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listReviewedClaimSlugs } from "@/data/claims";
import { toolHead, toolHeadForPath } from "./tools/tool-head";
import { NEW_TOOLS } from "./tools/new-tool-catalog";
import { FREE_TOOL_PAGES, TOOL_GUIDE_PAGES } from "./tools/free-tool-pages";

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? routeFiles(path) : entry.name.endsWith(".tsx") ? [path] : [];
  });
}

describe("leaf search metadata policy", () => {
  it("uses clean apex canonicals without tool queries or slash variants", () => {
    for (const path of ["/features", "/methodology", "/about", "/research", "/sources"]) {
      expect(pageSeoLinks(`${path}/?lang=ar&tab=report`, "ar")).toEqual([
        { rel: "canonical", href: `https://verfiai.app${path}` },
      ]);
    }
  });
  it("keeps all 19 localized alternates reciprocal and self-referencing with English x-default", () => {
    for (const path of ["/", "/app"]) {
      const english = pageSeoLinks(path, "en");
      const alternates = english.filter((link) => link.rel === "alternate");
      expect(alternates).toHaveLength(20);
      expect(alternates).toContainEqual({
        rel: "alternate",
        hrefLang: "x-default",
        href: `https://verfiai.app${path}`,
      });
      for (const { code } of languages) {
        const links = pageSeoLinks(path, code);
        const url = `https://verfiai.app${path}${code === "en" ? "" : `?lang=${code}`}`;
        expect(links[0]).toEqual({ rel: "canonical", href: url });
        expect(links.filter((link) => link.rel === "alternate")).toEqual(alternates);
        expect(links).toContainEqual({ rel: "alternate", hrefLang: code, href: url });
      }
    }
  });
  it("excludes English primary-copy and private pages from non-English alternates", () => {
    for (const path of [
      "/about",
      "/methodology",
      "/accuracy",
      "/fact-checker",
      "/pricing",
      "/auth",
      "/admin",
      "/account/usage",
      "/reports",
      "/r/example",
    ]) {
      expect(pageSeoLinks(path, "ar").filter((link) => link.rel === "alternate")).toEqual([]);
    }
  });
  it("noindexes auth, admin and every account/transactional route and omits them from the sitemap", () => {
    const routes = [
      "auth",
      "admin",
      "reports",
      "reset-password",
      "account/usage",
      "account/library-usage",
      "checkout/success",
    ];
    for (const route of routes) {
      const source = readFileSync(new URL(`../routes/${route}.tsx`, import.meta.url), "utf8");
      expect(source).toMatch(/name: "robots", content: "noindex,\s*nofollow"/);
      expect(sitemapPaths()).not.toContain(`/${route}`);
    }
    expect(new Set(sitemapPaths()).size).toBe(sitemapPaths().length);
    expect(
      sitemapPaths().some(
        (path) => path.startsWith("/r/") || path.startsWith("/resources") || path === "/knowledge",
      ),
    ).toBe(false);
  });

  it("includes every indexable page, public content endpoint, and reviewed claim page", () => {
    const routeRoot = new URL("../routes", import.meta.url).pathname;
    for (const file of routeFiles(routeRoot)) {
      const source = readFileSync(file, "utf8");
      const route = source.match(/createFileRoute\(["']([^"']+)["']\)/)?.[1];
      if (!route || route.includes("$") || /name: "robots", content: "noindex/.test(source))
        continue;
      const normalized = route.replace(/\/+$/, "") || "/";
      expect(sitemapPaths(), `${normalized} should be listed`).toContain(normalized);
    }
    expect(sitemapPaths()).toEqual(expect.arrayContaining(["/rss.xml", "/llms.txt"]));
    for (const slug of listReviewedClaimSlugs())
      expect(sitemapPaths()).toContain(`/fact-check/${slug}`);
  });

  it("keeps every tool card, route, sitemap entry and leaf metadata in sync", () => {
    const toolRoot = new URL("../routes/tools", import.meta.url).pathname;
    const files = readdirSync(toolRoot).filter(
      (file) => file.endsWith(".tsx") && file !== "index.tsx" && file !== "$tool.tsx",
    );
    const cardSource = readFileSync(
      new URL("../components/verifai/tools/ToolsHub.tsx", import.meta.url),
      "utf8",
    );
    const routes = files.map((file) => {
      const source = readFileSync(join(toolRoot, file), "utf8");
      const route = source.match(/createFileRoute\(["']([^"']+)["']\)/)?.[1];
      expect(route).toBeDefined();
      expect(source).toMatch(/head:\s*\(\)\s*=>\s*toolHead(?:ForPath)?\(/);
      if (route && source.includes("toolHeadForPath(")) {
        const head = toolHeadForPath(route);
        const cardStart = cardSource.indexOf(`to: "${route}"`);
        const card = cardSource.slice(cardStart, cardSource.indexOf("\n      },", cardStart));
        const cardTitle = card.match(/title: "([^"]+)"/)?.[1];
        const cardBlurb = card.match(/blurb: "([^"]+)"/)?.[1];
        expect(cardTitle).toBeDefined();
        expect(cardBlurb).toBeDefined();
        expect(head.meta).toEqual(
          expect.arrayContaining([
            { title: `Free ${cardTitle} | Verfiai` },
            { name: "description", content: expect.stringContaining(cardBlurb!) },
          ]),
        );
        expect(head.links).toContainEqual({
          rel: "canonical",
          href: `https://verfiai.app${route}`,
        });
      }
      return route!;
    });
    const staticCards = [...cardSource.matchAll(/to: "(\/tools\/[^"]+)"/g)].map(
      (match) => match[1]!,
    );
    const freeToolRoutes = FREE_TOOL_PAGES.map((tool) => `/tools/${tool.slug}`);
    const leafCards = [...staticCards, ...freeToolRoutes];
    expect(new Set(leafCards)).toEqual(new Set(routes));
    expect(leafCards).toHaveLength(routes.length);
    const dynamicTools = NEW_TOOLS.filter(
      (tool) => !FREE_TOOL_PAGES.some((page) => page.slug === tool.slug),
    );
    const allCardRoutes = [
      ...leafCards,
      ...dynamicTools.map((tool) => `/tools/${tool.slug}`),
      ...TOOL_GUIDE_PAGES.map((page) => `/${page.slug}`),
    ];
    expect(new Set(allCardRoutes).size).toBe(allCardRoutes.length);
    expect(sitemapPaths()).toEqual(expect.arrayContaining(["/tools", ...routes]));
    const dynamicSource = readFileSync(join(toolRoot, "$tool.tsx"), "utf8");
    expect(dynamicSource).toMatch(/head:\s*\(\{\s*params\s*\}\)\s*=>/);
    const searchIndex = JSON.parse(
      readFileSync(new URL("../../public/search-index.json", import.meta.url), "utf8"),
    ) as { url: string; title: string; description: string }[];
    const indexedPaths = new Set(searchIndex.map((entry) => entry.url));
    for (const route of routes) expect(indexedPaths).toContain(route);
    for (const tool of FREE_TOOL_PAGES) {
      const path = `/tools/${tool.slug}`;
      expect(sitemapPaths()).toContain(path);
      const indexedTool = searchIndex.find((entry) => entry.url === path);
      expect(indexedTool).toMatchObject({ title: tool.title });
      expect(indexedTool?.description.trim()).toBeTruthy();
      const head = toolHead({
        path,
        name: tool.title,
        title: `Free ${tool.title} | Verfiai`,
        description: tool.description,
      });
      expect(head.links).toContainEqual({ rel: "canonical", href: `https://verfiai.app${path}` });
    }
    for (const tool of NEW_TOOLS) {
      if (FREE_TOOL_PAGES.some((page) => page.slug === tool.slug)) continue;
      const path = `/tools/${tool.slug}`;
      expect(sitemapPaths()).toContain(path);
      const indexedTool = searchIndex.find((entry) => entry.url === path);
      expect(indexedTool).toMatchObject({ title: tool.title });
      expect(indexedTool?.description.trim()).toBeTruthy();
      const head = toolHead({
        path,
        name: tool.title,
        title: `Free ${tool.title} | Verfiai`,
        description: tool.description,
      });
      expect(head.links).toContainEqual({ rel: "canonical", href: `https://verfiai.app${path}` });
    }
    expect(allCardRoutes).toHaveLength(
      routes.length + dynamicTools.length + TOOL_GUIDE_PAGES.length,
    );
  });

  it("links to /tools from both desktop and mobile navigation", () => {
    const home = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf8");
    const desktopMenuStart = home.indexOf('id="research-tools-menu"');
    const mobileMenuStart = home.indexOf('id="mobile-navigation-menu"');
    expect(desktopMenuStart).toBeGreaterThanOrEqual(0);
    expect(mobileMenuStart).toBeGreaterThan(desktopMenuStart);
    expect(home.slice(desktopMenuStart, mobileMenuStart)).toContain('to="/tools"');
    expect(home.slice(mobileMenuStart)).toContain('to="/tools"');
  });
});
