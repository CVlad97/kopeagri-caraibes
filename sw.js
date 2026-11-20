// KopéAgri Caraïbes — Service Worker for offline support
const CACHE_NAME = 'kopeagri-v3'
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

// Never serve a stale HTML shell or an outdated JS/CSS bundle after a deploy.
// Hashed assets can be cached only after the network has confirmed their URL.
self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  const isHtml = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')
  const isBundle = /\.(?:js|css)$/.test(url.pathname)
  if (isHtml || isBundle) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone()
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)))
      }
      return response
    }).catch(async () => (await caches.match(request)) || Response.error()))
    return
  }
  if (/\.(?:png|jpe?g|webp|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone()
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)))
      }
      return response
    })))
  }
})
