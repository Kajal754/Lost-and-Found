"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Menu,
  X,
  LayoutDashboard,
  Search,
  Package,
  ClipboardList,
  Target,
  MessageCircle,
  User,
  ScanLine,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/lost-item",
    label: "Report Lost",
    icon: Search,
  },
  {
    href: "/found-item",
    label: "Report Found",
    icon: Package,
  },
  {
    href: "/my-items",
    label: "My Items",
    icon: ClipboardList,
  },
  {
    href: "/scan-qr",
    label: "Scan QR",
    icon: ScanLine,
  },
  {
    href: "/matches",
    label: "Matches",
    icon: Target,
  },
  {
    href: "/nearby",
    label: "Nearby Map",
    icon: MapPin,
  },
  {
    href: "/claims",
    label: "My Claims",
    icon: BadgeCheck,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageCircle,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { setIsAdmin(JSON.parse(localStorage.getItem("lostFoundUser") || "null")?.role === "ADMIN"); }
      catch { setIsAdmin(false); }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const visibleLinks = isAdmin ? [...links, { href: "/admin", label: "Admin Center", icon: ShieldCheck }] : links;

  const isActive = (href) => {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href))
    );
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="
          fixed
          left-4
          top-4
          z-[70]
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          border
          border-slate-200
          bg-white
          text-slate-700
          shadow-lg
          shadow-slate-900/10
          transition-all
          hover:scale-105
          hover:bg-slate-50
          lg:hidden
        "
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close sidebar"
          className="
            fixed
            inset-0
            z-[60]
            bg-slate-950/30
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          z-[65]
          flex
          w-[280px]
          max-w-[85vw]
          flex-col
          overflow-hidden
          border-r
          border-slate-200
          bg-[#f5fcfe]
          text-slate-800
          dark:border-slate-800
          dark:bg-slate-950
          dark:text-slate-100
          shadow-2xl
          shadow-slate-900/10
          transition-transform
          duration-300
          lg:hidden

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* MOBILE HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            bg-[#f5fcfe]
            px-5
            py-5
            dark:border-slate-800
            dark:bg-slate-950
          "
        >
          <Link
            href="/dashboard"
            onClick={closeMobile}
            className="flex items-center gap-3"
          >
            <Logo />

            <div>
              <div
                className="
                  text-lg
                  font-black
                  tracking-tight
                  text-slate-800
                "
              >
                Lost
                <span className="text-sky-500">+</span>
                Found
              </div>

              <p
                className="
                  mt-0.5
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                "
              >
                Reconnect & Recover
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobile}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-slate-50
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        <nav className="flex-1 overflow-y-auto p-4">
          <p
            className="
              mb-3
              px-3
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-slate-400
            "
          >
            Main Menu
          </p>

          <div className="space-y-1.5">
        {visibleLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-3
                    transition-all

                    ${
                      active
                        ? `
                          bg-sky-50
                          text-sky-700
                          dark:bg-sky-950/60
                          dark:text-sky-300
                        `
                        : `
                          text-slate-500
                          hover:bg-slate-50
                          hover:text-slate-800
                          dark:text-slate-400
                          dark:hover:bg-slate-800
                          dark:hover:text-slate-100
                        `
                    }
                  `}
                >
                  {active && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-7
                        w-1
                        -translate-y-1/2
                        rounded-r-full
                        bg-sky-500
                      "
                    />
                  )}

                  <span
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      transition-all

                      ${
                        active
                          ? `
                            bg-white
                            text-sky-600
                            shadow-sm
                            shadow-sky-500/10
                            dark:bg-slate-800
                            dark:text-sky-300
                          `
                          : `
                            bg-slate-50
                            text-slate-500
                            group-hover:bg-white
                            group-hover:text-sky-600
                            dark:bg-slate-900
                            dark:text-slate-400
                            dark:group-hover:bg-slate-800
                            dark:group-hover:text-sky-300
                          `
                      }
                    `}
                  >
                    <Icon size={19} />
                  </span>

                  <span className="flex-1 text-sm font-semibold">
                    {link.label}
                  </span>

                  <ChevronRight
                    size={16}
                    className={
                      active
                        ? "text-sky-400"
                        : "text-slate-300 group-hover:text-sky-400"
                    }
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* MOBILE FOOTER */}

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div
            className="
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              p-4
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <p className="text-xs font-bold text-slate-600 dark:text-slate-200">
              Lost & Found System
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              © 2026 • Reconnect & Recover
            </p>
          </div>
        </div>
      </aside>

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          left-0
          top-0
          bottom-0
          z-40
          hidden
          w-64
          flex-col
          overflow-hidden
          border-r
          border-slate-200
          bg-[#f5fcfe]
          text-slate-800
          dark:border-slate-800
          dark:bg-slate-950
          dark:text-slate-100
          shadow-xl
          shadow-slate-900/5
          lg:flex
        "
      >
        {/* DESKTOP LOGO */}

        <div
          className="
            border-b
            border-slate-100
            bg-[#f5fcfe]
            px-6
            py-6
            dark:border-slate-800
            dark:bg-slate-950
          "
        >
          <Link href="/dashboard">
            <div className="group flex items-center gap-3">
              <Logo />

              <div>
                <div
                  className="
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-800
                    dark:text-slate-100
                  "
                >
                  Lost
                  <span className="text-sky-500">+</span>
                  Found
                </div>

                <p
                  className="
                    mt-0.5
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-slate-400
                  "
                >
                  Reconnect & Recover
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* DESKTOP NAV */}

        <nav
          className="
            flex-1
            space-y-1.5
            overflow-y-auto
            p-4
          "
        >
          <p
            className="
              mb-3
              px-4
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-slate-400
            "
          >
            Main Menu
          </p>

          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group
                  relative
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  px-3
                  py-3
                  transition-all
                  duration-200

                  ${
                    active
                      ? `
                        bg-sky-50
                        text-sky-700
                        dark:bg-sky-950/60
                        dark:text-sky-300
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-50
                        hover:text-slate-800
                        dark:text-slate-400
                        dark:hover:bg-slate-800
                        dark:hover:text-slate-100
                      `
                  }
                `}
              >
                {/* ACTIVE INDICATOR */}

                {active && (
                  <span
                    className="
                      absolute
                      left-0
                      top-1/2
                      h-7
                      w-1
                      -translate-y-1/2
                      rounded-r-full
                      bg-sky-500
                    "
                  />
                )}

                {/* ICON */}

                <span
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    transition-all

                    ${
                      active
                        ? `
                          bg-white
                          text-sky-600
                          shadow-sm
                          shadow-sky-500/10
                          dark:bg-slate-800
                          dark:text-sky-300
                        `
                        : `
                          bg-slate-50
                          text-slate-500
                          group-hover:bg-white
                          group-hover:text-sky-600
                          dark:bg-slate-900
                          dark:text-slate-400
                          dark:group-hover:bg-slate-800
                          dark:group-hover:text-sky-300
                        `
                    }
                  `}
                >
                  <Icon size={19} />
                </span>

                {/* LABEL */}

                <span
                  className={`
                    text-sm
                    font-semibold
                    ${
                      active
                        ? "text-sky-700 dark:text-sky-300"
                        : "text-slate-600 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-100"
                    }
                  `}
                >
                  {link.label}
                </span>

                {/* ACTIVE DOT */}

                {active && (
                  <span
                    className="
                      ml-auto
                      h-2
                      w-2
                      rounded-full
                      bg-sky-500
                    "
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP FOOTER */}

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div
            className="
              rounded-2xl
              border
              border-slate-100
              bg-slate-50
              p-4
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <p className="text-xs font-bold text-slate-600 dark:text-slate-200">
              Lost & Found System
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              © 2026 • Reconnect & Recover
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}


/* ============================================================
   LOGO
============================================================ */

function Logo() {
  return (
    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-sky-400
        to-sky-600
        text-xl
        font-black
        text-white
        shadow-lg
        shadow-sky-500/20
        transition-all
        group-hover:scale-105
        group-hover:shadow-sky-500/30
      "
    >
      L
    </div>
  );
}
