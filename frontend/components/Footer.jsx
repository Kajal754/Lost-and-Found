"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

const sidebarRoutes = [
  "/dashboard",
  "/lost-item",
  "/found-item",
  "/my-items",
  "/matches",
  "/nearby",
  "/claims",
  "/admin",
  "/messages",
  "/profile",
  "/scan-qr",
];

export default function Footer() {
  const pathname = usePathname();
  const hasSidebar = sidebarRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  return (
    <footer
      className={`
        site-footer relative w-full overflow-hidden
        border-t border-[#315444]
        bg-gradient-to-b from-[#163d2d] via-[#103324] to-[#0b281d]
        text-white
        transition-colors duration-300
        dark:border-[#315444]
        dark:from-[#102b20]
        dark:via-[#0d241a]
        dark:to-[#08180f]
        dark:text-[#e9f2eb]
        ${hasSidebar ? "footer-with-sidebar" : ""}
      `}
    >
      {/* Background glow */}
      <div
        className="
          pointer-events-none absolute -left-32 top-10
          h-64 w-64 rounded-full
          bg-emerald-300/10 blur-[100px]
          dark:bg-emerald-500/10
        "
      />

      <div
        className="
          pointer-events-none absolute -right-32 bottom-0
          h-72 w-72 rounded-full
          bg-green-400/10 blur-[110px]
          dark:bg-green-600/10
        "
      />

      <div className="relative mx-auto w-full max-w-[1450px] px-4 py-4 sm:px-6 lg:px-8">

        {/* =================================================
            BRAND CARD
        ================================================= */}
        <div
          className="
            flex flex-col justify-between gap-3
            rounded-2xl
            border border-white/10
            bg-white/[0.05]
            p-3
            shadow-[0_12px_36px_rgba(0,0,0,0.18)]
            backdrop-blur-xl
            transition-all duration-300
            sm:p-3.5
            lg:flex-row lg:items-center
            dark:border-white/10
            dark:bg-white/[0.045]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          "
        >
          {/* Brand */}
          <div className="flex items-center gap-3">

            <div
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl
                bg-gradient-to-br from-emerald-400 to-green-700
                text-xl font-black text-white
                shadow-[0_12px_30px_rgba(34,139,84,0.25)]
              "
            >
              L
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="
                    text-lg font-black tracking-tight
                    text-white
                    dark:text-white
                    sm:text-xl
                  "
                >
                  Lost<span className="text-emerald-300">+</span>Found
                </h2>

                <span
                  className="
                    rounded-full
                    border border-emerald-300/25
                    bg-emerald-300/10
                    px-2 py-0.5
                    text-[8px] font-extrabold
                    tracking-[0.15em]
                    text-emerald-200
                    dark:border-emerald-500/25
                    dark:bg-emerald-500/10
                    dark:text-emerald-300
                  "
                >
                  COMMUNITY
                </span>
              </div>

              <p
                className="
                  mt-1 text-[9px] font-extrabold
                  tracking-[0.18em]
                  text-slate-400
                  dark:text-slate-400
                "
              >
                RECONNECT & RECOVER
              </p>

              <p
                className="
                  mt-1 max-w-2xl
                  text-[11px] leading-4 text-slate-300
                "
              >
                Helping people reconnect with the things that matter.
                Report lost items, share found items and connect safely.
              </p>
            </div>
          </div>

          {/* Security */}
          <div
            className="
              flex items-center gap-3
              rounded-xl
              border border-emerald-300/20
              bg-emerald-400/[0.08]
              px-3 py-2
            "
          >
            <div
              className="
                flex                 h-8 w-8 shrink-0 items-center justify-center
                rounded-lg
                bg-emerald-400/10
                text-emerald-200
              "
            >
              <ShieldCheck size={19} />
            </div>

            <div>
              <strong
                className="
                  block text-xs font-bold
                  text-emerald-200
                "
              >
                Safe & Secure
              </strong>

              <span
                className="
                  mt-0.5 block text-[10px]
                  text-slate-300/70
                "
              >
                Your data stays protected
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN FOOTER GRID
        ================================================= */}
        <div
          className={`
            grid gap-5 py-4
            md:grid-cols-2
            ${hasSidebar ? "lg:grid-cols-[1.2fr_1.3fr_1fr]" : "lg:grid-cols-[1.3fr_.8fr_1fr]"}
            lg:gap-6
          `}
        >

          {/* ABOUT */}
          <div>
            <h3
              className="
                mb-2 flex items-center gap-2.5
                text-xs font-black tracking-[0.12em]
                text-white
              "
            >
              <span
                className="
                  h-6 w-1 rounded-full
                  bg-gradient-to-b
                  from-emerald-400 to-green-700
                "
              />
              ABOUT US
            </h3>

            <p
              className="
                max-w-sm text-xs leading-5 text-slate-300
              "
            >
              A simple and trusted platform designed to help
              people report, discover and recover lost belongings.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-xl
                  border border-white/10
                  bg-white/[0.05]
                  px-2 py-1
                  text-[10px] font-bold
                  text-slate-300
                  dark:border-white/10
                  dark:bg-white/[0.04]
                "
              >
                <ShieldCheck size={14} className="text-emerald-300" />
                Safe & Secure
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-xl
                  border border-white/10
                  bg-white/[0.05]
                  px-2 py-1
                  text-[10px] font-bold
                  text-slate-300
                  dark:border-white/10
                  dark:bg-white/[0.04]
                "
              >
                <Users size={14} className="text-emerald-300" />
                Community
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-xl
                  border border-white/10
                  bg-white/[0.05]
                  px-2 py-1
                  text-[10px] font-bold
                  text-slate-300
                  dark:border-white/10
                  dark:bg-white/[0.04]
                "
              >
                <Heart size={14} className="text-emerald-300" />
                Trusted
              </span>
            </div>
          </div>

          {hasSidebar ? (
            <div>
              <h3
                className="
                  mb-2 flex items-center gap-2.5
                  text-xs font-black tracking-[0.12em]
                  text-white
                "
              >
                <span
                  className="
                    h-6 w-1 rounded-full
                    bg-gradient-to-b
                    from-emerald-400 to-green-700
                  "
                />
                MY ACCOUNT
              </h3>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <FooterLink href="/dashboard" text="Dashboard" />
                <FooterLink href="/lost-item" text="Report Lost" />
                <FooterLink href="/found-item" text="Report Found" />
                <FooterLink href="/my-items" text="My Items" />
                <FooterLink href="/matches" text="Matches" />
                <FooterLink href="/messages" text="Messages" />
                <FooterLink href="/scan-qr" text="Scan QR" />
                <FooterLink href="/profile" text="Profile" />
              </div>
            </div>
          ) : (
            <div>
              <h3
                className="
                  mb-2 flex items-center gap-2.5
                  text-xs font-black tracking-[0.12em]
                  text-white
                "
              >
                <span
                  className="
                    h-6 w-1 rounded-full
                    bg-gradient-to-b
                    from-emerald-400 to-green-700
                  "
                />
                QUICK LINKS
              </h3>

              <div className="flex flex-col gap-1.5">
                <FooterLink href="/" text="Home" />
                <FooterLink href="/about" text="About" />
                <FooterLink href="/how-it-works" text="How It Works" />
                <FooterLink href="/install" text="Install App" />
                <FooterLink href="/contact" text="Contact" />
              </div>
            </div>
          )}

          {/* CONTACT */}
          <div>
            <h3
              className="
                mb-2 flex items-center gap-2.5
                text-xs font-black tracking-[0.12em]
                text-white
              "
            >
              <span
                className="
                  h-6 w-1 rounded-full
                  bg-gradient-to-b
                  from-emerald-400 to-green-700
                "
              />
              CONTACT
            </h3>

            <div className="flex flex-col gap-2">

              <ContactItem
                icon={<Mail size={17} />}
                label="EMAIL"
                value="support@lostandfound.com"
              />

              <ContactItem
                icon={<Phone size={17} />}
                label="PHONE"
                value="+91 99999 99999"
              />

              <ContactItem
                icon={<MapPin size={17} />}
                label="LOCATION"
                value="India"
              />

            </div>
          </div>
        </div>

        {/* =================================================
            BOTTOM BAR
        ================================================= */}
        <div
          className="
            flex flex-col gap-4
            border-t border-white/10
            py-3
            dark:border-white/10
            md:flex-row md:items-center md:justify-between
          "
        >
          {/* Copyright */}
          <div
            className="
              flex flex-wrap items-center gap-1.5
              text-[10px]
              text-slate-500
              dark:text-slate-400
            "
          >
            <Heart
              size={14}
              fill="currentColor"
              className="text-emerald-300"
            />

            <span>© 2026 Lost & Found.</span>
            <span>Made with</span>

            <Heart
              size={12}
              fill="currentColor"
              className="text-emerald-300"
            />

            <span>for the community.</span>
          </div>

          {/* Status */}
          <div
            className="
              flex w-fit items-center gap-2
              rounded-full
              border border-emerald-300/20
              bg-emerald-400/[0.08]
              px-3 py-2
              text-[10px] font-bold
              text-emerald-200
            "
          >
            <span
              className="
                h-1.5 w-1.5 rounded-full
                bg-emerald-500
                shadow-[0_0_10px_rgba(16,185,129,.8)]
              "
            />
            System Online
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   FOOTER LINK
========================================================= */

function FooterLink({ href, text }) {
  return (
    <Link
      href={href}
      className="
        group flex w-fit items-center gap-2
        text-xs font-medium
        text-slate-300
        transition-all duration-200
        hover:translate-x-1
        dark:hover:text-emerald-200
      "
    >
      <ArrowRight
        size={14}
        className="
          text-emerald-300
          transition-transform duration-200
          group-hover:translate-x-0.5
        "
      />

      {text}
    </Link>
  );
}

/* =========================================================
   CONTACT ITEM
========================================================= */

function ContactItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex h-8 w-8 shrink-0 items-center justify-center
          rounded-lg
          border border-white/10
          bg-white/[0.06]
          text-emerald-200
        "
      >
        {icon}
      </div>

      <div>
        <small
          className="
            block text-[8px] font-bold tracking-[0.1em]
            text-slate-400
            dark:text-slate-500
          "
        >
          {label}
        </small>

        <strong
          className="
            mt-0.5 block text-[11px]
            text-white/90
          "
        >
          {value}
        </strong>
      </div>
    </div>
  );
}
