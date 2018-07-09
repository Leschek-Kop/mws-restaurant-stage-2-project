const version = 'v1';
const staticCachName = 'restaurant-local'+version;
const contentImgsCache = 'restaurant-imgs-'+version;
const contentCache = 'restaurant-web-'+version;

/**
* Install Service Worker.
 */
self.addEventListener('install', (event) => {
    const urlToCache = [
        '/',
        'sw.js',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'css/styles.css',
        'data/restaurants.json'
    ];
    event.waitUntil(
        caches.open(staticCachName).then((cache) => {
            return cache.addAll(urlToCache);
        })
    );
});

/**
* fetch events.
 */
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    if(requestUrl.origin === location.origin){
        if(requestUrl.pathname.startsWith('/img/')){
            event.respondWith(servePhoto(event.request));
            return;
        }
    }
    if (event.request.url.indexOf('https://') == 0) {
        event.respondWith(
            serveContent(event.request)
        );
    } else {
        event.respondWith(
            serveSide(event.request)
        );
    }
});

/**
* handle restaurant-imgs cache.
 */
servePhoto = (request)  => {
    const imgKey = '/img/';
    const posImg = request.url.indexOf(imgKey);
    const storageUrl = request.url.slice(0, posImg + imgKey.length + 1);
    return caches.open(contentImgsCache).then((cache) => {
        return cache.match(storageUrl).then((response) => {
            if (response) return response;

            return fetch(request).then((networkResponse) => {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}

/**
* handle restaurant-web cache.
 */
serveContent = (request) => {
    const storageUrl = request.url;
    return caches.open(contentCache).then((cache) => {
        return cache.match(storageUrl).then((response) => {
            if (response) return response;

            return fetch(request).then((networkResponse) => {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}

/**
* handle restaurant-local cache.
 */
serveSide = (request) => {
    var storageUrl = request.url;
    if(request.url.indexOf('?') != -1){
        storageUrl = storageUrl.slice(0, request.url.indexOf('?'));
    }
    return caches.open(staticCachName).then((cache) => {
        return cache.match(storageUrl).then((response) => {
            if (response) return response;

            return fetch(request).then((networkResponse) => {
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}