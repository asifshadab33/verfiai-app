import { describe, expect, it } from "vitest";
import { pageSeoLinks } from "./seo";
import { languages } from "./translations";
import { sitemapPaths } from "../routes/sitemap[.]xml";
import { readFileSync } from "node:fs";

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
    expect(sitemapPaths()).toHaveLength(77);
    expect(
      sitemapPaths().some(
        (path) => path.startsWith("/r/") || path.startsWith("/resources") || path === "/knowledge",
      ),
    ).toBe(false);
  });
});
