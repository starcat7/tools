const CACHE = 'handwritez-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
  // アイコンもキャッシュしたければ追加
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{
      // 同一オリジンのGETだけ静的キャッシュ
      try{
        if (req.method==='GET' && new URL(req.url).origin===location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(req, clone));
        }
      }catch(_){}
      return res;
    }).catch(()=>hit))
  );
});
