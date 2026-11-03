import { describe, expect, it } from "vitest";
import { basicMarkdownToHtml } from "./markdown";

describe("basicMarkdownToHtml", () => {
  it("renders inline and fenced code as text, not markup", () => {
    const inline = basicMarkdownToHtml("`<img src=x onerror=alert(1)>`");
    const fenced = basicMarkdownToHtml("```\n<script>alert(1)</script>\n```");
    const inlineHtml = basicMarkdownToHtml("<img src=x onerror=alert(1)>");

    expect(inline).toContain("<code>&lt;img src=x onerror=alert(1)&gt;</code>");
    expect(inline).not.toContain("<img");
    expect(fenced).toContain("<pre><code>&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(fenced).not.toContain("<script");
    expect(inlineHtml).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(inlineHtml).not.toContain("<img");
  });

  it("escapes entity-encoded inline HTML before adding preview markup", () => {
    const html = basicMarkdownToHtml("&lt;img src=x onerror=alert(1)&gt;");

    expect(html).toContain("&amp;lt;img src=x onerror=alert(1)&amp;gt;");
    expect(html).not.toContain("<img");
  });

  it("still formats supported Markdown", () => {
    expect(basicMarkdownToHtml("# Title\n\n**bold** and *italic*")).toBe(
      "<h2>Title</h2><br/><br/><strong>bold</strong> and <em>italic</em>",
    );
  });
});
