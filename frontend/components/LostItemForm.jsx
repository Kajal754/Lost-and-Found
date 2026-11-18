"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { readImageWithHash } from "../lib/imageSimilarity";
import {
  MapPin,
  Search,
  Tag,
  CalendarDays,
  Palette,
  FileText,
  Camera,
  UploadCloud,
  Send,
  Heart,
  X,
  ChevronDown,
  Loader2,
  Map,
  Navigation,
} from "lucide-react";

function createLocationPopup(title, location) {
  const popup = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  const address = document.createElement("div");
  address.textContent = location;
  popup.append(heading, address);
  return popup;
}

export default function LostItemForm({ onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    lostDate: "",
    color: "",
    brand: "",
    image: "",
    images: [],
    imageHashes: [],
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // LOCATION
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const locationRef = useRef(null);
  const locationTimer = useRef(null);

  // INTERACTIVE MAP
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMarkerRef = useRef(null);

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "location") {
      setLocationActive(true);
      setShowSuggestions(true);
      setSelectedPlace(null);

      clearTimeout(locationTimer.current);

      if (value.trim().length < 2) {
        setLocationSuggestions([]);
        return;
      }

      locationTimer.current = setTimeout(() => {
        searchLocations(value);
      }, 450);
    }
  }

  // --------------------------------------------------
  // LOCATION FOCUS
  // --------------------------------------------------

  function handleLocationFocus() {
    setLocationActive(true);

    if (form.location.trim().length >= 2) {
      setShowSuggestions(true);
    }
  }

  // --------------------------------------------------
  // SEARCH LOCATION
  // --------------------------------------------------

  async function searchLocations(query) {
    try {
      setLocationLoading(true);

      const url =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "8",
          countrycodes: "in",
        }).toString();

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const data = await response.json();

      setLocationSuggestions(data || []);
    } catch (err) {
      console.error("Location search error:", err);
      setLocationSuggestions([]);
    } finally {
      setLocationLoading(false);
    }
  }

  // --------------------------------------------------
  // SELECT LOCATION
  // --------------------------------------------------

  function selectLocation(place) {
    setForm((prev) => ({
      ...prev,
      location: place.display_name,
    }));

    setSelectedPlace(place);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setLocationActive(true);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location detection.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const place = { lat: String(coords.latitude), lon: String(coords.longitude) };
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({ lat: place.lat, lon: place.lon, format: "jsonv2" })}`, { headers: { Accept: "application/json" } });
        const data = response.ok ? await response.json() : null;
        place.display_name = data?.display_name || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
      } catch {
        place.display_name = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
      }
      setForm((prev) => ({ ...prev, location: place.display_name }));
      setSelectedPlace(place);
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setLocationLoading(false);
      setError("");
    }, (geoError) => {
      setLocationLoading(false);
      setError(geoError.code === 1 ? "Allow location access in your browser to use GPS." : "Could not detect your location. You can select a pin on the map.");
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }

  // --------------------------------------------------
  // OUTSIDE CLICK
  // --------------------------------------------------

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      clearTimeout(locationTimer.current);
    };
  }, []);

  // --------------------------------------------------
  // IMAGE CHANGE
  // --------------------------------------------------

  function handleImageChange(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if ((form.images?.length || 0) + files.length > 5) return setError("Choose up to 5 photos total.");
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024)) return setError("Use JPG, PNG, WEBP or GIF images under 5 MB each.");
    setError("");
    Promise.all(files.map(readImageWithHash)).then((photos) => {
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...photos.map((photo) => photo.data)], imageHashes: [...(prev.imageHashes || []), ...photos.map((photo) => photo.hash)], image: prev.image || photos[0]?.data || "" }));
      setImagePreview((current) => current || photos[0]?.data || "");
    }).catch(() => setError("Could not read the selected images."));
  }

  // --------------------------------------------------
  // REMOVE IMAGE
  // --------------------------------------------------

  function removeImage() {
    setImagePreview("");

    setForm((prev) => ({
      ...prev,
      image: "",
      images: [],
      imageHashes: [],
    }));

    const fileInput = document.getElementById(
      "lost-item-image"
    );

    if (fileInput) {
      fileInput.value = "";
    }
  }

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    const latitude = Number(selectedPlace?.lat);
    const longitude = Number(selectedPlace?.lon);
    if (
      !selectedPlace ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      setError("Choose a location suggestion or click the map to place a pin before reporting this item.");
      return;
    }

    setLoading(true);

    try {
      const result = await api.createLostItem({
        ...form,
        latitude,
        longitude,
        location: selectedPlace.display_name || form.location,
      });

      setForm({
        title: "",
        category: "",
        description: "",
        location: "",
        lostDate: "",
        color: "",
        brand: "",
        image: "",
        images: [],
        imageHashes: [],
      });

      setImagePreview("");
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setSelectedPlace(null);
      setLocationActive(false);

      const fileInput = document.getElementById(
        "lost-item-image"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      setError(
        error.message || "Failed to report lost item."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // INTERACTIVE OPENSTREETMAP + LEAFLET
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    function loadLeaflet() {
      return new Promise((resolve, reject) => {
        if (window.L) {
          resolve(window.L);
          return;
        }

        const existingScript = document.getElementById(
          "lost-found-leaflet-js"
        );

        if (existingScript) {
          existingScript.addEventListener(
            "load",
            () => resolve(window.L),
            { once: true }
          );

          existingScript.addEventListener(
            "error",
            reject,
            { once: true }
          );

          return;
        }

        const script = document.createElement("script");

        script.id = "lost-found-leaflet-js";
        script.src =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;

        script.onload = () => resolve(window.L);

        script.onerror = () =>
          reject(
            new Error(
              "Map library could not be loaded."
            )
          );

        document.body.appendChild(script);
      });
    }

    function loadLeafletCss() {
      if (
        document.getElementById(
          "lost-found-leaflet-css"
        )
      ) {
        return;
      }

      const link = document.createElement("link");

      link.id = "lost-found-leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

      document.head.appendChild(link);
    }

    async function initMap() {
      try {
        loadLeafletCss();

        const L = await loadLeaflet();

        if (
          cancelled ||
          !mapContainerRef.current ||
          leafletMapRef.current
        ) {
          return;
        }

        const map = L.map(
          mapContainerRef.current,
          {
            center: [22.9734, 78.6569],
            zoom: 5,
            minZoom: 3,
            maxZoom: 19,
            zoomControl: true,
            scrollWheelZoom: true,
          }
        );

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              "&copy; OpenStreetMap contributors",
          }
        ).addTo(map);

        map.on("click", async (event) => {
          const { lat, lng } = event.latlng;

          if (leafletMarkerRef.current) {
            leafletMarkerRef.current.setLatLng([
              lat,
              lng,
            ]);
          } else {
            leafletMarkerRef.current =
              L.marker([lat, lng]).addTo(map);
          }

          leafletMarkerRef.current
            .bindPopup(
              "Getting this location..."
            )
            .openPopup();

          try {
            const url =
              "https://nominatim.openstreetmap.org/reverse?" +
              new URLSearchParams({
                lat: String(lat),
                lon: String(lng),
                format: "jsonv2",
                addressdetails: "1",
                zoom: "18",
              }).toString();

            const response = await fetch(url, {
              headers: {
                Accept: "application/json",
              },
            });

            if (!response.ok) {
              throw new Error(
                "Reverse geocoding failed"
              );
            }

            const data = await response.json();

            const displayName =
              data.display_name ||
              `${lat.toFixed(6)}, ${lng.toFixed(
                6
              )}`;

            const place = {
              lat: String(lat),
              lon: String(lng),
              display_name: displayName,
              address: data.address || {},
            };

            setForm((prev) => ({
              ...prev,
              location: displayName,
            }));

            setSelectedPlace(place);
            setLocationSuggestions([]);
            setShowSuggestions(false);
            setLocationActive(true);

            leafletMarkerRef.current
              .bindPopup(createLocationPopup("Selected location", displayName))
              .openPopup();
          } catch (err) {
            console.error(
              "Map reverse geocoding error:",
              err
            );

            const fallback = `${lat.toFixed(
              6
            )}, ${lng.toFixed(6)}`;

            setForm((prev) => ({
              ...prev,
              location: fallback,
            }));

            setSelectedPlace({
              lat: String(lat),
              lon: String(lng),
              display_name: fallback,
            });

            setLocationSuggestions([]);
            setShowSuggestions(false);
            setLocationActive(true);

            leafletMarkerRef.current
              .bindPopup(createLocationPopup("Selected coordinates", fallback))
              .openPopup();
          }
        });

        leafletMapRef.current = map;

        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (err) {
        console.error(
          "Interactive map error:",
          err
        );
      }
    }

    initMap();

    return () => {
      cancelled = true;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        leafletMarkerRef.current = null;
      }
    };
  }, []);

  // --------------------------------------------------
  // MOVE MAP TO SELECTED LOCATION
  // --------------------------------------------------

  useEffect(() => {
    if (
      !selectedPlace ||
      !leafletMapRef.current ||
      !window.L
    ) {
      return;
    }

    const lat = Number(selectedPlace.lat);
    const lon = Number(selectedPlace.lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return;
    }

    const map = leafletMapRef.current;

    map.flyTo(
      [lat, lon],
      16,
      {
        duration: 1.1,
      }
    );

    if (leafletMarkerRef.current) {
      leafletMarkerRef.current.setLatLng([
        lat,
        lon,
      ]);
    } else {
      leafletMarkerRef.current =
        window.L.marker([
          lat,
          lon,
        ]).addTo(map);
    }

    leafletMarkerRef.current
      .bindPopup(createLocationPopup("Selected location", selectedPlace.display_name))
      .openPopup();
  }, [selectedPlace]);

  // --------------------------------------------------
  // STYLES
  // --------------------------------------------------

  const labelClass = `
    block
    text-[10px]
    font-semibold
    mb-1
    text-[#5064b8]
    dark:text-[#a7b5e8]
  `;

  const inputClass = `
    w-full
    h-9
    pl-9
    pr-3
    text-[11px]
    rounded-lg
    outline-none
    transition-all

    bg-[#f8f9ff]
    dark:bg-[#142f45]

    border
    border-[#dce2ff]
    dark:border-[#31536b]

    text-[#31436f]
    dark:text-[#edf3ff]

    placeholder:text-[#9aa9c5]
    dark:placeholder:text-[#70899f]

    focus:border-[#7083ef]
    dark:focus:border-[#7187ff]

    focus:ring-2
    focus:ring-[#7183ef]/10
    dark:focus:ring-[#7183ff]/15
  `;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="w-full flex justify-center px-3 py-5">
      <div className="w-full transition-all duration-500 max-w-[1120px]">
        <div
          className="
            grid
            gap-6
            items-center
            grid-cols-1
            lg:grid-cols-[500px_minmax(0,1fr)]
          "
        >
          {/* ================================================= */}
          {/* LOST FORM */}
          {/* ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="
              relative
              w-full
              overflow-visible
              rounded-[24px]
              p-4
              sm:p-[18px]

              bg-white
              dark:bg-[#0c2437]

              border
              border-[#dfe4ff]
              dark:border-[#2c4d65]

              shadow-[0_18px_45px_rgba(79,70,229,0.13)]
              dark:shadow-[0_20px_55px_rgba(0,0,0,0.42)]

              transition-all
              duration-300
            "
          >
            {/* GLOW 1 */}

            <div
              className="
                absolute
                -top-10
                -right-8
                w-28
                h-28
                rounded-full

                bg-[#8292ff]/15
                dark:bg-[#7185ff]/10

                blur-3xl
                pointer-events-none
              "
            />

            {/* GLOW 2 */}

            <div
              className="
                absolute
                -bottom-8
                -left-8
                w-24
                h-24
                rounded-full

                bg-[#ff9dac]/10
                dark:bg-[#ff8fa5]/5

                blur-3xl
                pointer-events-none
              "
            />

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="relative flex items-center gap-3 mb-4">
              <div
                className="
                  w-11
                  h-11
                  shrink-0
                  rounded-[14px]

                  bg-gradient-to-br
                  from-[#e2e8ff]
                  to-[#f2efff]

                  dark:from-[#193d58]
                  dark:to-[#26365b]

                  flex
                  items-center
                  justify-center

                  shadow-[0_8px_20px_rgba(87,104,220,0.15)]
                  dark:shadow-[0_8px_20px_rgba(0,0,0,0.25)]
                "
              >
                <Navigation
                  size={22}
                  strokeWidth={2}
                  className="
                    text-[#5d72df]
                    dark:text-[#92a1ff]
                  "
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2
                    className="
                      text-[19px]
                      font-bold
                      leading-tight

                      text-[#263a76]
                      dark:text-[#edf3ff]
                    "
                  >
                    Report Lost Item
                  </h2>

                  <Heart
                    size={14}
                    fill="#ff94a5"
                    className="text-[#ff94a5]"
                  />
                </div>

                <p
                  className="
                    text-[10px]
                    mt-0.5
                    text-slate-500
                    dark:text-[#8ca5ba]
                  "
                >
                  Help us find your lost item
                </p>
              </div>
            </div>

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
              <div
                className="
                  mb-3
                  px-3
                  py-2
                  rounded-lg

                  bg-red-50
                  dark:bg-red-950/30

                  border
                  border-red-200
                  dark:border-red-900/50

                  text-red-600
                  dark:text-red-300

                  text-[10px]
                "
              >
                {error}
              </div>
            )}

            {/* ================================================= */}
            {/* ITEM TITLE */}
            {/* ================================================= */}

            <div className="mb-2.5">
              <label className={labelClass}>
                Item Title *
              </label>

              <div className="relative">
                <Tag
                  size={14}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    text-[#687ce5]
                    dark:text-[#91a0ff]
                  "
                />

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Black Wallet"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* ================================================= */}
            {/* CATEGORY + LOST DATE */}
            {/* ================================================= */}

            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div>
                <label className={labelClass}>
                  Category *
                </label>

                <div className="relative">
                  <Tag
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2

                      text-[#687ce5]
                      dark:text-[#91a0ff]

                      pointer-events-none
                    "
                  />

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className={`
                      ${inputClass}
                      appearance-none
                      cursor-pointer
                    `}
                  >
                    <option value="">
                      Category
                    </option>

                    <option>Wallet</option>
                    <option>Mobile</option>
                    <option>Laptop</option>
                    <option>Keys</option>
                    <option>Bag</option>
                    <option>Jewellery</option>
                    <option>Documents</option>
                    <option>Clothing</option>
                    <option>Other</option>
                  </select>

                  <ChevronDown
                    size={13}
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      -translate-y-1/2

                      text-slate-400
                      pointer-events-none
                    "
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Lost Date *
                </label>

                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2

                      text-[#687ce5]
                      dark:text-[#91a0ff]
                    "
                  />

                  <input
                    type="date"
                    name="lostDate"
                    value={form.lostDate}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* LOST LOCATION */}
            {/* ================================================= */}

            <div
              ref={locationRef}
              className="relative mb-2.5"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className={labelClass}>Lost Location *</label>
                <button type="button" onClick={useCurrentLocation} className="mb-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-[#5064b8] hover:bg-[#eaf2e9] dark:text-emerald-300 dark:hover:bg-white/5">
                  <Navigation size={12} /> Use my current location
                </button>
              </div>

              <div className="relative">
                {locationLoading ? (
                  <Loader2
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2

                      text-[#687ce5]
                      dark:text-[#91a0ff]

                      animate-spin
                    "
                  />
                ) : (
                  <MapPin
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2

                      text-[#687ce5]
                      dark:text-[#91a0ff]
                    "
                  />
                )}

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  onFocus={handleLocationFocus}
                  placeholder="Search village, city, area..."
                  required
                  autoComplete="off"
                  className={inputClass}
                />

                {form.location && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        location: "",
                      }));

                      setSelectedPlace(null);
                      setLocationSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      -translate-y-1/2

                      text-slate-400
                      hover:text-red-500

                      transition
                    "
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* LOCATION SUGGESTIONS */}

              {showSuggestions &&
                form.location.trim().length >= 2 &&
                (locationSuggestions.length > 0 ||
                  locationLoading) && (
                  <div
                    className="
                      absolute
                      z-[200]

                      left-0
                      right-0
                      top-[55px]

                      rounded-xl
                      overflow-hidden

                      bg-white
                      dark:bg-[#102b40]

                      border
                      border-[#dfe4ff]
                      dark:border-[#31536d]

                      shadow-[0_16px_35px_rgba(30,41,100,0.16)]
                      dark:shadow-[0_16px_35px_rgba(0,0,0,0.38)]
                    "
                  >
                    <div
                      className="
                        px-3
                        py-2

                        bg-[#f7f8ff]
                        dark:bg-[#132f45]

                        border-b
                        border-[#edf0ff]
                        dark:border-[#294960]
                      "
                    >
                      <div className="flex items-center gap-1.5">
                        <Search
                          size={11}
                          className="
                            text-[#6477dc]
                            dark:text-[#9ba9ff]
                          "
                        />

                        <span
                          className="
                            text-[9px]
                            font-semibold

                            text-[#5265bd]
                            dark:text-[#a5b2ed]
                          "
                        >
                          Matching locations
                        </span>
                      </div>
                    </div>

                    {locationLoading && (
                      <div
                        className="
                          px-3
                          py-4
                          text-center
                          text-[10px]

                          text-slate-500
                          dark:text-[#8da4b8]
                        "
                      >
                        Finding locations...
                      </div>
                    )}

                    {!locationLoading &&
                      locationSuggestions.map(
                        (place) => (
                          <button
                            key={place.place_id}
                            type="button"
                            onClick={() =>
                              selectLocation(place)
                            }
                            className="
                              w-full
                              text-left

                              px-3
                              py-2.5

                              flex
                              items-start
                              gap-2.5

                              hover:bg-[#f4f6ff]
                              dark:hover:bg-[#173850]

                              transition

                              border-b
                              border-slate-100
                              dark:border-[#23445b]

                              last:border-0
                            "
                          >
                            <div
                              className="
                                mt-0.5

                                w-6
                                h-6
                                shrink-0

                                rounded-full

                                bg-[#edf0ff]
                                dark:bg-[#1c3b54]

                                flex
                                items-center
                                justify-center
                              "
                            >
                              <MapPin
                                size={12}
                                className="
                                  text-[#586ddd]
                                  dark:text-[#96a5ff]
                                "
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  text-[10px]
                                  font-semibold
                                  truncate

                                  text-[#2d3e78]
                                  dark:text-[#edf3ff]
                                "
                              >
                                {place.name ||
                                  place.address
                                    ?.village ||
                                  place.address
                                    ?.town ||
                                  place.address
                                    ?.city ||
                                  "Location"}
                              </p>

                              <p
                                className="
                                  text-[8px]
                                  leading-4
                                  line-clamp-2

                                  text-slate-500
                                  dark:text-[#829bb0]
                                "
                              >
                                {place.display_name}
                              </p>
                            </div>
                          </button>
                        )
                      )}
                  </div>
                )}
            </div>

            {/* ================================================= */}
            {/* COLOR + BRAND */}
            {/* ================================================= */}

            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div>
                <label className={labelClass}>
                  Color
                </label>

                <div className="relative">
                  <Palette
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2

                      text-[#687ce5]
                      dark:text-[#91a0ff]
                    "
                  />

                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="e.g. Black"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Brand
                </label>

                <div className="relative">
                  <Tag
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2

                      text-[#687ce5]
                      dark:text-[#91a0ff]
                    "
                  />

                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. Samsung"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* DESCRIPTION */}
            {/* ================================================= */}

            <div className="mb-2.5">
              <label className={labelClass}>
                Description
              </label>

              <div className="relative">
                <FileText
                  size={14}
                  className="
                    absolute
                    left-3
                    top-3

                    text-[#687ce5]
                    dark:text-[#91a0ff]
                  "
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the item..."
                  maxLength={200}
                  rows={2}
                  className="
                    w-full
                    h-[58px]

                    pl-9
                    pr-3
                    py-2

                    text-[11px]

                    rounded-lg
                    resize-none
                    outline-none

                    bg-[#f8f9ff]
                    dark:bg-[#142f45]

                    border
                    border-[#dce2ff]
                    dark:border-[#31536b]

                    text-[#31436f]
                    dark:text-[#edf3ff]

                    placeholder:text-[#9aa9c5]
                    dark:placeholder:text-[#70899f]

                    focus:border-[#7083ef]
                    dark:focus:border-[#7187ff]

                    focus:ring-2
                    focus:ring-[#7183ef]/10
                    dark:focus:ring-[#7183ff]/15

                    transition-all
                  "
                />

                <span
                  className="
                    absolute
                    right-2.5
                    bottom-1.5

                    text-[8px]

                    text-slate-400
                    dark:text-[#71899e]
                  "
                >
                  {form.description.length}/200
                </span>
              </div>
            </div>

            {/* ================================================= */}
            {/* PHOTO */}
            {/* ================================================= */}

            <div className="mb-3">
              <label className={labelClass}>
                Item Photo
              </label>

              <div
                className="
                  border
                  border-dashed

                  border-[#cbd4ff]
                  dark:border-[#365a72]

                  bg-[#fafbff]
                  dark:bg-[#112c41]

                  rounded-xl

                  px-3
                  py-2.5

                  flex
                  items-center
                  justify-between
                  gap-3

                  hover:border-[#7183e8]
                  dark:hover:border-[#7389ff]

                  transition
                "
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="
                      w-9
                      h-9
                      shrink-0

                      rounded-full

                      bg-[#edf0ff]
                      dark:bg-[#1b3b54]

                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Camera
                      size={17}
                      className="
                        text-[#6174dc]
                        dark:text-[#96a5ff]
                      "
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        text-[10px]
                        font-semibold

                        text-[#34477f]
                        dark:text-[#edf3ff]
                      "
                    >
                      Add up to 5 lost item photos
                    </p>

                    <p
                      className="
                        text-[8px]

                        text-slate-400
                        dark:text-[#7891a6]
                      "
                    >
                      JPG, PNG, WEBP • Max 5 MB
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="lost-item-image"
                  className="
                    shrink-0

                    flex
                    items-center
                    gap-1.5

                    px-3
                    py-1.5

                    rounded-lg

                    bg-gradient-to-r
                    from-emerald-700
                    to-green-800

                    hover:from-emerald-800
                    hover:to-emerald-900

                    text-white
                    text-[9px]
                    font-semibold

                    cursor-pointer

                    shadow-[0_5px_12px_rgba(16,87,58,0.24)]

                    hover:shadow-[0_7px_16px_rgba(16,87,58,0.34)]

                    transition
                  "
                >
                  <UploadCloud size={12} />
                  Choose
                </label>

                <input
                  id="lost-item-image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* IMAGE PREVIEW */}

              {imagePreview && (
                <div className="mt-2 flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Selected lost item"
                      className="
                        w-20
                        h-16
                        object-cover

                        rounded-lg

                        border
                        border-[#dfe4ff]
                        dark:border-[#31536d]
                      "
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      className="
                        absolute
                        -top-1.5
                        -right-1.5

                        w-5
                        h-5

                        rounded-full

                        bg-red-500
                        text-white

                        flex
                        items-center
                        justify-center

                        shadow-sm
                      "
                    >
                      <X size={10} />
                    </button>
                  </div>

                  <div>
                    <p
                      className="
                        text-[9px]
                        font-semibold

                        text-[#35477b]
                        dark:text-[#e4ebff]
                      "
                    >
                      {form.images?.length || 1} photo(s) selected ✓
                    </p>

                    <p
                      className="
                        text-[8px]

                        text-slate-400
                        dark:text-[#7891a6]
                      "
                    >
                      Ready to upload
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                h-10

                rounded-xl

                bg-gradient-to-r
                from-emerald-800
                via-green-800
                to-emerald-900

                hover:from-emerald-900
                hover:via-green-900
                hover:to-emerald-950

                disabled:opacity-60

                text-white
                text-[11px]
                font-bold

                flex
                items-center
                justify-center
                gap-2

                shadow-[0_8px_20px_rgba(16,87,58,0.28)]
                dark:shadow-[0_8px_22px_rgba(16,87,58,0.34)]

                hover:shadow-[0_10px_26px_rgba(16,87,58,0.38)]

                transition-all
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Reporting...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Report Lost Item
                </>
              )}
            </button>

            {/* FOOT NOTE */}

            <div className="flex justify-center items-center gap-1 mt-2">
              <Heart
                size={8}
                fill="#ff9ca8"
                className="text-[#ff9ca8]"
              />

              <span
                className="
                  text-[8px]

                  text-slate-400
                  dark:text-[#7891a6]
                "
              >
                Together we reunite more
              </span>
            </div>
          </form>

          {/* ================================================= */}
          {/* MAP */}
          {/* ================================================= */}

          <div
            className="
              w-full
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                relative

                w-full

                h-[390px]
                sm:h-[405px]
                lg:h-[425px]

                rounded-[30px]

                overflow-hidden

                bg-gradient-to-br
                from-[#dfe5ff]
                via-[#edf0ff]
                to-[#e8e1ff]

                dark:from-[#142f45]
                dark:via-[#0c2538]
                dark:to-[#182a47]

                border
                border-[#d9dfff]
                dark:border-[#2b4d66]

                p-[6px]

                shadow-[0_20px_55px_rgba(79,70,229,0.18)]
                dark:shadow-[0_22px_60px_rgba(0,0,0,0.45)]
              "
            >
              <div
                className="
                  relative
                  w-full
                  h-full

                  overflow-hidden

                  rounded-[25px]

                  bg-[#e8edf7]
                  dark:bg-[#102b3e]
                "
              >
                {/* INTERACTIVE MAP */}

                <div
                  ref={mapContainerRef}
                  className="
                    absolute
                    inset-0
                    z-0
                    w-full
                    h-full

                    bg-[#e8edf7]
                    dark:bg-[#102b3e]
                  "
                  aria-label="Interactive lost item location map"
                />

                {/* MAP BOTTOM HINT */}

                <div
                  className="
                    absolute
                    z-20

                    bottom-3
                    left-1/2
                    -translate-x-1/2

                    px-3
                    py-1.5

                    rounded-full

                    bg-white/95
                    dark:bg-[#102c40]/95

                    backdrop-blur-md

                    border
                    border-white/80
                    dark:border-[#31536d]

                    shadow-lg

                    text-[8px]
                    font-semibold

                    whitespace-nowrap

                    text-[#5264be]
                    dark:text-[#a8b4ff]

                    pointer-events-none
                  "
                >
                  🔎 Zoom out &nbsp;•&nbsp; Click anywhere to choose location
                </div>

                {/* MAP HEADER */}

                <div
                  className="
                    absolute
                    z-30

                    top-3
                    left-3
                    right-3

                    bg-white/95
                    dark:bg-[#102c40]/95

                    backdrop-blur-xl

                    border
                    border-white/80
                    dark:border-[#31536d]

                    rounded-2xl

                    px-3
                    py-2.5

                    shadow-[0_8px_25px_rgba(30,41,100,0.13)]
                    dark:shadow-[0_8px_25px_rgba(0,0,0,0.32)]
                  "
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="
                        w-9
                        h-9
                        shrink-0

                        rounded-xl

                        bg-gradient-to-br
                        from-[#e3e8ff]
                        to-[#f1efff]

                        dark:from-[#193d58]
                        dark:to-[#263b68]

                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Map
                        size={17}
                        className="
                          text-[#6075e8]
                          dark:text-[#97a6ff]
                        "
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="
                            text-[11px]
                            font-bold

                            text-[#2c3e78]
                            dark:text-[#edf3ff]
                          "
                        >
                          Lost Location
                        </span>

                        <span
                          className="
                            px-1.5
                            py-[2px]

                            rounded-full

                            bg-[#edf0ff]
                            dark:bg-[#203b55]

                            text-[#6577dd]
                            dark:text-[#a4b0ff]

                            text-[7px]
                            font-bold
                          "
                        >
                          MAP
                        </span>
                      </div>

                      <p
                        className="
                          text-[8px]
                          truncate
                          mt-0.5

                          text-slate-400
                          dark:text-[#8ca5b9]
                        "
                      >
                        {selectedPlace
                          ? selectedPlace.display_name
                          : "Search village, city or area"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* LIVE BADGE */}

                <div
                  className="
                    absolute
                    z-20

                    top-[76px]
                    left-4

                    px-2.5
                    py-1.5

                    rounded-full

                    bg-white/90
                    dark:bg-[#102c40]/90

                    backdrop-blur-md

                    border
                    border-white/80
                    dark:border-[#365871]

                    shadow-md

                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full

                      bg-[#6f82ed]

                      animate-pulse
                    "
                  />

                  <span
                    className="
                      text-[7px]
                      font-semibold

                      text-[#5264be]
                      dark:text-[#a8b4ff]
                    "
                  >
                    LIVE LOCATION VIEW
                  </span>
                </div>

                {/* SELECTED LOCATION CARD */}

                {selectedPlace && (
                  <div
                    className="
                      absolute
                      z-30

                      bottom-3
                      left-3
                      right-3

                      bg-white/95
                      dark:bg-[#102c40]/95

                      backdrop-blur-xl

                      rounded-2xl

                      border
                      border-white/80
                      dark:border-[#31536d]

                      px-3
                      py-2.5

                      shadow-[0_10px_30px_rgba(30,41,100,0.15)]
                      dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="
                          relative

                          w-9
                          h-9
                          shrink-0

                          rounded-xl

                          bg-gradient-to-br
                          from-[#fff0f3]
                          to-[#ffe4eb]

                          dark:from-[#4a2738]
                          dark:to-[#39253a]

                          flex
                          items-center
                          justify-center
                        "
                      >
                        <MapPin
                          size={17}
                          className="
                            text-[#ed8295]
                            dark:text-[#ff9eaf]
                          "
                        />

                        <span
                          className="
                            absolute
                            -top-1
                            -right-1

                            w-2.5
                            h-2.5

                            rounded-full

                            bg-[#7183ef]

                            border-2
                            border-white
                            dark:border-[#102c40]
                          "
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="
                              text-[10px]
                              font-bold

                              text-[#34477f]
                              dark:text-[#edf3ff]
                            "
                          >
                            Lost location selected
                          </p>

                          <span
                            className="
                              text-[9px]
                              font-bold

                              text-[#6275dd]
                              dark:text-[#a6b2ff]
                            "
                          >
                            ✓
                          </span>
                        </div>

                        <p
                          className="
                            text-[8px]
                            truncate
                            mt-0.5

                            text-slate-500
                            dark:text-[#8ea6b9]
                          "
                        >
                          {selectedPlace.display_name}
                        </p>
                      </div>

                      <div
                        className="
                          hidden
                          sm:block

                          text-right
                          shrink-0
                        "
                      >
                        <p
                          className="
                            text-[7px]
                            font-bold

                            text-[#687ae0]
                            dark:text-[#a3afff]
                          "
                        >
                          PINNED
                        </p>

                        <p
                          className="
                            text-[7px]

                            text-slate-400
                            dark:text-[#71899e]
                          "
                        >
                          {Number(
                            selectedPlace.lat
                          ).toFixed(4)}
                          ,{" "}
                          {Number(
                            selectedPlace.lon
                          ).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* OUTER GLOW */}

              <div
                className="
                  absolute

                  -right-12
                  top-1/2
                  -translate-y-1/2

                  w-24
                  h-52

                  rounded-full

                  bg-[#788bf4]/20
                  dark:bg-[#788bf4]/10

                  blur-3xl

                  pointer-events-none
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
