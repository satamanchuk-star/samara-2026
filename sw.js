/* SMR-26 service worker — network-first, чтобы контент был свежим, с офлайн-фолбэком из кэша. */
var CACHE = 'smr26-v12';
var SHELL = ['/', '/index.html', '/gallery.html', '/map.html', '/crew.html', '/enhance.js?v=12',
  '/vendor/react.production.min.js', '/vendor/react-dom.production.min.js',
  '/vendor/leaflet/leaflet.js', '/vendor/leaflet/leaflet.css', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-180.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function(){}); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // загрузки/список галереи и сторонние домены — всегда из сети
  if (url.pathname.indexOf('/api/') === 0 || url.pathname.indexOf('/uploads/') === 0) return;
  if (url.origin !== location.origin) return;

  var isNav = req.mode === 'navigate' || req.destination === 'document';
  // stale-while-revalidate: мгновенно из кэша, обновление в фоне.
  // Для навигаций игнорируем query (gallery.html?type=… берётся из кэша '/gallery.html').
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: isNav }).then(function (cached) {
        var fetching = fetch(req).then(function (res) {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        }).catch(function () { return cached || cache.match('/'); });
        return cached || fetching;
      });
    })
  );
});
