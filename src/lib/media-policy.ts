export const MEDIA_BUCKET = "report-media";
export const MEDIA_URL_TTL_SECONDS = 15 * 60;
/** Paths must be `<userId>/<file>` with no traversal. */
export function isOwnMediaPath(path: string, userId: string) {
  const parts = path.split("/");
  return parts.length >= 2 && parts[0] === userId && !parts.some(p => p === ".." || p === "" || p === ".");
}
