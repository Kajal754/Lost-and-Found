"use client";

import { useState } from "react";
import {
  Search,
  Image,
  Bell,
  MessageCircle,
  ShieldCheck,
  Database,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Matching",
    description:
      "Compare category, title, location, color, brand and description to discover potential matches.",
  },
  {
    icon: Image,
    title: "Photo Upload",
    description:
      "Upload a photo of your lost or found item so people can recognize it more easily.",
  },
  {
    icon: Bell,
    title: "Match Notifications",
    description:
      "Get notified when the platform identifies a potential match between lost and found reports.",
  },
  {
    icon: MessageCircle,
    title: "User Messaging",
    description:
      "Communicate securely with the matched person through the built-in messaging system.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Accounts",
    description:
      "Your personal information and item reports remain protected behind authenticated access.",
  },
  {
    icon: Database,
    title: "Persistent Data",
    description:
      "Your account and item information are stored in the database and remain available after refresh.",
  },
];

export default function Features() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <section className="bg-gradient-to-b from-[#eaf7fb] via-[#f5fbfd] to-[#e6f5fa] px-5 py-14 text-[#102a43] sm:px-8 sm:py-16 lg:px-10 lg:py-20">

      <div className="mx-auto max-w-7xl">

        {/* HEADING */}
        <div className="mx-auto max-w-2xl text-center">

          <span className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-700">
            Platform Features
          </span>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Everything you need to
            <span className="block text-slate-500">
              find what matters.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600">
            A complete platform for reporting, matching and
            securely communicating about lost and found items.
          </p>

        </div>

        {/* CARDS */}
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;
            const isSelected = selectedFeature === feature.title;

            return (
              <button
                key={feature.title}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  setSelectedFeature((current) =>
                    current === feature.title ? null : feature.title
                  )
                }
                className={`group w-full rounded-3xl border p-6 text-left shadow-[0_10px_28px_rgba(16,42,67,.06)] backdrop-blur-sm transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-emerald-900 bg-emerald-900 text-white shadow-[0_18px_38px_rgba(23,92,67,.24)]"
                    : "border-white bg-white/85 hover:-translate-y-1.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-[0_18px_38px_rgba(23,92,67,.12)]"
                }`}
              >

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 transition duration-300 group-hover:scale-110 ${
                    isSelected
                      ? "bg-white/10 text-emerald-100 ring-white/20"
                      : "bg-gradient-to-br from-cyan-100 to-blue-50 ring-cyan-100"
                  }`}
                >

                  <Icon
                    size={23}
                    className={isSelected ? "text-emerald-100" : "text-cyan-700"}
                  />

                </div>

                <h3 className={`mt-5 text-lg font-bold ${isSelected ? "text-white" : ""}`}>
                  {feature.title}
                </h3>

                <p className={`mt-3 text-sm leading-7 ${isSelected ? "text-emerald-50" : "text-slate-600"}`}>
                  {feature.description}
                </p>

              </button>
            );
          })}

        </div>

      </div>
    </section>
  );
}