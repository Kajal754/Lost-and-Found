"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // A service worker can serve stale Next.js chunks during development and
    // leave the browser running code that no longer matches the source tree.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {});
      if ("caches" in window) {
        caches.keys()
          .then((keys) => Promise.all(keys.filter((key) => key.startsWith("lost-and-found-")).map((key) => caches.delete(key))))
          .catch(() => {});
      }
      return;
    }

    function registerServiceWorker() {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "✅ Service Worker registered:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error(
            "❌ Service Worker registration failed:",
            error
          );
        });
    }

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker, { once: true });

    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}
