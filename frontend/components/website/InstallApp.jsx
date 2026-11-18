"use client";

import {
  Smartphone,
  Monitor,
  Zap,
  ShieldCheck,
} from "lucide-react";

import InstallButton from "../pwa/InstallButton";

export default function InstallApp() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#edf8fc] to-[#e5f5fa] px-5 py-14 text-[#102a43] sm:px-8 sm:py-16 lg:px-10 lg:py-20">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute left-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan-300/30 blur-[120px]" />

      <div className="mx-auto max-w-7xl">

        <div className="relative overflow-hidden rounded-[30px] border border-white bg-gradient-to-br from-white via-[#f4fbfd] to-[#e7f7fb] p-6 shadow-[0_20px_56px_rgba(21,100,140,.11)] sm:p-8 lg:p-10">

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-200/50 blur-[90px]" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-10">

            {/* LEFT */}
            <div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100">

                <Smartphone
                  size={27}
                  className="text-cyan-700"
                />

              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-cyan-700">
                Install the App
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Lost & Found,
                <span className="block text-slate-500">
                  always within reach.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                Install Lost & Found directly from the website
                on supported browsers. Get quick access to your
                dashboard, items, matches and messages.
              </p>

              <div className="mt-8">
                <InstallButton />
              </div>

            </div>

            {/* RIGHT */}
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">

              {/* CARD 1 */}
              <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_10px_28px_rgba(16,42,67,.06)] sm:p-5">

                <Zap
                  size={22}
                  className="text-amber-600"
                />

                <h3 className="mt-4 font-bold">
                  Quick Access
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open your Lost & Found account quickly
                  from your device.
                </p>

              </div>

              {/* CARD 2 */}
              <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_10px_28px_rgba(16,42,67,.06)] sm:p-5">

                <ShieldCheck
                  size={22}
                  className="text-green-600"
                />

                <h3 className="mt-4 font-bold">
                  Secure
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your account and item information remain
                  protected behind authentication.
                </p>

              </div>

              {/* CARD 3 */}
              <div className="rounded-2xl border border-white bg-white/85 p-4 shadow-[0_10px_28px_rgba(16,42,67,.06)] sm:p-5">

                <Monitor
                  size={22}
                  className="text-cyan-700"
                />

                <h3 className="mt-4 font-bold">
                  Phone & Desktop
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Install on supported mobile and desktop
                  browsers.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}