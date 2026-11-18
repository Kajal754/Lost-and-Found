const CACHE_KEY = "lost-found-geocode-cache-v1";

let requestQueue = Promise.resolve();
let lastRequestAt = 0;
const pendingRequests = new Map();
const memoryCache = new Map();

function normalizeLocation(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[,\s]+/g, " ")
    .trim();
}

function loadCache() {
  if (typeof window === "undefined") return {};
  try {
    const cache = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
    return cache && typeof cache === "object" && !Array.isArray(cache) ? cache : {};
  } catch {
    return {};
  }
}

function getCachedPlace(key) {
  const cached = memoryCache.get(key) || loadCache()[key];
  if (
    !cached ||
    !Number.isFinite(Number(cached.lat)) ||
    !Number.isFinite(Number(cached.lng)) ||
    Math.abs(Number(cached.lat)) > 90 ||
    Math.abs(Number(cached.lng)) > 180
  ) {
    return null;
  }
  const place = { ...cached, lat: Number(cached.lat), lng: Number(cached.lng) };
  memoryCache.set(key, place);
  return place;
}

function storePlace(key, place) {
  memoryCache.set(key, place);
  if (typeof window === "undefined") return;
  try {
    const cache = loadCache();
    cache[key] = place;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Geocoding still works when browser storage is unavailable.
  }
}

function throwAbortError() {
  const error = new Error("Location request was cancelled");
  error.name = "AbortError";
  return error;
}

function fetchJson(url, signal) {
  const request = requestQueue.then(async () => {
    if (signal?.aborted) throw throwAbortError();

    const delay = Math.max(1100 - (Date.now() - lastRequestAt), 0);
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (signal?.aborted) throw throwAbortError();
    lastRequestAt = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Location service returned ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  });
  requestQueue = request.catch(() => null);
  return request;
}

function toPlace(result) {
  const lat = Number(result?.lat);
  const lng = Number(result?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return {
    lat,
    lng,
    display_name: result.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    address: result.address || {},
  };
}

function buildUrl(base, parameters) {
  const url = new URL(base);
  url.search = new URLSearchParams(parameters).toString();
  return url.toString();
}

function searchVariants(query) {
  const normalized = String(query || "").replace(/[,\s]+/g, " ").trim();
  if (!normalized) return [];
  const words = normalized.split(" ");
  const variants = [normalized];
  if (words.length > 3) {
    for (let index = 1; index < words.length - 1; index += 1) {
      variants.push(words.filter((_, wordIndex) => wordIndex !== index).join(" "));
    }
  }
  if (words.length > 2) variants.push(words.slice(0, -1).join(" "));
  return [...new Set(variants)].slice(0, 5);
}

function photonPlaces(data) {
  return (data?.features || [])
    .map((feature) => {
      const [lng, lat] = feature.geometry?.coordinates || [];
      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180
      ) {
        return null;
      }
      const properties = feature.properties || {};
      const displayName = [
        properties.name,
        properties.street,
        properties.city,
        properties.state,
        properties.country,
      ]
        .filter(Boolean)
        .join(", ");
      return {
        lat,
        lng,
        display_name: displayName || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        address: properties,
      };
    })
    .filter(Boolean);
}

export async function searchLocationSuggestions(query, { signal } = {}) {
  const cleanQuery = String(query || "").trim();
  if (cleanQuery.length < 3) return [];

  let providerResponded = false;
  let lastError;
  try {
    const data = await fetchJson(
      buildUrl("https://nominatim.openstreetmap.org/search", {
        q: cleanQuery,
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
      }),
      signal
    );
    providerResponded = true;
    const places = (data || []).map(toPlace).filter(Boolean);
    if (places.length) return places;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    lastError = error;
  }

  try {
    const data = await fetchJson(
      buildUrl("https://photon.komoot.io/api/", {
        q: cleanQuery,
        limit: "5",
        lang: "en",
      }),
      signal
    );
    providerResponded = true;
    const places = photonPlaces(data);
    if (places.length) return places;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    lastError = error;
  }

  if (!providerResponded && lastError) {
    throw new Error("Location search is temporarily unavailable. You can still drop a pin on the map.");
  }
  return [];
}

export async function geocodeLocation(query) {
  const key = normalizeLocation(query);
  if (!key) return null;
  const cached = getCachedPlace(key);
  if (cached) return cached;

  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const request = (async () => {
    let providerResponded = false;
    let lastError;
    for (const candidate of searchVariants(query)) {
      try {
        const data = await fetchJson(
          buildUrl("https://nominatim.openstreetmap.org/search", {
            q: candidate,
            format: "jsonv2",
            addressdetails: "1",
            limit: "1",
          })
        );
        providerResponded = true;
        const place = toPlace(data?.[0]);
        if (place) {
          storePlace(key, place);
          return place;
        }
      } catch (error) {
        lastError = error;
      }
    }

    try {
      const data = await fetchJson(
        buildUrl("https://photon.komoot.io/api/", {
          q: String(query).trim(),
          limit: "5",
          lang: "en",
        })
      );
      providerResponded = true;
      const place = photonPlaces(data)[0];
      if (place) {
        storePlace(key, place);
        return place;
      }
    } catch (error) {
      lastError = error;
    }

    if (!providerResponded && lastError) {
      throw new Error("Location search is temporarily unavailable. Try again or drop a pin.");
    }
    return null;
  })();

  pendingRequests.set(key, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(key);
  }
}

export async function reverseGeocodeLocation(lat, lng) {
  if (
    !Number.isFinite(Number(lat)) ||
    !Number.isFinite(Number(lng)) ||
    Math.abs(Number(lat)) > 90 ||
    Math.abs(Number(lng)) > 180
  ) {
    throw new Error("Selected map coordinates are invalid.");
  }

  let lastError;
  try {
    const data = await fetchJson(
      buildUrl("https://nominatim.openstreetmap.org/reverse", {
        lat: String(lat),
        lon: String(lng),
        format: "jsonv2",
        addressdetails: "1",
        zoom: "18",
      })
    );
    if (data?.display_name) return toPlace(data);
  } catch (error) {
    lastError = error;
  }

  try {
    const data = await fetchJson(
      buildUrl("https://photon.komoot.io/reverse", {
        lat: String(lat),
        lon: String(lng),
        lang: "en",
      })
    );
    const place = photonPlaces(data)[0];
    if (place) return place;
  } catch (error) {
    lastError = error;
  }

  if (lastError) {
    throw new Error("Could not resolve an address for this pin. The coordinates are still selected.");
  }
  throw new Error("No address was found for this pin. Try moving it to a nearby street.");
}
