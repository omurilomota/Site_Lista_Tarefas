const CACHE_NAME = 'tarefas-v1';
const urlsToCache = [
  '../html/',                    // página inicial
  '../css/style.css',            // CSS
  '../js/script.js',             // JS
  '../json/manifest.json',       // manifesto
  '../json/icone-192.png',       // ícone 192
  '../json/icone-512.png'        // ícone 512
];

// Instala o service worker e armazena os arquivos em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Responde às requisições com o cache (funciona offline!)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});