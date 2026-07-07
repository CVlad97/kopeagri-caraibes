// KopéAgri Caraïbes — Service Worker for offline support
const CACHE_NAME = 'kopeagri-v1'
const STATIC_ASSETS = [
  '/kopeagri-caraibes/',
  '/kopeagri-caraibes/index.html',
  '/kopeagri-caraibes/icon-192.svg',
  '/kopeagri-caraibes/icon-512.svg',
]

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: cache-first for CSS/JS/images, network-first for HTML/API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Network-first for HTML pages
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // Cache-first for static assets (CSS, JS, images, fonts)
  if (
    url.pathname.match(/\.(css|js|png|jpg|svg|ico|woff2?|ttf|eot)$/) ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'unpkg.com'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
