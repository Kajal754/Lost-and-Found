"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronDown,
  Search,
  X,
  LayoutDashboard,
  Package,
  SearchCheck,
  MessageCircle,
  FileWarning,
  FileCheck,
  CheckCheck,
  Check,
  Trash2,
} from "lucide-react";

import { getToken, getUser, logout } from "../lib/auth";
import { api } from "../lib/api";
import { connectAppSocket, disconnectAppSocket } from "../lib/socket";

export default function Navbar() {
  const router = useRouter();
  const searchRef = useRef(null);
  const liveNotificationEvents = useRef(new Map());

  const [user, setUser] = useState(() => getUser());
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined" &&
    localStorage.getItem("theme") === "dark"
  );
  const [profileOpen, setProfileOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [recoveryNotifications, setRecoveryNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [socketError, setSocketError] = useState("");

  const applyNotificationSnapshot = useCallback((response) => {
    const storedNotifications = response.notifications || [];
    const storedIds = new Set(storedNotifications.map((item) => item.id));
    const unseenLive = [...liveNotificationEvents.current.values()].filter(
      (item) => !storedIds.has(item.id) && !item.readAt
    );
    setRecoveryNotifications([...unseenLive, ...storedNotifications].slice(0, 30));
    setNotificationCount(Number(response.unreadCount || 0) + unseenLive.length);
  }, []);

  /* ==========================================
     ALL APP PAGES
  ========================================== */

  const pages = [
    {
      name: "Dashboard",
      description: "Go to your dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      keywords: "dashboard home main",
    },

    {
      name: "My Items",
      description: "View your reported items",
      path: "/my-items",
      icon: Package,
      keywords: "my items items",
    },

    {
      name: "Lost Item",
      description: "Report or view lost items",
      path: "/lost-item",
      icon: FileWarning,
      keywords: "lost missing report lost item",
    },

    {
      name: "Found Item",
      description: "Report or view found items",
      path: "/found-item",
      icon: FileCheck,
      keywords: "found recovered report found item",
    },

    {
      name: "Matches",
      description: "See possible lost and found matches",
      path: "/matches",
      icon: SearchCheck,
      keywords: "match matching matches",
    },

    {
      name: "Messages",
      description: "Chat with connected users",
      path: "/messages",
      icon: MessageCircle,
      keywords: "message messages chat conversation",
    },

    {
      name: "Profile",
      description: "Manage your profile",
      path: "/profile",
      icon: User,
      keywords: "profile account user",
    },
  ];

  /* ==========================================
     USER + THEME
  ========================================== */

  useEffect(() => {
    function refreshUser() {
      setUser(getUser());
    }
    function clearExpiredSession() {
      disconnectAppSocket();
      setUser(null);
      setRecoveryNotifications([]);
      setNotificationCount(0);
    }

    window.addEventListener("lostFoundUserUpdated", refreshUser);
    window.addEventListener("lostFoundAuthExpired", clearExpiredSession);

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      window.removeEventListener("lostFoundUserUpdated", refreshUser);
      window.removeEventListener("lostFoundAuthExpired", clearExpiredSession);
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !getToken()) {
      disconnectAppSocket();
      liveNotificationEvents.current.clear();
      setRecoveryNotifications([]);
      setNotificationCount(0);
      setSocketError("");
      return undefined;
    }

    let active = true;
    const socket = connectAppSocket();
    const handleSocketConnect = () => setSocketError("");
    const handleSocketError = (connectionError) => {
      if (!active) return;
      console.error("Notification socket connection error:", connectionError);
      setSocketError("Live updates are reconnecting. Refresh this menu for the latest saved notifications.");
    };
    const handleNewNotification = (notification) => {
      if (!active) return;
      liveNotificationEvents.current.set(notification.id, notification);
      if (liveNotificationEvents.current.size > 60) {
        const oldestId = liveNotificationEvents.current.keys().next().value;
        liveNotificationEvents.current.delete(oldestId);
      }
      setRecoveryNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, 30));
      if (!notification.readAt) {
        setNotificationCount((current) => current + 1);
      }
    };
    socket.on("connect", handleSocketConnect);
    socket.on("connect_error", handleSocketError);
    socket.on("notification:new", handleNewNotification);

    api.getNotifications()
      .then((response) => {
        if (!active) return;
        applyNotificationSnapshot(response);
      })
      .catch((loadError) => {
        if (active) {
          console.error("Load notifications error:", loadError);
          setNotificationError(loadError.message || "Could not load notifications.");
        }
      });

    return () => {
      active = false;
      socket.off("connect", handleSocketConnect);
      socket.off("connect_error", handleSocketError);
      socket.off("notification:new", handleNewNotification);
    };
  }, [user?.id, applyNotificationSnapshot]);

  /* ==========================================
     CLOSE SEARCH WHEN CLICKING OUTSIDE
  ========================================== */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* ==========================================
     THEME
  ========================================== */

  function toggleTheme() {
    const newTheme = !darkMode;

    setDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  /* ==========================================
     SEARCH FILTER
  ========================================== */

  const filteredPages = pages.filter((page) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    const searchableText =
      `${page.name} ${page.description} ${page.keywords}`.toLowerCase();

    return searchableText.includes(query);
  });

  /* ==========================================
     OPEN PAGE
  ========================================== */

  function openPage(path) {
    setSearch("");
    setSearchFocused(false);
    router.push(path);
  }

  /* ==========================================
     SEARCH ENTER
  ========================================== */

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (filteredPages.length > 0) {
        openPage(filteredPages[0].path);
      }
    }

    if (event.key === "Escape") {
      setSearch("");
      setSearchFocused(false);
    }
  }

  /* ==========================================
     LOGOUT
  ========================================== */

  function handleLogout() {
    disconnectAppSocket();
    logout();
    router.replace("/login");
  }

  /* ==========================================
     PROFILE
  ========================================== */

  function openProfile() {
    setProfileOpen(false);
    router.push("/profile");
  }

  /* ==========================================
     NOTIFICATIONS
  ========================================== */

  async function openNotifications() {
    const opening = !notificationOpen;
    setNotificationOpen(opening);
    if (!opening || !user?.id) return;

    setNotificationLoading(true);
    setNotificationError("");
    try {
      const response = await api.getNotifications();
      applyNotificationSnapshot(response);
    } catch (loadError) {
      console.error("Load notifications error:", loadError);
      setNotificationError(loadError.message || "Could not load notifications.");
    } finally {
      setNotificationLoading(false);
    }
  }

  async function openRecoveryNotification(notification) {
    if (!notification.readAt && !(await markNotificationAsRead(notification))) return;
    setNotificationOpen(false);
    router.push(notification.href);
  }

  async function markNotificationAsRead(notification) {
    setNotificationError("");
    try {
      if (notification.readAt) return true;
      await api.markNotificationRead(notification.id);
      setRecoveryNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item
        )
      );
      setNotificationCount((current) => Math.max(0, current - 1));
      return true;
    } catch (error) {
      console.error("Mark notification read error:", error);
      setNotificationError(error.message || "Could not update this notification.");
      return false;
    }
  }

  async function markAllNotificationsRead() {
    setNotificationError("");
    try {
      await api.markAllNotificationsRead();
      const readAt = new Date().toISOString();
      setRecoveryNotifications((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt || readAt }))
      );
      setNotificationCount(0);
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      setNotificationError(error.message || "Could not update notifications.");
    }
  }

  async function deleteNotification(notification) {
    setNotificationError("");
    try {
      await api.deleteNotification(notification.id);
      setRecoveryNotifications((current) =>
        current.filter((item) => item.id !== notification.id)
      );
      if (!notification.readAt) {
        setNotificationCount((current) => Math.max(0, current - 1));
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      setNotificationError(error.message || "Could not delete notification.");
    }
  }

  return (
    <header
      className="
        sticky
        top-0
        z-50
        h-[76px]
        w-full
        border-b
        border-slate-200
        bg-white/95
        shadow-sm
        shadow-slate-900/5
        backdrop-blur-xl
        dark:border-slate-800
        dark:bg-slate-950/95
        dark:shadow-black/30
      "
    >
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ==========================================
            LOGO
        ========================================== */}

        <button
          onClick={() => router.push("/dashboard")}
          className="
            group
            flex
            shrink-0
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-sky-500
              via-cyan-500
              to-blue-500
              text-white
              shadow-lg
              shadow-sky-500/25
              transition-all
              group-hover:scale-105
              group-hover:shadow-sky-500/40
            "
          >
            <span className="text-xl font-black">
              L
            </span>
          </div>

          <div className="hidden text-left sm:block">
            <div
              className="
                text-[17px]
                font-bold
                tracking-tight
                text-slate-900
                dark:text-white
              "
            >
              Lost
              <span className="text-sky-500">
                +
              </span>
              Found
            </div>

            <div
              className="
                text-[9px]
                uppercase
                tracking-[0.2em]
                text-slate-400
                dark:text-slate-500
              "
            >
              Reconnect & Recover
            </div>
          </div>
        </button>

        {/* ==========================================
            SEARCH
        ========================================== */}

        <div
          ref={searchRef}
          className="
            relative
            hidden
            max-w-[560px]
            flex-1
            md:block
          "
        >
          <div
            className={`
              flex
              h-[46px]
              w-full
              items-center
              gap-3
              rounded-2xl
              border border-[#315a45]
              bg-[#123a2b]
              px-4
              transition-all
              shadow-[0_8px_24px_rgba(13,50,34,0.18)]
              dark:bg-slate-900

              ${
                searchFocused
                  ? `
                    border-emerald-300
                    ring-4
                    ring-emerald-400/15
                    shadow-lg
                    shadow-emerald-500/10
                  `
                  : `
                    border-[#315a45]
                    dark:border-slate-800
                  `
              }
            `}
          >
            <Search
              size={19}
              className="
                shrink-0
                text-emerald-300
              "
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              type="text"
              placeholder="Search pages, items, matches..."
              className="
                w-full
                border-none
                bg-transparent
                text-sm
                text-white
                outline-none
                placeholder:text-emerald-100/70
                dark:text-slate-200
                dark:placeholder:text-slate-500
              "
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="
                  text-emerald-100/70
                  transition
                  hover:text-emerald-200
                "
              >
                <X size={17} />
              </button>
            )}

            <span
              className="
                hidden
                items-center
                justify-center
                rounded-lg
                border
                border-white/15
                bg-white/10
                px-2
                py-1
                text-[10px]
                font-medium
                text-emerald-100/75
                dark:border-slate-700
                dark:bg-slate-800
                lg:flex
              "
            >
              Enter
            </span>
          </div>

          {/* SEARCH RESULTS */}

          {searchFocused && (
            <div
              className="
                absolute
                left-0
                right-0
                top-[54px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-2xl
                shadow-slate-900/10
                dark:border-slate-800
                dark:bg-slate-900
                dark:shadow-black/40
              "
            >
              {!search.trim() && (
                <div className="px-3 py-2">
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-sky-500
                    "
                  >
                    Quick navigation
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Search for any page in your Lost & Found app.
                  </p>
                </div>
              )}

              {filteredPages.slice(0, 7).map((page) => {
                const Icon = page.icon;

                return (
                  <button
                    key={page.path}
                    onClick={() => openPage(page.path)}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-left
                      transition
                      hover:bg-sky-50
                      dark:hover:bg-slate-800
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-sky-50
                        text-sky-600
                        dark:bg-sky-950/40
                        dark:text-sky-400
                      "
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-slate-800
                          dark:text-slate-100
                        "
                      >
                        {page.name}
                      </p>

                      <p
                        className="
                          truncate
                          text-xs
                          text-slate-400
                          dark:text-slate-500
                        "
                      >
                        {page.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredPages.length === 0 && (
                <div className="py-8 text-center">
                  <Search
                    size={28}
                    className="
                      mx-auto
                      text-sky-200
                      dark:text-sky-900
                    "
                  />

                  <p
                    className="
                      mt-2
                      text-sm
                      font-medium
                      text-slate-600
                      dark:text-slate-300
                    "
                  >
                    No page found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try searching another page.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            RIGHT SIDE
        ========================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            sm:gap-3
          "
        >
          {/* NOTIFICATION */}

          <div className="relative">
            <button
              onClick={openNotifications}
              aria-label={
                notificationCount
                  ? `Notifications, ${notificationCount} unread`
                  : "Notifications"
              }
              aria-expanded={notificationOpen}
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-sky-600
                transition
                hover:bg-sky-50
                hover:text-sky-700
                dark:text-sky-400
                dark:hover:bg-slate-800
              "
              title="Notifications"
            >
              <Bell size={21} strokeWidth={1.8} />

              {notificationCount > 0 && (
                <span
                  className="
                    absolute
                    -right-0.5
                    -top-0.5
                    flex
                    h-[18px]
                    min-w-[18px]
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-white
                    bg-sky-600
                    px-1
                    text-[9px]
                    font-bold
                    text-white
                    shadow-md
                    shadow-sky-500/25
                    dark:border-slate-950
                  "
                >
                  {notificationCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-full z-[80] mt-2 max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between px-3 py-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      disabled={notificationCount === 0}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-300 dark:hover:bg-slate-800"
                    >
                      <CheckCheck size={13} /> Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {notificationError && (
                  <p role="alert" className="mx-2 mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {notificationError}
                  </p>
                )}
                {socketError && (
                  <p role="status" className="mx-2 mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {socketError}
                  </p>
                )}

                {notificationLoading && recoveryNotifications.length === 0 && (
                  <p className="px-3 py-4 text-sm text-slate-500">Loading notifications...</p>
                )}

                {!notificationLoading && !notificationError && recoveryNotifications.length === 0 && (
                  <p className="px-3 py-4 text-sm text-slate-500">
                    No notifications yet.
                  </p>
                )}

                {recoveryNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-1 rounded-lg px-2 py-2 transition ${
                      notification.readAt ? "" : "bg-sky-50 dark:bg-sky-950/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openRecoveryNotification(notification)}
                      className="min-w-0 flex-1 rounded-lg px-1 py-1 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {notification.type && (
                        <span className="block text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                          {notification.type.replaceAll("_", " ")}
                        </span>
                      )}
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {notification.title}
                        {!notification.readAt && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-sky-600" />
                        )}
                      </span>
                      <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">
                        {notification.message}
                      </span>
                      <time className="mt-1 block text-[10px] text-slate-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </button>
                    {!notification.readAt && (
                      <button
                        type="button"
                        onClick={() => markNotificationAsRead(notification)}
                        aria-label={`Mark as read: ${notification.title}`}
                        title="Mark as read"
                        className="mt-1 rounded-lg p-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-800"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(notification)}
                      aria-label={`Delete notification: ${notification.title}`}
                      className="mt-1 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-slate-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* THEME */}

          <button
            onClick={toggleTheme}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-sky-600
              transition
              hover:bg-sky-50
              hover:shadow-md
              hover:shadow-sky-500/10
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-yellow-300
              dark:hover:bg-slate-800
            "
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <Sun
                size={19}
                className="text-yellow-300"
              />
            ) : (
              <Moon
                size={19}
                className="text-sky-600"
              />
            )}
          </button>

          {/* DIVIDER */}

          <div
            className="
              hidden
              h-9
              w-px
              bg-slate-200
              dark:bg-slate-800
              sm:block
            "
          />

          {/* PROFILE */}

          <div className="relative">
            <button
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                px-1.5
                py-1.5
                transition
                hover:bg-sky-50
                dark:hover:bg-slate-800
                sm:px-2
              "
            >
              {/* AVATAR */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-sky-500
                  via-cyan-500
                  to-blue-500
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-sky-500/25
                  ring-2
                  ring-white
                  dark:ring-slate-950
                "
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  (user?.name || "U")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              {/* NAME */}

              <div className="hidden text-left md:block">
                <p
                  className="
                    max-w-[110px]
                    truncate
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {user?.name || "User"}
                </p>

                <p
                  className="
                    text-[10px]
                    text-sky-500
                  "
                >
                  Account
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`
                  hidden
                  text-sky-400
                  transition-transform
                  sm:block

                  ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[58px]
                  w-[250px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-2
                  shadow-2xl
                  shadow-slate-900/15
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:shadow-black/50
                "
              >
                <div
                  className="
                    mb-1
                    border-b
                    border-slate-100
                    px-3
                    py-3
                    dark:border-slate-800
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    {user?.name || "User"}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      text-sky-500
                    "
                  >
                    {user?.email || ""}
                  </p>
                </div>

                <button
                  onClick={openProfile}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    transition
                    hover:bg-sky-50
                    hover:text-sky-700
                    dark:text-slate-200
                    dark:hover:bg-slate-800
                    dark:hover:text-sky-300
                  "
                >
                  <User
                    size={17}
                    className="text-sky-500"
                  />
                  My Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    text-rose-600
                    transition
                    hover:bg-rose-50
                    dark:hover:bg-rose-950/20
                  "
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
