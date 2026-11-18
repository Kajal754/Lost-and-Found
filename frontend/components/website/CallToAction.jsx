"use client";

import Link from "next/link";
import {
  ArrowRight,
  Search,
  Heart,
} from "lucide-react";

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-b from-[#e6f5fa] to-[#edf8fc] px-5 py-14 text-[#102a43] sm:px-8 sm:py-16 lg:px-10 lg:py-20">

      <div className="mx-auto max-w-5xl">

        <div className="relative overflow-hidden rounded-[30px] border border-white bg-gradient-to-br from-white via-[#f4fbfd] to-[#e4f6fb] px-6 py-10 text-center shadow-[0_20px_56px_rgba(21,100,140,.11)] sm:px-10 sm:py-12">

          {/* GLOW */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 rounded-full bg-cyan-200/60 blur-[90px]" />

          <div className="relative">

            {/* ICON */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100">

              <Heart
                size={26}
                className="text-cyan-600"
              />

            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Lost something?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Report it today. If someone finds it, our platform
              can help identify a potential match and connect
              you with the right person.
            </p>

            {/* BUTTONS */}
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(14,165,233,.2)] transition duration-300 hover:-translate-y-1"
              >
                Get Started

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/found-item"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-[#102a43] transition hover:border-cyan-300 hover:bg-white"
              >
                <Search size={17} />

                I Found Something
              </Link>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}