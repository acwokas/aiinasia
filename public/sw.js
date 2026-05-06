// Kill-switch service worker.
// Replaces any older SW that may have been deployed, drops all caches,
// and then steps out of the way so the browser handles every network
// request natively.
//
// IMPORTANT: do NOT add a 'fetch' listener here. With no fetch listener,
// the browser handles all requests natively (which is what a true
// kill-switch wants). A pass-through fetch handler such as
//   self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));
// is NOT a no-op: it makes the SW responsible for every request, and
// re-fetches via SW context fail for keepalive beacons and some
// cross-origin requests, silently dropping analytics pings, PWA
// manifest fetches, ad-network configs, etc.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
      await self.clients.claim();
      });
      
