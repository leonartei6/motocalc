// ============================================
// Service Worker - MotoCalc
// Faz o app funcionar offline
// ============================================

const CACHE_NAME = 'motocalc-v1';
const ARQUIVOS_PARA_CACHEAR = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Bibliotecas externas (CDN)
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// 1) INSTALAÇÃO: baixa todos os arquivos pro cache
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando arquivos...');
      return cache.addAll(ARQUIVOS_PARA_CACHEAR);
    })
  );
  self.skipWaiting();
});

// 2) ATIVAÇÃO: limpa caches antigos quando atualiza
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then((nomesCache) => {
      return Promise.all(
        nomesCache.map((nome) => {
          if (nome !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', nome);
            return caches.delete(nome);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3) FETCH: intercepta requisições e serve do cache se offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      // Se achou no cache, retorna
      if (respostaCache) {
        return respostaCache;
      }
      // Senão, busca na rede e adiciona ao cache
      return fetch(event.request).then((respostaRede) => {
        // Só cacheia respostas OK
        if (!respostaRede || respostaRede.status !== 200) {
          return respostaRede;
        }
        const respostaClone = respostaRede.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, respostaClone);
        });
        return respostaRede;
      }).catch(() => {
        // Se falhou tudo (offline e não tinha no cache)
        return new Response('Você está offline e este conteúdo não foi cacheado.', {
          status: 503,
          statusText: 'Offline'
        });
      });
    })
  );
});