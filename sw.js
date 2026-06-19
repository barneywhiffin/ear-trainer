const CACHE = "ear-trainer-v1";

const FILES = [
  "/",
  "/index.html",
  "/css/style.css",
  "/src/main.js",
  "/src/elements.js",
  "/src/pink-noise.js",
  "/src/utils.js",
  "/pages/eq-game.html",
  "/pages/freqs-game.html",
  "/pages/account.html",
  "/pages/scores.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});