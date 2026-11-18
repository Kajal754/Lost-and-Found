"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  MapPin,
  CalendarDays,
  Tag,
  Palette,
  FileText,
  Camera,
  AlertCircle,
} from "lucide-react";
import {
  geocodeLocation,
  searchLocationSuggestions,
} from "../../../../lib/geocoding";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "/api";

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();

  const type = params?.type;
  const id = params?.id;

  const isLost = type === "lost";

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    lostDate: "",
    foundDate: "",
    color: "",
    brand: "",
    image: "",
    status: "",
    latitude: null,
    longitude: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // GET TOKEN
  // =====================================================

  function getToken() {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      localStorage.getItem("lostFoundToken") ||
      sessionStorage.getItem("lostFoundToken") ||
      ""
    );
  }

  function formatDateForInput(date) {
    try {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }

  // =====================================================
  // FETCH ITEM
  // =====================================================

  useEffect(() => {
    if (!id || !type) return;

    if (type !== "lost" && type !== "found") {
      const timer = setTimeout(() => {
        setError("Invalid item type.");
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    async function loadItem() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const endpoint = isLost
          ? `${API}/lost-items/${id}`
          : `${API}/found-items/${id}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to load item."
          );
        }

        const item = data?.item || data?.data || data;

        setForm({
          title: item.title || "",
          category: item.category || "",
          description: item.description || "",
          location: item.location || "",
          lostDate: item.lostDate
            ? formatDateForInput(item.lostDate)
            : "",
          foundDate: item.foundDate
            ? formatDateForInput(item.foundDate)
            : "",
          color: item.color || "",
          brand: item.brand || "",
          image: item.image || "",
          status: item.status || "",
          latitude: item.latitude ?? null,
          longitude: item.longitude ?? null,
        });

        if (item.image) {
          setImagePreview(item.image);
        }
      } catch (err) {
        console.error("Load item error:", err);

        setError(
          err.message ||
            "Failed to load item."
        );
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id, type, isLost, router]);

  useEffect(() => {
    const searchTerm = form.location.trim();
    if (!showLocationSuggestions || searchTerm.length < 3) {
      setLocationSuggestions([]);
      setLocationSuggestionsLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLocationSuggestionsLoading(true);
      try {
        const suggestions = await searchLocationSuggestions(searchTerm, {
          signal: controller.signal,
        });
        if (active) setLocationSuggestions(suggestions);
      } catch (suggestionError) {
        if (active && suggestionError.name !== "AbortError") {
          setLocationSuggestions([]);
          setError(suggestionError.message);
        }
      } finally {
        if (active) setLocationSuggestionsLoading(false);
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.location, showLocationSuggestions]);

  // =====================================================
  // CHANGE
  // =====================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "location" ? { latitude: null, longitude: null } : {}),
    }));

    setSuccess("");

    if (error) {
      setError("");
    }
  }

  function selectLocationSuggestion(place) {
    setForm((previous) => ({
      ...previous,
      location: place.display_name,
      latitude: place.lat,
      longitude: place.lng,
    }));
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setError("");
  }

  // =====================================================
  // IMAGE
  // =====================================================

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size should be less than 5 MB."
      );
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onloadend = () => {
      const image = reader.result;

      setForm((prev) => ({
        ...prev,
        image,
      }));

      setImagePreview(image);
    };

    reader.readAsDataURL(file);
  }

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  function removeImage() {
    setImagePreview("");

    setForm((prev) => ({
      ...prev,
      image: "",
    }));
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const endpoint = isLost
        ? `${API}/lost-items/${id}`
        : `${API}/found-items/${id}`;

      let coordinates = {
        latitude: form.latitude,
        longitude: form.longitude,
      };
      let location = form.location.trim();
      const validCoordinates =
        coordinates.latitude != null &&
        coordinates.longitude != null &&
        Number.isFinite(Number(coordinates.latitude)) &&
        Number.isFinite(Number(coordinates.longitude)) &&
        Math.abs(Number(coordinates.latitude)) <= 90 &&
        Math.abs(Number(coordinates.longitude)) <= 180;
      if (!validCoordinates) {
        const place = await geocodeLocation(location);
        if (!place) {
          throw new Error("Choose a location suggestion so the edited report can be placed on the map.");
        }
        coordinates = { latitude: place.lat, longitude: place.lng };
        location = place.display_name;
      }

      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        location,
        ...coordinates,
        color: form.color,
        brand: form.brand,
        image: form.image,
        status: form.status,
      };

      if (isLost) {
        payload.lostDate = form.lostDate;
      } else {
        payload.foundDate = form.foundDate;
      }

      const response = await fetch(
        endpoint,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to update item."
        );
      }

      setSuccess(
        `${
          isLost ? "Lost" : "Found"
        } item updated successfully.`
      );

      setTimeout(() => {
        router.push("/my-items");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("Update item error:", err);

      setError(
        err.message ||
          "Failed to update item."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // STYLES
  // =====================================================

  const labelClass = `
    block
    text-[10px]
    font-semibold
    mb-1.5
    text-[#40558f]
    dark:text-[#aebcff]
  `;

  const inputClass = `
    w-full
    h-10
    px-3

    rounded-xl

    outline-none

    text-[11px]
    font-medium

    bg-[#f8f9ff]
    dark:bg-[#142f45]

    border
    border-[#dce2ff]
    dark:border-[#31536b]

    text-[#293d70]
    dark:text-[#edf3ff]

    placeholder:text-[#91a0bc]
    dark:placeholder:text-[#70899f]

    focus:border-[#687cf0]
    dark:focus:border-[#7187ff]

    focus:ring-2
    focus:ring-[#7183ef]/10

    transition-all
  `;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        className="
          min-h-[70vh]

          flex
          items-center
          justify-center

          bg-[#f8f9ff]
          dark:bg-[#081d2d]
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >
          <div
            className="
              w-12
              h-12

              rounded-2xl

              bg-[#eef1ff]
              dark:bg-[#193650]

              flex
              items-center
              justify-center
            "
          >
            <Loader2
              size={22}
              className="
                animate-spin
                text-[#6276df]
                dark:text-[#a3afff]
              "
            />
          </div>

          <p
            className="
              text-[11px]
              font-semibold

              text-[#40558f]
              dark:text-[#c7d3e8]
            "
          >
            Loading item...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        min-h-screen

        bg-gradient-to-br
        from-[#f8f9ff]
        via-[#f5f6ff]
        to-[#fff5f7]

        dark:from-[#081d2d]
        dark:via-[#0b2336]
        dark:to-[#172538]

        px-4
        py-8
      "
    >
      <div className="max-w-[720px] mx-auto">

        {/* ================================================= */}
        {/* BACK */}
        {/* ================================================= */}

        <Link
          href="/my-items"
          className="
            inline-flex
            items-center
            gap-2

            mb-5

            text-[10px]
            font-bold

            text-[#5369c8]
            dark:text-[#aab6ff]

            hover:text-[#3f55b8]

            transition
          "
        >
          <ArrowLeft size={14} />

          Back to My Items
        </Link>

        {/* ================================================= */}
        {/* CARD */}
        {/* ================================================= */}

        <div
          className="
            relative
            overflow-hidden

            rounded-[26px]

            bg-white
            dark:bg-[#0d2437]

            border
            border-[#dfe4ff]
            dark:border-[#294a62]

            shadow-[0_20px_55px_rgba(70,85,170,0.12)]
            dark:shadow-[0_20px_55px_rgba(0,0,0,0.4)]

            p-5
            sm:p-7
          "
        >

          {/* GLOW */}

          <div
            className="
              absolute
              -top-16
              -right-16

              w-40
              h-40

              rounded-full

              bg-[#788bf4]/10
              dark:bg-[#788bf4]/8

              blur-3xl

              pointer-events-none
            "
          />

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div
            className="
              relative

              flex
              items-center
              gap-3

              mb-6
            "
          >
            <div
              className="
                w-12
                h-12
                shrink-0

                rounded-2xl

                bg-gradient-to-br
                from-[#e4e9ff]
                to-[#f4efff]

                dark:from-[#193d58]
                dark:to-[#263b68]

                flex
                items-center
                justify-center
              "
            >
              <Camera
                size={21}
                className="
                  text-[#5e73dc]
                  dark:text-[#9daaff]
                "
              />
            </div>

            <div>
              <div className="flex items-center gap-2">

                <h1
                  className="
                    text-[20px]
                    font-bold

                    text-[#1e3268]
                    dark:text-[#f2f5ff]
                  "
                >
                  Edit {isLost ? "Lost" : "Found"} Item
                </h1>

                <span
                  className={`
                    px-2
                    py-1
                    rounded-full

                    text-[7px]
                    font-bold
                    uppercase

                    ${
                      isLost
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }
                  `}
                >
                  {isLost ? "LOST" : "FOUND"}
                </span>

              </div>

              <p
                className="
                  text-[9px]
                  mt-0.5

                  text-slate-500
                  dark:text-[#8ea5ba]
                "
              >
                Update your item information
              </p>
            </div>
          </div>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div
              className="
                mb-4

                flex
                items-start
                gap-2

                px-3
                py-2.5

                rounded-xl

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
              <AlertCircle
                size={14}
                className="shrink-0 mt-0.5"
              />

              <span>{error}</span>
            </div>
          )}

          {/* ================================================= */}
          {/* SUCCESS */}
          {/* ================================================= */}

          {success && (
            <div
              className="
                mb-4

                px-3
                py-2.5

                rounded-xl

                bg-green-50
                dark:bg-green-950/30

                border
                border-green-200
                dark:border-green-900/50

                text-green-600
                dark:text-green-300

                text-[10px]
                font-semibold
              "
            >
              ✓ {success}
            </div>
          )}

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="relative space-y-4"
          >

            {/* TITLE */}

            <div>
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

                    text-[#6377dc]
                    dark:text-[#9daaff]
                  "
                />

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Black Wallet"
                  className={`
                    ${inputClass}
                    pl-9
                  `}
                />

              </div>
            </div>

            {/* CATEGORY + DATE */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* CATEGORY */}

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

                      text-[#6377dc]
                      dark:text-[#9daaff]

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
                      pl-9
                      appearance-none
                      cursor-pointer
                    `}
                  >
                    <option value="">
                      Select category
                    </option>

                    <option value="Wallet">
                      Wallet
                    </option>

                    <option value="Mobile">
                      Mobile
                    </option>

                    <option value="Laptop">
                      Laptop
                    </option>

                    <option value="Keys">
                      Keys
                    </option>

                    <option value="Bag">
                      Bag
                    </option>

                    <option value="Jewellery">
                      Jewellery
                    </option>

                    <option value="Documents">
                      Documents
                    </option>

                    <option value="Clothing">
                      Clothing
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>
              </div>

              {/* DATE */}

              <div>
                <label className={labelClass}>
                  {isLost
                    ? "Lost Date *"
                    : "Found Date *"}
                </label>

                <div className="relative">

                  <CalendarDays
                    size={14}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2

                      text-[#6377dc]
                      dark:text-[#9daaff]

                      pointer-events-none
                    "
                  />

                  <input
                    type="date"
                    name={
                      isLost
                        ? "lostDate"
                        : "foundDate"
                    }
                    value={
                      isLost
                        ? form.lostDate
                        : form.foundDate
                    }
                    onChange={handleChange}
                    required
                    className={`
                      ${inputClass}
                      pl-9
                    `}
                  />

                </div>
              </div>

            </div>

            {/* LOCATION */}

            <div>
              <label className={labelClass}>
                Location *
              </label>

              <div className="relative">

                <MapPin
                  size={14}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    text-[#6377dc]
                    dark:text-[#9daaff]
                  "
                />

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  onFocus={() => setShowLocationSuggestions(true)}
                  required
                  placeholder="Country, city, locality, street or PIN code..."
                  className={`
                    ${inputClass}
                    pl-9
                  `}
                />

                {showLocationSuggestions &&
                  (locationSuggestionsLoading || locationSuggestions.length > 0) && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-[#31536b] dark:bg-[#142f45]">
                      {locationSuggestions.map((place, index) => (
                        <button
                          key={`${place.lat}-${place.lng}-${index}`}
                          type="button"
                          role="option"
                          onClick={() => selectLocationSuggestion(place)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-xs text-[#293d70] hover:bg-emerald-50 dark:text-[#edf3ff] dark:hover:bg-[#193d58]"
                        >
                          {place.display_name}
                        </button>
                      ))}
                      {locationSuggestionsLoading && (
                        <p className="px-3 py-2 text-xs text-slate-500">Finding locations...</p>
                      )}
                    </div>
                  )}

                {form.latitude != null && form.longitude != null && (
                  <p className="mt-1 text-[10px] text-slate-500">
                    Map coordinates saved: {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
                  </p>
                )}

              </div>
            </div>

            {/* COLOR + BRAND */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* COLOR */}

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

                      text-[#6377dc]
                      dark:text-[#9daaff]
                    "
                  />

                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="e.g. Black"
                    className={`
                      ${inputClass}
                      pl-9
                    `}
                  />

                </div>
              </div>

              {/* BRAND */}

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

                      text-[#6377dc]
                      dark:text-[#9daaff]
                    "
                  />

                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. Samsung"
                    className={`
                      ${inputClass}
                      pl-9
                    `}
                  />

                </div>
              </div>

            </div>

            {/* DESCRIPTION */}

            <div>
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

                    text-[#6377dc]
                    dark:text-[#9daaff]
                  "
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={200}
                  rows={4}
                  placeholder="Describe the item..."
                  className="
                    w-full
                    min-h-[95px]

                    pl-9
                    pr-3
                    py-2.5

                    rounded-xl
                    resize-none
                    outline-none

                    text-[11px]
                    font-medium

                    bg-[#f8f9ff]
                    dark:bg-[#142f45]

                    border
                    border-[#dce2ff]
                    dark:border-[#31536b]

                    text-[#293d70]
                    dark:text-[#edf3ff]

                    placeholder:text-[#91a0bc]
                    dark:placeholder:text-[#70899f]

                    focus:border-[#687cf0]
                    dark:focus:border-[#7187ff]

                    focus:ring-2
                    focus:ring-[#7183ef]/10

                    transition-all
                  "
                />

                <span
                  className="
                    absolute
                    right-3
                    bottom-2

                    text-[8px]

                    text-slate-400
                    dark:text-[#71899e]
                  "
                >
                  {form.description.length}/200
                </span>

              </div>
            </div>

            {/* IMAGE */}

            <div>
              <label className={labelClass}>
                Item Photo
              </label>

              <div
                className="
                  rounded-xl

                  border
                  border-dashed
                  border-[#ccd5ff]
                  dark:border-[#365a72]

                  bg-[#fafbff]
                  dark:bg-[#112c41]

                  p-3

                  flex
                  items-center
                  justify-between
                  gap-3
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
                      size={16}
                      className="
                        text-[#6075dc]
                        dark:text-[#9caaff]
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
                      Change item photo
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
                  htmlFor="edit-item-image"
                  className="
                    shrink-0

                    px-3
                    py-1.5

                    rounded-lg

                    bg-gradient-to-r
                    from-[#687cf0]
                    to-[#7d8cf1]

                    text-white
                    text-[9px]
                    font-semibold

                    cursor-pointer

                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <Camera size={12} />
                  Change
                </label>

                <input
                  id="edit-item-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </div>

              {/* PREVIEW */}

              {imagePreview && (
                <div className="mt-3 flex items-center gap-3">

                  <div className="relative">

                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="
                        w-24
                        h-20

                        rounded-xl

                        object-cover

                        border
                        border-[#dfe4ff]
                        dark:border-[#31536d]

                        shadow-sm
                      "
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      className="
                        absolute
                        -top-2
                        -right-2

                        w-5
                        h-5

                        rounded-full

                        bg-red-500
                        text-white

                        flex
                        items-center
                        justify-center

                        shadow-md
                      "
                      title="Remove image"
                    >
                      ×
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
                      Photo ready ✓
                    </p>

                    <p
                      className="
                        text-[8px]

                        text-slate-400
                        dark:text-[#7891a6]
                      "
                    >
                      Your item image
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* STATUS */}

            <div>
              <label className={labelClass}>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                disabled
                className={inputClass}
              >
                <option value={form.status}>{form.status || (isLost ? "lost" : "found")}</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">Status updates after claim verification and QR handover.</p>
            </div>

            {/* ================================================= */}
            {/* ACTIONS */}
            {/* ================================================= */}

            <div
              className="
                pt-2

                flex
                flex-col
                sm:flex-row

                gap-2
              "
            >

              <Link
                href="/my-items"
                className="
                  flex-1

                  h-10

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  text-[10px]
                  font-bold

                  bg-[#f1f3ff]
                  dark:bg-[#193650]

                  border
                  border-[#dce2ff]
                  dark:border-[#31546c]

                  text-[#5064b8]
                  dark:text-[#b0bcff]

                  hover:bg-[#e8ebff]
                  dark:hover:bg-[#21425c]

                  transition
                "
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="
                  flex-1

                  h-10

                  rounded-xl

                  flex
                  items-center
                  justify-center
                  gap-2

                  bg-gradient-to-r
                  from-[#6075ed]
                  via-[#7182f4]
                  to-[#9182ed]

                  hover:from-[#566ce2]
                  hover:via-[#6879eb]
                  hover:to-[#8374df]

                  disabled:opacity-60

                  text-white
                  text-[10px]
                  font-bold

                  shadow-[0_8px_20px_rgba(96,117,237,0.25)]

                  transition-all
                "
              >
                {saving ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />

                    Save Changes
                  </>
                )}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
