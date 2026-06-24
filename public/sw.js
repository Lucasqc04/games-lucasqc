const CACHE_NAME = "lucasqc-games-cache-v7";
const STATIC_CACHE = "lucasqc-games-static-v7";
const CORE_URLS = [
  "/",
  "/jogos",
  "/estatisticas",
  "/manifest.webmanifest",
  "/offline-manifest.json",
  "/favicon.svg",
  "/lucasqc-games-logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => ![CACHE_NAME, STATIC_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data?.type === "CACHE_OFFLINE_ROUTES") {
    event.waitUntil(prepareOffline(event.ports?.[0]));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, CACHE_NAME, caches.match("/") ));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
});

async function prepareOffline(port) {
  const cache = await caches.open(CACHE_NAME);
  const staticCache = await caches.open(STATIC_CACHE);
  const manifestResponse = await fetch("/offline-manifest.json", { cache: "no-store" });
  const manifest = await manifestResponse.json();
  const urls = uniqueUrls([...CORE_URLS, ...(manifest.assets || []), ...(manifest.routes || [])]);
  let done = 0;
  const failed = [];
  const discoveredStatic = new Set();

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

      await cache.put(url, response.clone());

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const html = await response.text();
        extractNextStaticUrls(html).forEach((asset) => discoveredStatic.add(asset));
      }
    } catch (error) {
      failed.push(url);
    } finally {
      done += 1;
      port?.postMessage({ type: "PROGRESS", done, total: urls.length, url });
    }
  }

  let staticDone = 0;
  const staticUrls = [...discoveredStatic];
  for (const asset of staticUrls) {
    try {
      const response = await fetch(asset, { cache: "reload" });
      if (response.ok) await staticCache.put(asset, response);
    } catch (error) {
      failed.push(asset);
    } finally {
      staticDone += 1;
      port?.postMessage({ type: "STATIC_PROGRESS", done: staticDone, total: staticUrls.length, url: asset });
    }
  }

  port?.postMessage({
    type: "DONE",
    done,
    total: urls.length,
    staticDone,
    staticTotal: staticUrls.length,
    failed
  });
}

function extractNextStaticUrls(html) {
  const matches = html.match(/\/_next\/static\/[^"'<> )]+/g) || [];
  return uniqueUrls(matches.map((item) => item.replaceAll("&amp;", "&")));
}

function uniqueUrls(urls) {
  return [...new Set(urls.map((url) => new URL(url, self.location.origin).pathname + new URL(url, self.location.origin).search))];
}

function isStaticAsset(pathname) {
  return /\.(?:png|jpg|jpeg|webp|gif|svg|ico|css|js|woff2?|json|webmanifest)$/i.test(pathname);
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, fallbackPromise) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await fallbackPromise;
    if (fallback) return fallback;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
