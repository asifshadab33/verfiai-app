export function basicMarkdownToHtml(text: string): string {
  const codeBlocks: string[] = [];
  let placeholderPrefix = "__VERIFAI_CODE_";
  while (text.includes(placeholderPrefix)) placeholderPrefix += "_";
  const withCodePlaceholders = text.replace(
    /```(?:[^\n]*)\n?([\s\S]*?)```|`([^`\n]+)`/g,
    (_match, block: string | undefined, inline: string | undefined) => {
      const code = block ?? inline ?? "";
      const rendered =
        block !== undefined
          ? `<pre><code>${escapeHtml(code)}</code></pre>`
          : `<code>${escapeHtml(code)}</code>`;
      codeBlocks.push(rendered);
      return `${placeholderPrefix}${codeBlocks.length - 1}__`;
    },
  );
  let html = escapeHtml(withCodePlaceholders)
    .replace(/^#{1,3} (.*$)/gim, "<h2>$1</h2>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/^- (.*$)/gim, "<ul><li>$1</li></ul>")
    .replace(/\n/g, "<br/>");
  codeBlocks.forEach((code, index) => {
    html = html.replaceAll(`${placeholderPrefix}${index}__`, code);
  });
  return html;
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
