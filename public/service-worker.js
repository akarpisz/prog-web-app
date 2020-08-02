const TO_CACHE = [
    "/",
    "/idb.js",
    "/index.html",
    "/styles.css",
    "/mani.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];
  
  const CACHE_NAME = "static-cache";
  const DATA_CACHE_NAME = "data-cache";
  

self.addEventListener("install", function(ev) {
    ev.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Pre-cache successful");
        return cache.addAll(TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  self.addEventListener("activate", function(ev) {
    ev.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  

  self.addEventListener("fetch", function(ev) {
    if (ev.request.url.includes("/api/")) {
      ev.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(ev.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(ev.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              console.log(err);
              return cache.match(ev.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    ev.respondWith(
      caches.match(ev.request).then(function(response) {
        return response || fetch(ev.request);
      })
    );
  });
  