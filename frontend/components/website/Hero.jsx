"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f3fbfd] via-[#edf8fc] to-[#e5f5fa] text-[#102a43]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-300/30 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-300/25 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200/40 blur-[120px]" />

      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(21,155,193,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(21,155,193,.07)_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl items-center px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">

          {/* LEFT CONTENT */}
          <div className="max-w-3xl">

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/75 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm backdrop-blur-xl">
              <Sparkles size={15} />
              Smart Lost & Found Platform
            </div>

            <h1 className="text-5xl font-black leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Find what you
              <span className="block bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
                lost.
              </span>

              <span className="block">
                Return what you
                <span className="text-emerald-800"> found.</span>
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Lost & Found helps you report lost items, register
              found belongings, discover potential matches and
              securely connect with the right person.
            </p>

            {/* BUTTONS */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/lost-item"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_15px_40px_rgba(14,165,233,.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(14,165,233,.4)]"
              >
                Report Lost Item

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/found-item"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-[#102a43] shadow-sm backdrop-blur-xl transition hover:border-cyan-300 hover:bg-white"
              >
                <Search size={17} />
                Report Found Item
              </Link>

            </div>

            {/* TRUST POINTS */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">

              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-green-600" />
                Secure Accounts
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-700" />
                Smart Matching
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-amber-600" />
                Direct Messaging
              </div>

            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute inset-8 rounded-full bg-cyan-200/45 blur-[80px]" />
            <Image
              src="/images/lost-found-illustration.svg"
              alt="Lost and found items being matched with a magnifying glass"
              width={640}
              height={520}
              priority
              className="relative h-auto w-full drop-shadow-[0_28px_55px_rgba(21,100,140,.16)]"
            />
          </div>

        </div>
      </div>
    </section>
  );
}