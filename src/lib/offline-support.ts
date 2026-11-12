/** Offline support only runs on the published site; previews and embedded frames must
 * never keep a worker that could serve stale pages after code changes. */
const SW_PATH = "/service-worker.js";
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const LOVABLE_HOSTS = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];
const DEV_DOMAINS = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];

export function isOfflineSupportAllowed(hostname: string, search: string, inFrame: boolean, prod: boolean) {
  const host = hostname.toLowerCase();
  if (!prod || inFrame || new URLSearchParams(search).get("sw") === "off") return false;
  if (LOVABLE_HOSTS.some((suffix) => host.endsWith(suffix))) {
    const label = host.split(".")[0] ?? "";
    if (PREVIEW_LABEL.test(label) || /^project--.+-dev$/.test(label)) return false;
  }
  if (DEV_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) return false;
  return true;
}

export async function registerOfflineSupport() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  let inFrame = true;
  try {
    inFrame = window.self !== window.top;
  } catch {
    inFrame = true;
  }
  const allowed = isOfflineSupportAllowed(
    window.location.hostname,
    window.location.search,
    inFrame,
    import.meta.env.PROD,
  );
  try {
    if (!allowed) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs
          .filter((r) => [r.active, r.waiting, r.installing].some((w) => w?.scriptURL.endsWith(SW_PATH)))
          .map((r) => r.unregister()),
      );
      return;
    }
    await navigator.serviceWorker.register(SW_PATH);
  } catch (error) {
    console.error("Verfiai offline support setup failed:", error);
  }
}
