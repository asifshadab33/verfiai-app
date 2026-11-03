export function basicMarkdownToHtml(text: string): string {
  // Basic sanitizer to prevent XSS before applying markdown
  const sanitized = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return sanitized
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/^- (.*$)/gim, "<ul><li>$1</li></ul>")
    .replace(/\n/g, "<br/>");
}
