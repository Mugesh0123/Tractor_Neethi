const CACHE = "tractor-calc-v19";
const FILES = [
  "./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if(cached) return cached;
      return fetch(e.request).then((response) => {
        // keep future loads working offline for anything fetched successfully at runtime
        if(response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
