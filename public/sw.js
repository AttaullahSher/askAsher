/**
 * Kill-switch service worker.
 *
 * The previous site that lived at this URL registered a caching service worker
 * at this exact path. Browsers that still have it installed would keep serving
 * its cached shell. This replaces it, drops its caches, unregisters itself and
 * reloads any window it controls — after which no service worker is involved
 * in this origin at all.
 *
 * Safe to delete once the old install base has aged out.
 */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('ask-')).map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) client.navigate(client.url);
    })(),
  );
});
