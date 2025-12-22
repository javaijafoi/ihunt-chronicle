export function clearServiceWorkersAndCaches() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      )
      .catch(() => undefined);
  }

  if ("caches" in window) {
    caches
      .keys()
      .then((cacheKeys) => Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey))))
      .catch(() => undefined);
  }
}
