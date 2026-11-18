"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PackageSearch, X } from "lucide-react";

const publicPaths = ["/", "/about", "/how-it-works", "/install", "/contact"];

const links = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/install", label: "Install App" },
  { href: "/contact", label: "Contact" },
];

export default function WebsiteNavbar() {
  const pathname = usePathname();

  if (!publicPaths.includes(pathname)) {
    return null;
  }

  return <PublicNavbar key={pathname} pathname={pathname} />;
}

function PublicNavbar({ pathname }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="website-navbar sticky top-0 z-50 border-b border-[#315444] bg-gradient-to-b from-[#163d2d] via-[#103324] to-[#0b281d] text-white shadow-[0_8px_24px_rgba(9,40,27,0.18)] dark:border-[#315444] dark:from-[#102b20] dark:via-[#0d241a] dark:to-[#08180f]">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-100 ring-1 ring-white/15">
            <PackageSearch size={21} />
          </span>
          <span>
            <span className="block text-base font-extrabold tracking-tight sm:text-lg">
              Lost<span className="text-emerald-300">+</span>Found
            </span>
            <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-emerald-100/65">
              Reconnect & Recover
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-emerald-50/75 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-emerald-50/80 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#f2f6ee] px-4 py-2.5 text-sm font-bold text-[#174c38] shadow-sm transition hover:bg-white"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="website-mobile-navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-emerald-50 transition hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="website-mobile-navigation"
          aria-label="Mobile navigation"
          className="website-navbar-panel border-t border-white/10 bg-gradient-to-b from-[#163d2d] via-[#103324] to-[#0b281d] px-5 py-4 shadow-xl lg:hidden dark:from-[#102b20] dark:via-[#0d241a] dark:to-[#08180f]"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-emerald-50/80 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-2 flex items-center gap-3 border-t border-white/10 pt-3">
              <Link
                href="/login"
                className="flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-emerald-50/80 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-xl bg-[#f2f6ee] px-3 py-2.5 text-center text-sm font-bold text-[#174c38] transition hover:bg-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
