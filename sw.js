/* Ápex · service worker: la app abre sin internet.
   - Archivos propios (HTML, CSS, JS): primero la red (para recibir cambios al instante), si falla, la copia guardada.
   - Librerías y fuentes de CDN (con versión fija): copia guardada primero y se renueva en segundo plano.
   - Supabase (datos y acceso) nunca pasa por aquí: lo maneja la app con su propia cola. */
const V = 'apex-v26';
const CORE = ['./', 'index.html', 'css/app.css', 'css/ios.css', 'css/hoy.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/favicon-32.png',
  'js/datos.js', 'js/banco.js', 'js/plan.js', 'js/modulos.js', 'js/bienestar.js', 'js/vistas.js', 'js/lumbar.js', 'js/rutinas.js', 'js/rehabdep.js', 'js/servidor.js',
  'js/fase1.js', 'js/revision.js', 'js/bancoui.js', 'js/exportar.js', 'js/vivo.js', 'js/chequeo.js', 'js/panel.js', 'js/push.js', 'js/offline.js', 'js/movil.js', 'js/hoy.js', 'js/adherencia.js', 'js/portal.js', 'js/frases.js', 'js/portada.js', 'js/acceso.js', 'js/atras.js', 'js/inicio.js'];
const CDN = /^(https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com))\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(new Request(u, {cache: 'reload'})).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function timeout(p, ms){ return new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); }); }); }
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/supabase\.co$/.test(url.hostname)) return;
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(V);
      try {
        const res = await timeout(fetch(req), 4000);
        if (res && res.ok) cache.put(req.mode === 'navigate' ? 'index.html' : req, res.clone());
        return res;
      } catch (err) {
        const hit = await cache.match(req.mode === 'navigate' ? 'index.html' : req, {ignoreSearch: true});
        return hit || (req.mode === 'navigate' ? cache.match('./') : Response.error());
      }
    })());
    return;
  }
  if (CDN.test(req.url)) {
    e.respondWith((async () => {
      const cache = await caches.open(V), hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
  }
});

/* Notificaciones push */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = {body: e.data && e.data.text()}; }
  e.waitUntil(self.registration.showNotification(d.title || 'Ápex', {
    body: d.body || '', tag: d.tag, renotify: !!d.tag, icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png',
    data: {url: d.url || self.registration.scope}
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil((async () => {
    const all = await clients.matchAll({type: 'window', includeUncontrolled: true});
    const c = all.find(w => w.url.startsWith(self.registration.scope));
    if (c) { await c.focus(); if (url !== c.url) c.navigate(url).catch(() => {}); return; }
    return clients.openWindow(url);
  })());
});
