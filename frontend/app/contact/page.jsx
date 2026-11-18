import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

const contactOptions = [
  {
    icon: Mail,
    label: "Email",
    value: "support@lostandfound.com",
    href: "mailto:support@lostandfound.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 99999 99999",
    href: "tel:+919999999999",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "India",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#edf8fc] via-[#f7fcfe] to-[#e8f6fb] px-5 py-16 text-[#102a43] sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] border border-white bg-white/80 p-7 shadow-[0_24px_70px_rgba(21,100,140,.12)] backdrop-blur-sm sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-200/40 blur-[90px]" />
          <div className="relative grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
            <div>
              <span className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-700">
                Get in touch
              </span>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                We’re here to help.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600">
                Have a question about reporting an item or connecting with a
                match? Reach out and our team will be happy to help.
              </p>
              <Link
                href="/how-it-works"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-cyan-700 transition hover:text-cyan-900"
              >
                Learn how the platform works <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4">
              {contactOptions.map(({ icon: Icon, label, value, href }) => {
                const content = (
                  <>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                      <Icon size={21} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        {label}
                      </span>
                      <span className="mt-1 block break-words text-sm font-bold text-[#102a43] sm:text-base">
                        {value}
                      </span>
                    </span>
                  </>
                );

                return href ? (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-4 rounded-2xl border border-[#d9edf2] bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={label}
                    className="flex items-center gap-4 rounded-2xl border border-[#d9edf2] bg-white/90 p-5 shadow-sm"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}