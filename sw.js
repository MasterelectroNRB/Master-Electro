// Service Worker - Master Electro Catalogue
// يخزن الكتالوغ في جهاز الزبون باش يفتح بدون انترنت بعد أول زيارة

const CACHE_NAME = 'master-electro-catalogue-v1'; // غيّر الرقم (v1 -> v2) كل مرة تحدث فيها الكتالوغ

const FILES_TO_CACHE = [
  './',
  './index.html'
];

// عند تثبيت الـ Service Worker: يخزن الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// عند التفعيل: يمسح أي نسخة قديمة من الكاش (تحدث تلقائي عند نشر v2 مثلاً)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// عند كل طلب: يجرب يجيب من النت أولاً (باش ياخذ آخر تحديث إذا فيه نت)
// وإذا ما فيه نت، يرجع النسخة المخزنة محلياً
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // نجح الاتصال بالنت: نحدث النسخة المخزنة بأحدث نسخة
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // ما فيه نت: نرجع النسخة المخزنة محلياً
        return caches.match(event.request);
      })
  );
});
