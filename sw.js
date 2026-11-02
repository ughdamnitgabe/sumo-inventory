/* Sumo push service worker: shows web pushes and opens/focuses the app at
 * the pushed route. No caching, no fetch handling — this worker exists
 * only for push. Served from the site root (deployed as repo-root sw.js);
 * registration resolves it against the served page, so both the custom
 * domain and the /sumo-inventory/ path work. */
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  const title = data.title || "Sumo";
  const body = data.body || "";
  const url = data.url || "#/";
  event.waitUntil(self.registration.showNotification(title, { body, data: { url } }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.url) || "#/";
  let target;
  try { target = new URL(raw, self.registration.scope).href; } catch (e) { target = self.registration.scope; }
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of all) {
      try {
        // Best-effort deep link: navigate the open tab when the platform
        // allows it (iOS may refuse navigate and just focus — the app
        // then opens to wherever it was, not the pushed route).
        if ("navigate" in client) await client.navigate(target);
        await client.focus();
        return;
      } catch (e) { /* try the next client */ }
    }
    try { await clients.openWindow(target); } catch (e) { /* iOS may refuse: app opens to home */ }
  })());
});
