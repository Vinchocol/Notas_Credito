const V = "nc-v2";
const JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", JSPDF];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(FILES.map(f => c.add(new Request(f, {cache:"reload"})).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const same = new URL(e.request.url).origin === location.origin;
  const net = () => fetch(e.request).then(r => { const copy = r.clone(); caches.open(V).then(c => c.put(e.request, copy)); return r; });
  e.respondWith(same
    ? net().catch(() => caches.match(e.request).then(h => h || caches.match("index.html")))
    : caches.match(e.request).then(h => h || net()));
});
