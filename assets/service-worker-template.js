var cacheName = 'hugo-nuo-v7';
var filesToCache = [
    '{{ "404.html" | absURL }}',
    '{{ "favicon.ico" | absURL }}',
    '{{ "manifest.json" | absURL }}',
    '{{ "icons/icon-16x16.png" | absURL }}',
    '{{ "icons/icon-32x32.png" | absURL }}',
    '{{ "icons/icon-128x128.png" | absURL }}',
    '{{ "icons/icon-144x144.png" | absURL }}',
    '{{ "icons/icon-152x152.png" | absURL }}',
    '{{ "icons/icon-192x192.png" | absURL }}',
    '{{ "icons/icon-256x256.png" | absURL }}',
    '{{ "icons/icon-512x512.png" | absURL }}',
    '{{ "images/avatar.png" | absURL }}',
    '{{ "images/grey-prism.svg" | absURL }}',
{{ $style := resources.Get "styles/main.scss" | resources.ExecuteAsTemplate "styles/main-rendered.scss" . | resources.ToCSS | resources.Minify }}
    '{{ $style.Permalink }}',
{{ with .Site.Params.customStyle }}
{{ $customStyle := resources.Get (.Site.Params.customStyle | default "styles/custom.scss") | resources.ToCSS | resources.Minify }}
    '{{ $customStyle.Permalink }}',
{{ end }}
{{ $scriptsindexjs := resources.Get "scripts/index.js" | resources.Minify }}
    '{{ $scriptsindexjs.Permalink }}',
{{ $pswpinitjs := resources.Get "scripts/pswp-init.js" | resources.Minify }}
    '{{ $pswpinitjs.Permalink }}',

    // Google fonts (local)
    '{{ "fonts/lobster.woff2" | absURL }}',

    {{ with .Site.Params.fontAwesome }}
    // FontAwesome
    'https://use.fontawesome.com/releases/v5.7.2/css/all.css',
    {{ else }}
    {{ with .Site.Params.icofont }}
    {{ $icofontmincss := resources.Get "styles/icofont.min.css" | resources.ToCSS | resources.Minify }}
    '{{ $icofontmincss.Permalink }}',
    '{{ "fonts/icofont.woff2" | absURL }}',
    {{ else }}
    // Iconfont
    'https://at.alicdn.com/t/font_174169_qmgvd10zwbf.woff',
    {{ end }}
    {{ end }}

    // MathJax
{{ $mathjaxjs := resources.Get "cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js" | resources.Minify | fingerprint }}
    '{{ $mathjaxjs.Permalink }}',
    '{{ path.Join (path.Dir $mathjaxjs.RelPermalink) "extensions/MathMenu.js" | absURL }}',
    '{{ path.Join (path.Dir $mathjaxjs.RelPermalink) "extensions/MathZoom.js" | absURL }}',
];

// Cache the application assets
self.addEventListener('install', event => {
    event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(filesToCache)));
});

// network first
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName).then(function(cache) {
            return fetch(event.request)
                .then(function(response) {
                    if (response.status === 404) return caches.match('404.html');
                    cache.put(event.request, response.clone());
                    return response;
                })
                .catch(function() {
                    return caches.match(event.request);
                });
        }),
    );
});

// cache-first
// If you want to use cache first, you should change cacheName manually

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches
//       .match(event.request)
//       .then(response => {
//         if (response) return response;
//         return fetch(event.request);
//       })
//       .then(response => {
//         if (response.status === 404) return caches.match('404.html');
//         return caches.open(cacheName).then(cache => {
//           cache.put(event.request.url, response.clone());
//           return response;
//         });
//       })
//       .catch(error => console.log('Error, ', error)),
//   );
// });

// Delete outdated caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [cacheName];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                }),
            );
        }),
    );
});
