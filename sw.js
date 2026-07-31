/* sw.js — makes ASK open offline. Never touches model or image traffic. */
const VERSION = 'ask-v7';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/js/store.js',
  './assets/js/providers.js',
  './assets/js/memory.js',
  './assets/js/lang.js',
  './assets/js/lookup.js',
  './assets/js/keys.js',
  './assets/js/help.js',
  './assets/js/voice.js',
  './assets/js/images.js',
  './assets/js/onboarding.js',
  './assets/js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[sw] shell cache incomplete', err))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Models and image generation always go to the network, and are never cached.
  const passthrough = /(\/v1\/|api\.|integrate\.api|pollinations\.ai|openrouter\.ai|localhost:11434)/.test(url.href);
  if (passthrough) return;

  // Navigations: network first so updates land, cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Own assets and fonts: cache first, refreshed in the background.
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res.ok && (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(url.host))) {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
