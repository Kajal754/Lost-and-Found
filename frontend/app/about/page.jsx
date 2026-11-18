import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Community first",
    description:
      "We make it easier for people to help one another recover the things they have lost.",
  },
  {
    icon: Search,
    title: "Smarter discovery",
    description:
      "Useful item details help people find relevant lost-and-found reports more quickly.",
  },
  {
    icon: ShieldCheck,
    title: "Safer connections",
    description:
      "Private accounts and direct messaging help people coordinate a return with care.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#edf8fc] via-[#f7fcfe] to-[#e8f6fb] text-[#102a43]">
      <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full bg-cyan-200/40 blur-[100px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
              About Lost & Found
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              A little help can bring{" "}
              <span className="bg-gradient-to-r from-cyan-700 to-blue-600 bg-clip-text text-transparent">
                something important back.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Lost & Found brings people and item reports together in one
              friendly place. Share what you lost, report what you found, and
              connect when the details line up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5"
              >
                See how it works <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-bold text-[#102a43] transition hover:border-cyan-300 hover:bg-white"
              >
                Contact us
              </Link>
            </div>
          </div>

          <div className="relative rounded-[32px] border border-white bg-white/80 p-7 shadow-[0_24px_70px_rgba(21,100,140,.12)] backdrop-blur-sm sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
              <Users size={26} />
            </div>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">
              Reconnect & recover
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Every returned item starts with a connection.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Our goal is to make reporting clear, matching helpful, and
              communication straightforward—so a small act of care can make a
              big difference.
            </p>
            <div className="mt-7 flex items-center gap-3 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">
              <ShieldCheck size={19} className="shrink-0 text-cyan-700" />
              Built to support a thoughtful, safer return.
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-700">
              What matters to us
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Helpful, simple, and human.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-white bg-white/85 p-6 shadow-[0_12px_34px_rgba(16,42,67,.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(21,155,193,.12)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}