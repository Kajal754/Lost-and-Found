"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api } from "../../lib/api";
import {
  geocodeLocation,
  reverseGeocodeLocation,
  searchLocationSuggestions,
} from "../../lib/geocoding";

const RADII = [0.5, 1, 2, 5, 10, 25];
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

function getCoordinates(value) {
  if (!value || value.latitude == null || value.longitude == null) return null;
  const lat = Number(value.latitude);
  const lng = Number(value.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return { lat, lng };
}

function kmBetween(a, b) {
  const rad = (number) => (number * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  const boundedH = Math.min(1, Math.max(0, h));
  return 6371 * 2 * Math.atan2(Math.sqrt(boundedH), Math.sqrt(1 - boundedH));
}

function formatDistance(distance) {
  if (distance == null) return "Distance unavailable";
  return distance < 1
    ? `${Math.round(distance * 1000)} m away`
    : `${distance.toFixed(1)} km away`;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function locationKey(value) {
  return normalizeText(value);
}

function createPinIcon(leaflet, color) {
  return leaflet.divIcon({
    className: "",
    html: `<svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true"><path d="M16 41S2 25.8 2 16a14 14 0 1 1 28 0c0 9.8-14 25-14 25Z" fill="${color}" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="white"/></svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}

function getItemStatus(item) {
  return String(item.status || "").toLowerCase();
}

function getItemImage(item) {
  return item.images?.[0] || item.image || "";
}

function getSimilarityScore(lostItem, foundItem) {
  const lostCategory = normalizeText(lostItem.category);
  const foundCategory = normalizeText(foundItem.category);
  const categoriesMatch = lostCategory && lostCategory === foundCategory;
  const ignoredWords = new Set(["a", "an", "the", "lost", "found", "item"]);
  const tokens = (item) =>
    new Set(
      String(item.title || "")
        .split(/\s+/)
        .map(normalizeText)
        .filter((word) => word && !ignoredWords.has(word))
    );
  const lostTokens = tokens(lostItem);
  const foundTokens = tokens(foundItem);
  const overlap = [...lostTokens].filter((word) => foundTokens.has(word)).length;
  const union = new Set([...lostTokens, ...foundTokens]).size;
  const titleSimilarity = union ? overlap / union : 0;
  if (titleSimilarity < 0.2) return 0;
  return Math.min(100, Math.round((categoriesMatch ? 60 : 0) + titleSimilarity * 40));
}

function createPopup(item, distance) {
  const popup = document.createElement("div");
  popup.style.minWidth = "180px";

  const imageSource = getItemImage(item);
  if (imageSource) {
    const image = document.createElement("img");
    image.src = imageSource;
    image.alt = item.title || "Reported item";
    image.style.cssText = "width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px";
    popup.appendChild(image);
  }

  const type = document.createElement("strong");
  type.textContent = `${item.itemType} item`;
  type.style.color = item.itemType === "Lost" ? "#dc2626" : "#15803d";
  popup.appendChild(type);

  const title = document.createElement("div");
  title.textContent = item.title || "Untitled report";
  title.style.cssText = "font-weight:700;margin-top:3px";
  popup.appendChild(title);

  const description = document.createElement("div");
  description.textContent = item.description || item.category || "";
  description.style.cssText = "margin-top:4px;max-height:54px;overflow:hidden";
  popup.appendChild(description);

  const location = document.createElement("div");
  location.textContent = `${item.location || "Location not provided"} · ${formatDistance(distance)}`;
  location.style.cssText = "margin-top:5px;color:#475569;font-size:12px";
  popup.appendChild(location);

  const reportDate = item.lostDate || item.foundDate;
  if (reportDate) {
    const date = document.createElement("div");
    date.textContent = `Reported ${new Date(reportDate).toLocaleDateString()}`;
    date.style.cssText = "margin-top:4px;color:#475569;font-size:12px";
    popup.appendChild(date);
  }

  const details = document.createElement("a");
  details.href = item.qrToken
    ? `/recover/${encodeURIComponent(item.qrToken)}`
    : item.itemType === "Lost"
      ? "/lost-item"
      : "/found-item";
  details.textContent = "View details";
  details.style.cssText = "margin-top:8px;color:#047857;font-weight:700;cursor:pointer";
  popup.appendChild(details);

  if (item.itemType === "Found" && item.qrToken && getItemStatus(item) === "found") {
    const claim = document.createElement("a");
    claim.href = `/recover/${encodeURIComponent(item.qrToken)}`;
    claim.textContent = " · Claim item";
    claim.style.cssText = "margin-left:8px;color:#1d4ed8;font-weight:700";
    popup.appendChild(claim);
  }
  return popup;
}

export default function NearbyPage() {
  const mapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const centerMarkerRef = useRef(null);
  const markersRef = useRef(new Map());
  const centerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [center, setCenter] = useState(null);
  const [centerLabel, setCenterLabel] = useState("");
  const [radius, setRadius] = useState(5);
  const [query, setQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mappingLocations, setMappingLocations] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [serverFilterResult, setServerFilterResult] = useState(null);
  const reverseRequestRef = useRef(0);

  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const moveToLocation = useCallback(async (coordinates, label, reverse = false) => {
    const requestId = ++reverseRequestRef.current;
    setError("");
    setCenter(coordinates);
    setCenterLabel(reverse ? "Resolving address..." : label);
    setSelectedItem(null);
    setShowSuggestions(false);
    if (!reverse) {
      setQuery(label);
      return;
    }

    try {
      const place = await reverseGeocodeLocation(coordinates.lat, coordinates.lng);
      if (requestId !== reverseRequestRef.current) return;
      setCenterLabel(place.display_name);
      setQuery(place.display_name);
    } catch (reverseError) {
      if (requestId !== reverseRequestRef.current) return;
      setCenterLabel(`${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`);
      setQuery("");
      setError(reverseError.message);
    }
  }, []);

  const reportSuggestions = useMemo(() => {
    const term = normalizeText(query);
    if (term.length < 3) return [];
    return items
      .filter((item) =>
        [item.location, item.title, item.category]
          .filter(Boolean)
          .some((value) => normalizeText(value).includes(term))
      )
      .slice(0, 4);
  }, [items, query]);

  useEffect(() => {
    const searchTerm = query.trim();
    if (searchTerm.length < 3) return undefined;

    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const places = await searchLocationSuggestions(searchTerm, {
          signal: controller.signal,
        });
        if (active) setLocationSuggestions(places);
      } catch (suggestionError) {
        if (active && suggestionError.name !== "AbortError") {
          setLocationSuggestions([]);
          setError(suggestionError.message);
        }
      } finally {
        if (active) setSuggestionsLoading(false);
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const [lostResult, foundResult] = await Promise.all([
          api.getLostItems(),
          api.getFoundItems(),
        ]);
        if (!active) return;

        const reports = [
          ...(lostResult.items || [])
            .filter((item) => !getItemStatus(item) || getItemStatus(item) === "lost")
            .map((item) => ({ ...item, itemType: "Lost" })),
          ...(foundResult.items || [])
            .filter((item) => !getItemStatus(item) || getItemStatus(item) === "found")
            .map((item) => ({ ...item, itemType: "Found" })),
        ];
        const knownLocations = new Map();
        for (const item of reports) {
          const coordinates = getCoordinates(item);
          const key = locationKey(item.location);
          if (coordinates && key) knownLocations.set(key, coordinates);
        }

        const mappedReports = reports.map((item) => {
          if (getCoordinates(item)) return item;
          const coordinates = knownLocations.get(locationKey(item.location));
          return coordinates
            ? {
                ...item,
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                approximateLocation: true,
              }
            : item;
        });
        setItems(mappedReports);
        setLoading(false);

        const locations = new Map();
        for (const item of mappedReports) {
          const key = locationKey(item.location);
          if (key && !knownLocations.has(key)) locations.set(key, item.location);
        }

        if (locations.size) setMappingLocations(true);
        for (const [key, location] of locations) {
          if (!active) return;
          let coordinates;
          try {
            coordinates = await geocodeLocation(location);
          } catch (geocodeError) {
            if (active) setError(geocodeError.message);
            continue;
          }
          if (!active) return;
          if (!coordinates) continue;

          knownLocations.set(key, coordinates);
          setItems((current) =>
            current.map((item) =>
              locationKey(item.location) === key && !getCoordinates(item)
                ? {
                    ...item,
                    latitude: coordinates.lat,
                    longitude: coordinates.lng,
                    approximateLocation: true,
                  }
                : item
            )
          );
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load item reports.");
      } finally {
        if (active) {
          setLoading(false);
          setMappingLocations(false);
        }
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const itemMarkers = markersRef.current;

    async function initializeMap() {
      if (!window.L) {
        if (!document.getElementById("leaflet-css")) {
          const css = document.createElement("link");
          css.id = "leaflet-css";
          css.rel = "stylesheet";
          css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(css);
        }

        await new Promise((resolve, reject) => {
          const existingScript = document.getElementById("leaflet-js");
          const script = existingScript || document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.addEventListener("load", resolve, { once: true });
          script.addEventListener("error", reject, { once: true });
          if (!existingScript) document.body.appendChild(script);
        });
      }

      if (cancelled || !mapNodeRef.current || mapRef.current) return;
      const L = window.L;
      const initialCenter = centerRef.current;
      const map = L.map(mapNodeRef.current).setView(
        initialCenter ? [initialCenter.lat, initialCenter.lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        initialCenter ? 13 : 5
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      map.on("click", (event) => {
        moveToLocation(
          { lat: event.latlng.lat, lng: event.latlng.lng },
          "Dropped map pin",
          true
        );
      });
      mapRef.current = map;
      setMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 0);
    }

    initializeMap().catch(() => {
      if (!cancelled) setError("Map could not load. Check your connection and refresh.");
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      centerMarkerRef.current = null;
      itemMarkers.clear();
    };
  }, [moveToLocation]);

  const reportsWithDistance = useMemo(
    () =>
      items.map((item) => {
        const coordinates = getCoordinates(item);
        const distance =
          center && coordinates ? kmBetween(center, coordinates) : null;
        return { ...item, coordinates, distance };
      }),
    [items, center]
  );

  const nearbyItems = useMemo(
    () =>
      reportsWithDistance
        .filter((item) => {
          if (!item.coordinates || (center && item.distance > radius)) return false;
          if (!center) return true;

          const filterKey = `${center.lat}:${center.lng}:${radius}`;
          const serverKeys =
            serverFilterResult?.filterKey === filterKey
              ? serverFilterResult.keys
              : null;
          return (
            !serverKeys ||
            item.approximateLocation ||
            serverKeys.has(`${item.itemType}-${item.id}`)
          );
        })
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)),
    [reportsWithDistance, center, radius, serverFilterResult]
  );

  const unmappedItems = useMemo(
    () => reportsWithDistance.filter((item) => !item.coordinates),
    [reportsWithDistance]
  );

  const possibleMatches = useMemo(() => {
    const lostItems = nearbyItems.filter((item) => item.itemType === "Lost");
    const foundItems = nearbyItems.filter((item) => item.itemType === "Found");
    const pairs = [];

    for (const lostItem of lostItems) {
      for (const foundItem of foundItems) {
        const distance = kmBetween(lostItem.coordinates, foundItem.coordinates);
        if (distance > radius) continue;
        const score = getSimilarityScore(lostItem, foundItem);
        if (score > 0) pairs.push({ lostItem, foundItem, distance, score });
      }
    }

    return pairs
      .sort((a, b) => b.score - a.score || a.distance - b.distance)
      .slice(0, 5);
  }, [nearbyItems, radius]);

  const activeFilterKey = center ? `${center.lat}:${center.lng}:${radius}` : null;
  const activeFilterResult =
    activeFilterKey && serverFilterResult?.filterKey === activeFilterKey
      ? serverFilterResult
      : null;

  useEffect(() => {
    if (!center) return undefined;

    let active = true;
    const filterKey = `${center.lat}:${center.lng}:${radius}`;
    const timer = window.setTimeout(async () => {
      try {
        const options = { lat: center.lat, lng: center.lng, radiusKm: radius };
        const [lostResult, foundResult] = await Promise.all([
          api.getLostItems(options),
          api.getFoundItems(options),
        ]);
        if (!active) return;

        const keys = new Set([
          ...(lostResult.items || []).map((item) => `Lost-${item.id}`),
          ...(foundResult.items || []).map((item) => `Found-${item.id}`),
        ]);
        setServerFilterResult({ filterKey, keys, error: "" });
      } catch (filterError) {
        if (active) {
          setServerFilterResult({
            filterKey,
            keys: null,
            error: filterError.message || "Could not filter reports on the server.",
          });
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [center, radius]);

  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L || !mapReady) return;

    if (centerMarkerRef.current) centerMarkerRef.current.remove();
    centerMarkerRef.current = null;
    if (!center) return;

    const marker = L.marker([center.lat, center.lng], {
      draggable: true,
      icon: createPinIcon(L, "#0f766e"),
      zIndexOffset: 1000,
    }).addTo(map);
    const centerPopup = document.createElement("div");
    centerPopup.textContent = centerLabel || "Search center";
    marker.bindPopup(centerPopup);
    marker.on("dragend", (event) => {
      const point = event.target.getLatLng();
      moveToLocation({ lat: point.lat, lng: point.lng }, "Adjusted map pin", true);
    });
    centerMarkerRef.current = marker;
    return () => {
      marker.remove();
      if (centerMarkerRef.current === marker) centerMarkerRef.current = null;
    };
  }, [center, centerLabel, mapReady, moveToLocation]);

  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    for (const item of nearbyItems) {
      const { lat, lng } = item.coordinates;
      const color = item.itemType === "Lost" ? "#dc2626" : "#15803d";
      const marker = L.marker([lat, lng], {
        icon: createPinIcon(L, color),
      }).addTo(map);
      marker.bindPopup(createPopup(item, item.distance));
      marker.on("click", () => setSelectedItem(item));
      markersRef.current.set(`${item.itemType}-${item.id}`, marker);
    }
  }, [nearbyItems, mapReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!center) {
      mapRef.current.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 5);
      return;
    }
    mapRef.current.flyTo([center.lat, center.lng], 17);
  }, [center]);

  function focusItem(item) {
    setSelectedItem(item);
    if (!item.coordinates || !mapRef.current) return;
    mapRef.current.flyTo([item.coordinates.lat, item.coordinates.lng], 15);
    const marker = markersRef.current.get(`${item.itemType}-${item.id}`);
    if (marker) window.setTimeout(() => marker.openPopup(), 250);
  }

  async function selectReportSuggestion(item) {
    setSearching(true);
    setShowSuggestions(false);
    setError("");
    try {
      const coordinates = getCoordinates(item) || await geocodeLocation(item.location);
      if (!coordinates) {
        throw new Error("This report does not have a mappable location yet.");
      }

      const updatedItem = {
        ...item,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        approximateLocation: item.approximateLocation || !getCoordinates(item),
        distance: 0,
      };
      setItems((current) =>
        current.map((entry) =>
          entry.itemType === item.itemType && entry.id === item.id ? updatedItem : entry
        )
      );
      await moveToLocation(coordinates, item.location || item.title);
      setSelectedItem(updatedItem);
    } catch (selectionError) {
      setError(selectionError.message || "Could not locate this report.");
    } finally {
      setSearching(false);
    }
  }

  function selectPlaceSuggestion(place) {
    setShowSuggestions(false);
    moveToLocation(
      { lat: place.lat, lng: place.lng },
      place.display_name
    );
  }

  async function searchPlace(event) {
    event.preventDefault();
    setError("");
    const cleanQuery = query.trim();
    if (!cleanQuery || searching) return;

    setSearching(true);
    try {
      const normalizedQuery = normalizeText(cleanQuery);
      const matchingReport = items.find((item) =>
        [item.location, item.title, item.category, item.description]
          .filter(Boolean)
          .some((value) => normalizeText(value).includes(normalizedQuery))
      );

      if (matchingReport) {
        const reportCoordinates =
          getCoordinates(matchingReport) ||
          (await geocodeLocation(matchingReport.location));
        if (reportCoordinates) {
          const updatedItem = {
            ...matchingReport,
            latitude: reportCoordinates.lat,
            longitude: reportCoordinates.lng,
            distance: 0,
            approximateLocation:
              matchingReport.approximateLocation || !getCoordinates(matchingReport),
          };
          setItems((current) =>
            current.map((item) =>
              item.itemType === matchingReport.itemType && item.id === matchingReport.id
                ? updatedItem
                : item
            )
          );
          await moveToLocation(
            reportCoordinates,
            matchingReport.location || cleanQuery
          );
          setSelectedItem(updatedItem);
          return;
        }
      }

      const place = await geocodeLocation(cleanQuery);
      if (!place) {
        throw new Error(
          "Location not found. Try a more specific address or select a place suggestion."
        );
      }
      await moveToLocation(
        { lat: place.lat, lng: place.lng },
        place.display_name || cleanQuery
      );
      setShowSuggestions(false);
    } catch (searchError) {
      setError(
        searchError.message ||
          "Location search failed. No map location was changed; choose a suggestion or drop a pin."
      );
    } finally {
      setSearching(false);
    }
  }

  async function chooseCurrentLocation(position) {
    const coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    await moveToLocation(coordinates, "Your current location", true);
  }

  function locateMe() {
    setError("");
    if (!navigator.geolocation) {
      setError("Location detection is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      chooseCurrentLocation,
      (locationError) => {
        if (locationError.code === 1) {
          setError("Location permission was denied. Allow location access in browser settings and try again.");
        } else if (locationError.code === 2) {
          setError("Your current location is unavailable. Try searching or dropping a pin.");
        } else {
          setError("Location request timed out. Try again or drop a pin on the map.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:ml-64">
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">
            <header className="mb-5">
              <h1 className="text-2xl font-bold sm:text-3xl">Nearby Lost &amp; Found</h1>
              <p className="mt-2 text-sm text-slate-500">
                Search a neighbourhood or item, use GPS, or drop and drag the map pin.
              </p>
            </header>

            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <form onSubmit={searchPlace} className="flex min-w-[220px] flex-1 gap-2">
                <div className="relative min-w-0 flex-1">
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setShowSuggestions(true);
                      if (event.target.value.trim().length < 3) {
                        setLocationSuggestions([]);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Country, city, colony, street, PIN or item"
                    className="input"
                    aria-label="Search any location or item report"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-controls="nearby-location-suggestions"
                  />
                  {showSuggestions &&
                    (suggestionsLoading || reportSuggestions.length > 0 || locationSuggestions.length > 0) && (
                      <div
                        id="nearby-location-suggestions"
                        role="listbox"
                        className="absolute left-0 right-0 top-full z-[1000] mt-1 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                      >
                        {reportSuggestions.map((item) => (
                          <button
                            key={`report-${item.itemType}-${item.id}`}
                            type="button"
                            role="option"
                            onClick={() => selectReportSuggestion(item)}
                            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-emerald-50"
                          >
                            <span className={`block text-xs font-bold ${item.itemType === "Lost" ? "text-red-700" : "text-green-700"}`}>
                              {item.itemType} report · {item.title}
                            </span>
                            <span className="block truncate text-xs text-slate-500">{item.location}</span>
                          </button>
                        ))}
                        {locationSuggestions.map((place, index) => (
                          <button
                            key={`place-${place.lat}-${place.lng}-${index}`}
                            type="button"
                            role="option"
                            onClick={() => selectPlaceSuggestion(place)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50"
                          >
                            {place.display_name}
                          </button>
                        ))}
                        {suggestionsLoading && (
                          <p className="px-3 py-2 text-xs text-slate-500">Finding locations...</p>
                        )}
                      </div>
                    )}
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="rounded-xl bg-emerald-800 px-4 text-white disabled:cursor-wait disabled:opacity-70"
                  aria-label="Search location or report"
                >
                  {searching ? "..." : <Search size={17} />}
                </button>
              </form>
              <button
                type="button"
                onClick={locateMe}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
              >
                <LocateFixed size={16} /> Use GPS
              </button>
              <label className="flex items-center gap-2 text-sm font-semibold">
                Radius
                <select
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                  className="input w-auto"
                >
                  {RADII.map((value) => (
                    <option key={value} value={value}>
                      {value < 1 ? `${value * 1000} m` : `${value} km`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && (
              <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {activeFilterResult?.error && (
              <p role="alert" className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                Server-side radius filtering failed: {activeFilterResult.error}
              </p>
            )}
            {center && (
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                <Navigation size={15} className="text-emerald-700" />
                Showing reports within {radius < 1 ? `${radius * 1000} m` : `${radius} km`} of{" "}
                <strong>{centerLabel || `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setCenter(null);
                    setCenterLabel("");
                    setSelectedItem(null);
                  }}
                  className="ml-auto text-xs font-semibold text-slate-500 underline"
                >
                  Clear location
                </button>
              </div>
            )}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
              <div
                ref={mapNodeRef}
                className="h-[460px] rounded-2xl border border-slate-200 bg-slate-100"
                aria-label="Map of nearby lost and found reports"
              />
              <section className="max-h-[460px] overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 font-bold">
                  {loading
                    ? "Loading reports..."
                    : `${nearbyItems.length} nearby report${nearbyItems.length === 1 ? "" : "s"}`}
                </h2>
                {mappingLocations && (
                  <p className="mb-3 text-xs text-slate-500">Locating reports that only have a written address...</p>
                )}
                {center && !activeFilterResult && (
                  <p className="mb-3 text-xs text-slate-500">Applying the selected radius to database reports...</p>
                )}
                {!loading && !nearbyItems.length && (
                  <p className="py-6 text-center text-sm text-slate-500">
                    {center
                      ? "No mapped reports in this radius yet. Try a wider radius or another location."
                      : "No reports with a mappable location yet. Search an area or use GPS."}
                  </p>
                )}

                {selectedItem && (
                  <article className="mb-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-start justify-between gap-2 p-3">
                      <div>
                        <p className={`text-xs font-bold uppercase ${selectedItem.itemType === "Lost" ? "text-red-700" : "text-green-700"}`}>
                          {selectedItem.itemType} report
                        </p>
                        <h3 className="mt-1 font-bold">{selectedItem.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        aria-label="Close item details"
                        className="rounded-lg p-1 text-slate-500 hover:bg-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {getItemImage(selectedItem) && (
                    <Image
                      src={getItemImage(selectedItem)}
                      alt={selectedItem.title}
                      width={640}
                      height={320}
                      unoptimized
                      className="max-h-40 w-full object-cover"
                    />
                    )}
                    <div className="space-y-1 p-3 pt-2 text-xs text-slate-600">
                      <p>{selectedItem.category} · {selectedItem.location || "Location not provided"}</p>
                      {selectedItem.description && <p className="line-clamp-3">{selectedItem.description}</p>}
                        {(selectedItem.color || selectedItem.brand) && (
                          <p>
                            {[selectedItem.color && `Color: ${selectedItem.color}`, selectedItem.brand && `Brand: ${selectedItem.brand}`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {(selectedItem.lostDate || selectedItem.foundDate) && (
                          <p>
                            Reported {new Date(selectedItem.lostDate || selectedItem.foundDate).toLocaleDateString()}
                          </p>
                        )}
                      <p>{formatDistance(selectedItem.distance)}</p>
                      {selectedItem.approximateLocation && (
                        <p className="text-amber-700">Approximate position from the written address</p>
                      )}
                      {selectedItem.itemType === "Found" &&
                        selectedItem.qrToken &&
                        getItemStatus(selectedItem) === "found" && (
                          <Link
                            href={`/recover/${encodeURIComponent(selectedItem.qrToken)}`}
                            className="mt-2 inline-flex rounded-lg bg-blue-700 px-3 py-2 font-semibold text-white"
                          >
                            View details &amp; claim
                          </Link>
                        )}
                    </div>
                  </article>
                )}

                <div className="space-y-3">
                  {nearbyItems.map((item) => (
                    <article
                      key={`${item.itemType}-${item.id}`}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={15}
                          className={item.itemType === "Lost" ? "text-red-600" : "text-green-700"}
                        />
                        <span className="text-xs font-bold uppercase">{item.itemType}</span>
                        <span className="ml-auto text-xs text-slate-500">{formatDistance(item.distance)}</span>
                      </div>
                      <h3 className="mt-1 font-semibold">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{item.category} · {item.location}</p>
                      <button
                        type="button"
                        onClick={() => focusItem(item)}
                        className="mt-2 text-xs font-semibold text-emerald-800 underline"
                      >
                        Show on map
                      </button>
                      {item.itemType === "Found" &&
                        item.qrToken &&
                        getItemStatus(item) === "found" && (
                          <Link
                            href={`/recover/${encodeURIComponent(item.qrToken)}`}
                            className="ml-3 text-xs font-semibold text-blue-700 underline"
                          >
                            Claim
                          </Link>
                        )}
                    </article>
                  ))}
                </div>

                {!!unmappedItems.length && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <h3 className="text-sm font-bold">Reports needing a more precise location ({unmappedItems.length})</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      These reports are not placed on the map because their address could not be geocoded.
                    </p>
                    {unmappedItems.map((item) => (
                      <p key={`${item.itemType}-${item.id}`} className="mt-2 text-xs text-slate-600">
                        <strong>{item.itemType}: {item.title}</strong> · {item.location}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {!!possibleMatches.length && (
              <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <h2 className="font-bold text-slate-900">Possible nearby matches</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Suggested by similar item names/categories and distance. Confirm ownership with the reporter before claiming.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {possibleMatches.map(({ lostItem, foundItem, distance, score }) => (
                    <article
                      key={`${lostItem.id}-${foundItem.id}`}
                      className="rounded-xl border border-amber-200 bg-white p-3"
                    >
                      <p className="text-xs font-bold text-amber-800">Text/category similarity {score}% · {formatDistance(distance)}</p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-red-700">Lost:</span> {lostItem.title}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className="font-semibold text-green-700">Found:</span> {foundItem.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{lostItem.category} · {lostItem.location} / {foundItem.location}</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => focusItem(foundItem)}
                          className="text-xs font-semibold text-emerald-800 underline"
                        >
                          Show found report
                        </button>
                        {foundItem.qrToken && (
                          <Link
                            href={`/recover/${encodeURIComponent(foundItem.qrToken)}`}
                            className="text-xs font-semibold text-blue-700 underline"
                          >
                            View &amp; claim
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <p className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-600" />Lost</span>
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-green-700" />Found</span>
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-teal-700" />Search pin</span>
              Click the map to drop a pin, or drag the teal pin to adjust your search center.
            </p>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
