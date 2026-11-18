"use client";

import Link from "next/link";
import {
  UserPlus,
  FileSearch,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Register securely and create your Lost & Found account.",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Report an Item",
    description:
      "Submit details about something you lost or found, including useful item information and a photo.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Smart Matching",
    description:
      "The system compares relevant item information and identifies potential matches.",
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Connect",
    description:
      "When a potential match appears, users can communicate securely through messaging.",
  },
  {
    number: "05",
    icon: CheckCircle2,
    title: "Recover the Item",
    description:
      "Coordinate with the matched person and arrange the return of the item.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f6fb] via-[#f5fbfd] to-[#eaf7fb] px-5 py-14 text-[#102a43] sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-cyan-200/35 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-sky-200/35 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* HEADING */}
        <div className="mx-auto max-w-3xl text-center">

          <span className="inline-flex items-center rounded-full border border-cyan-100 bg-white/80 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
            How It Works
          </span>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            From lost to found,
            <span className="block text-slate-500">
              in a few simple steps.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            A simple process designed to help people report
            items, discover potential matches and connect
            with the right person.
          </p>

        </div>

        {/* STEPS */}
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative overflow-hidden rounded-3xl border border-white bg-white/85 p-5 shadow-[0_10px_28px_rgba(16,42,67,.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1.5 hover:border-cyan-200 hover:bg-white hover:shadow-[0_18px_38px_rgba(21,155,193,.13)]"
              >
                <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-sky-500 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-center justify-between">

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 text-xs font-black text-cyan-700 ring-1 ring-cyan-100">
                    {step.number}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-50 to-sky-100 shadow-sm ring-1 ring-cyan-100/80 transition-transform duration-300 group-hover:scale-105">
                    <Icon
                      size={21}
                      className="text-cyan-700"
                    />
                  </div>

                </div>

                <h3 className="mt-5 text-base font-bold tracking-tight sm:text-lg">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {step.description}
                </p>

              </div>
            );
          })}

        </div>

        {/* LINK */}
        <div className="mt-7 flex justify-center">

          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/75 px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-md"
          >
            Learn more about the process
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>
    </section>
  );
}