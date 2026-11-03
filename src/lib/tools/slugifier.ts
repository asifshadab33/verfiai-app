export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export function encodeUrl(text: string): string {
  try {
    return encodeURIComponent(text);
  } catch {
    return "";
  }
}
export function decodeUrl(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return "";
  }
}
