"use client";

import {
  Search,
  Users,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

const stats = [
  {
    icon: Search,
    value: "Smart",
    label: "Item Matching",
  },
  {
    icon: Users,
    value: "Secure",
    label: "User Accounts",
  },
  {
    icon: CheckCircle2,
    value: "Real-Time",
    label: "Match Detection",
  },
  {
    icon: MessageCircle,
    value: "Direct",
    label: "User Messaging",
  },
];

export default function Statistics() {
  return (
    <section className="bg-gradient-to-b from-[#e4f5fa] to-[#edf8fc] px-5 py-7 text-[#102a43] sm:px-8 sm:py-8 lg:px-10">

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 lg:grid-cols-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group rounded-2xl border border-white bg-white/85 p-5 shadow-[0_10px_28px_rgba(16,42,67,.06)] transition duration-300 hover:-translate-y-1.5 hover:border-cyan-200 hover:bg-white hover:shadow-[0_18px_36px_rgba(21,155,193,.12)]"
            >

              <div className="flex items-center justify-between">

                <Icon
                  size={22}
                  className="text-cyan-600 transition-transform duration-300 group-hover:scale-110"
                />

                <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(21,155,193,.35)]" />

              </div>

              <p className="mt-4 text-xl font-black">
                {item.value}
              </p>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {item.label}
              </p>

            </div>
          );
        })}

      </div>
    </section>
  );
}