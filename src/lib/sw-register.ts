// Single place that registers the offline service worker. Never runs in dev,
// iframes, or Lovable preview hosts; unregisters stale workers there instead.
async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
}

function refused(): boolean {
  if (!import.meta.env.PROD) return true;
  try { if (window.self !== window.top) return true; } catch { return true; }
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  for (const d of ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"]) {
    if (h === d || h.endsWith(`.${d}`)) return true;
  }
  return new URLSearchParams(window.location.search).get("sw") === "off";
}

export async function registerAppServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) { await unregisterAppWorkers(); return; }
  try { await navigator.serviceWorker.register("/sw.js", { scope: "/" }); } catch (e) { console.error("SW registration failed", e); }
}
