"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  UserPlus,
  Search,
  Sparkles,
  MessageCircle,
  Heart,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from "lucide-react";

import { api } from "../../lib/api";
import { saveAuth } from "../../lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      saveAuth(data);
      router.replace("/dashboard");
    } catch (error) {
      setError(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        relative min-h-screen overflow-hidden
        bg-[#f3faff] text-slate-900
        transition-colors duration-300
        dark:bg-[#071b2d]
        dark:text-[#e7f7fb]
      "
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute -left-40 -top-40 h-[500px] w-[500px]
            rounded-full bg-cyan-300/25 blur-[120px]
            dark:bg-cyan-500/10
          "
        />

        <div
          className="
            absolute right-[-180px] top-[15%] h-[600px] w-[600px]
            rounded-full bg-blue-300/25 blur-[130px]
            dark:bg-blue-600/10
          "
        />

        <div
          className="
            absolute bottom-[-250px] left-[25%] h-[600px] w-[600px]
            rounded-full bg-sky-200/30 blur-[130px]
            dark:bg-sky-500/10
          "
        />
      </div>

      {/* Header */}
      <header
        className="
          relative z-20 flex items-center justify-between
          px-5 py-5 sm:px-8 lg:px-12
        "
      >
        <Link href="/" className="flex items-center gap-3">
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-[14px]
              bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600
              text-white
              shadow-lg shadow-sky-300/30
              dark:shadow-cyan-950/40
            "
          >
            <MapPin className="h-6 w-6" strokeWidth={2.5} />
          </div>

          <div>
            <div
              className="
                text-xl font-extrabold tracking-tight
                text-[#102a43]
                dark:text-white
              "
            >
              Lost<span className="text-cyan-500">+</span>Found
            </div>

            <div
              className="
                -mt-0.5 text-[8px] font-bold tracking-[0.28em]
                text-slate-400
                dark:text-slate-500
              "
            >
              RECONNECT & RECOVER
            </div>
          </div>
        </Link>

        <div
          className="
            text-xs font-medium
            text-slate-500
            dark:text-slate-400
            sm:text-sm
          "
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="
              font-bold text-cyan-600 transition
              hover:text-blue-700
              dark:text-cyan-300
              dark:hover:text-cyan-200
            "
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main section */}
      <section
        className="
          relative z-10 mx-auto flex
          min-h-[calc(100vh-90px)]
          max-w-[1450px] items-center
          px-5 pb-10 sm:px-8 lg:px-12
        "
      >
        <div
          className="
            grid w-full items-center gap-10
            lg:grid-cols-[1.1fr_0.9fr]
            lg:gap-14
          "
        >
          {/* LEFT SIDE */}
          <div className="relative hidden min-h-[650px] lg:block">

            <div className="absolute left-0 top-[100px] z-10 max-w-[560px]">
              <div
                className="
                  mb-5 flex items-center gap-2
                  text-[11px] font-extrabold uppercase
                  tracking-[0.25em]
                  text-cyan-600
                  dark:text-cyan-300
                "
              >
                <Sparkles className="h-4 w-4" />
                Somewhere out there...
              </div>

              <h1
                className="
                  text-[58px] font-black leading-[0.98]
                  tracking-[-0.045em]
                  text-[#102a43]
                  dark:text-white
                  xl:text-[66px]
                "
              >
                Lost Something?
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-blue-600 via-sky-500 to-cyan-400
                    bg-clip-text text-transparent
                  "
                >
                  Let&apos;s Find It.
                </span>
              </h1>

              <p
                className="
                  mt-7 max-w-[480px]
                  text-[16px] font-medium leading-7
                  text-slate-600
                  dark:text-slate-300/70
                "
              >
                Join a community that helps people reconnect with
                their lost belongings through smart matching and
                secure conversations.
              </p>

              <div className="mt-7 space-y-3">
                <Feature
                  icon={<Search />}
                  text="Report lost & found items"
                />

                <Feature
                  icon={<Sparkles />}
                  text="Get smart automatic matches"
                />

                <Feature
                  icon={<MessageCircle />}
                  text="Chat securely with matched users"
                />

                <Feature
                  icon={<Heart />}
                  text="Reconnect with what matters"
                />
              </div>
            </div>

            {/* 3D visual */}
            <div className="absolute bottom-[-15px] right-[-20px] h-[390px] w-[620px]">

              <div
                className="
                  absolute left-[100px] top-[90px]
                  h-[240px] w-[350px]
                  rounded-full
                  bg-cyan-300/30 blur-[70px]
                  dark:bg-cyan-500/10
                "
              />

              {/* Search card */}
              <div
                className="
                  absolute left-[55px] top-[55px] z-20
                  rotate-[-7deg]
                  rounded-2xl
                  border border-white/80
                  bg-white/90
                  p-4
                  shadow-[0_20px_45px_rgba(15,118,180,0.18)]
                  backdrop-blur-xl
                  dark:border-white/10
                  dark:bg-[#102d43]/90
                  dark:shadow-[0_20px_45px_rgba(0,0,0,0.3)]
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-11 w-11 items-center justify-center
                      rounded-xl
                      bg-sky-50 text-sky-500
                      dark:bg-cyan-500/10
                      dark:text-cyan-300
                    "
                  >
                    <Search className="h-5 w-5" />
                  </div>

                  <div>
                    <div
                      className="
                        text-xs font-bold
                        text-slate-700
                        dark:text-white
                      "
                    >
                      Searching...
                    </div>

                    <div
                      className="
                        text-[10px]
                        text-slate-400
                        dark:text-slate-400
                      "
                    >
                      Finding your belongings
                    </div>
                  </div>
                </div>
              </div>

              {/* Heart card */}
              <div
                className="
                  absolute right-[65px] top-[70px] z-20
                  rotate-[8deg]
                  rounded-2xl
                  border border-white/90
                  bg-white/90
                  p-4
                  shadow-[0_20px_45px_rgba(15,118,180,0.18)]
                  backdrop-blur-xl
                  dark:border-white/10
                  dark:bg-[#102d43]/90
                "
              >
                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-xl
                    bg-cyan-50 text-cyan-500
                    dark:bg-cyan-500/10
                    dark:text-cyan-300
                  "
                >
                  <Heart className="h-5 w-5 fill-cyan-100" />
                </div>
              </div>

              {/* Pin */}
              <div className="absolute left-[245px] top-[35px] z-10">
                <div className="relative flex h-[190px] w-[135px] items-center justify-center">
                  <div
                    className="
                      absolute bottom-[-38px]
                      h-12 w-32 rounded-[50%]
                      bg-sky-400/20 blur-xl
                      dark:bg-cyan-400/10
                    "
                  />

                  <div
                    className="
                      relative h-[150px] w-[115px]
                      rotate-[4deg]
                      rounded-[60px_60px_60px_18px]
                      bg-gradient-to-br
                      from-cyan-400 via-sky-500 to-blue-600
                      shadow-[inset_-12px_-15px_25px_rgba(0,70,180,0.25),0_25px_45px_rgba(0,130,220,0.28)]
                    "
                  >
                    <div
                      className="
                        absolute left-[25px] top-[23px]
                        h-12 w-12 rounded-full
                        bg-white/20 blur-sm
                      "
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl">
                        <MapPin
                          className="h-8 w-8 text-sky-500"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Found notification */}
              <div
                className="
                  absolute bottom-[70px] right-[5px] z-30
                  rounded-2xl
                  bg-gradient-to-r from-blue-600 to-cyan-500
                  px-5 py-4 text-white
                  shadow-[0_20px_40px_rgba(14,116,214,0.28)]
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-sm font-extrabold">
                      Found!
                    </div>

                    <div className="text-[10px] text-white/75">
                      Someone found your item
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div className="absolute bottom-[5px] left-[115px] h-[75px] w-[430px]">
                <div
                  className="
                    absolute inset-0 rounded-[50%]
                    border-[6px] border-white/80
                    bg-gradient-to-b from-white/80 to-sky-100/50
                    shadow-[0_20px_45px_rgba(14,116,180,0.12)]
                    dark:border-cyan-100/20
                    dark:from-slate-300/20
                    dark:to-cyan-500/10
                  "
                />

                <div
                  className="
                    absolute left-[45px] right-[45px] top-[18px]
                    h-[35px] rounded-[50%]
                    bg-white/70 blur-[1px]
                    dark:bg-slate-900/50
                  "
                />
              </div>
            </div>

            <div
              className="
                absolute bottom-[5px] left-0
                text-xs font-semibold italic
                text-cyan-600
                dark:text-cyan-300
              "
            >
              Every lost item can make big stories.
            </div>
          </div>

          {/* RIGHT REGISTER CARD */}
          <div className="flex w-full justify-center lg:justify-end">
            <div className="w-full max-w-[515px]">

              <div
                className="
                  mb-3 text-right text-xs
                  text-slate-500
                  dark:text-slate-400
                  lg:hidden
                "
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="
                    font-bold text-cyan-600
                    dark:text-cyan-300
                  "
                >
                  Login
                </Link>
              </div>

              <div
                className="
                  rounded-[30px]
                  border border-slate-200
                  bg-white/90
                  p-6
                  shadow-[0_25px_80px_rgba(28,105,150,0.13)]
                  backdrop-blur-xl
                  transition-colors duration-300
                  sm:p-8
                  dark:border-white/10
                  dark:bg-[#102d43]/95
                  dark:shadow-[0_25px_80px_rgba(0,0,0,0.3)]
                "
              >
                {/* Card heading */}
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className="
                      flex h-12 w-12 shrink-0 items-center justify-center
                      rounded-2xl
                      bg-gradient-to-br from-cyan-50 to-sky-100
                      text-sky-500 shadow-inner
                      dark:from-cyan-500/15
                      dark:to-blue-500/10
                      dark:text-cyan-300
                    "
                  >
                    <UserPlus className="h-6 w-6" />
                  </div>

                  <div>
                    <h2
                      className="
                        text-[21px] font-extrabold tracking-tight
                        text-[#102a43]
                        dark:text-white
                      "
                    >
                      Create Your Account
                    </h2>

                    <p
                      className="
                        mt-0.5 text-xs
                        text-slate-400
                        dark:text-slate-400
                      "
                    >
                      Start your Lost & Found journey
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="
                      mb-5 rounded-xl
                      border border-red-200
                      bg-red-50
                      px-4 py-3
                      text-sm font-medium text-red-600
                      dark:border-red-400/20
                      dark:bg-red-500/10
                      dark:text-red-300
                    "
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormField
                    label="Full Name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                  />

                  <div>
                    <label
                      className="
                        mb-2 block text-[12px] font-bold
                        text-slate-600
                        dark:text-slate-300
                      "
                    >
                      Email{" "}
                      <span className="font-medium text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="
                        h-[48px] w-full rounded-xl
                        border border-slate-200
                        bg-[#f4faff]
                        px-4 text-sm font-medium
                        text-slate-800
                        outline-none transition
                        placeholder:text-slate-400
                        focus:border-cyan-400
                        focus:bg-white
                        focus:ring-4 focus:ring-cyan-100
                        dark:border-white/15
                        dark:bg-[#173b53]
                        dark:text-white
                        dark:placeholder:text-slate-400
                        dark:focus:border-cyan-400
                        dark:focus:bg-[#1b435d]
                        dark:focus:ring-cyan-500/10
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                        mb-2 block text-[12px] font-bold
                        text-slate-600
                        dark:text-slate-300
                      "
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                        minLength={6}
                        required
                        className="
                          h-[48px] w-full rounded-xl
                          border border-slate-200
                          bg-[#f4faff]
                          px-4 pr-12
                          text-sm font-medium
                          text-slate-800
                          outline-none transition
                          placeholder:text-slate-400
                          focus:border-cyan-400
                          focus:bg-white
                          focus:ring-4 focus:ring-cyan-100
                          dark:border-white/15
                          dark:bg-[#173b53]
                          dark:text-white
                          dark:placeholder:text-slate-400
                          dark:focus:border-cyan-400
                          dark:focus:bg-[#1b435d]
                          dark:focus:ring-cyan-500/10
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="
                          absolute right-4 top-1/2
                          -translate-y-1/2
                          text-slate-400 transition
                          hover:text-cyan-500
                          dark:hover:text-cyan-300
                        "
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group mt-2 flex h-[52px] w-full
                      items-center justify-center gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-blue-600 via-sky-500 to-cyan-400
                      text-sm font-extrabold text-white
                      shadow-[0_12px_25px_rgba(14,116,214,0.25)]
                      transition duration-300
                      hover:-translate-y-0.5
                      hover:shadow-[0_16px_30px_rgba(14,116,214,0.3)]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading ? "Creating Account..." : "Create Account"}

                    {!loading && (
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </form>

                {/* Security */}
                <div
                  className="
                    mt-5 flex items-center justify-center gap-2
                    text-[10px] font-medium
                    text-slate-400
                    dark:text-slate-400
                  "
                >
                  <ShieldCheck className="h-4 w-4 text-cyan-500" />
                  Your information is securely protected
                </div>

                {/* Login */}
                <div
                  className="
                    mt-5 border-t border-slate-200
                    pt-5 text-center text-xs
                    text-slate-500
                    dark:border-white/10
                    dark:text-slate-400
                  "
                >
                  Already a member?{" "}
                  <Link
                    href="/login"
                    className="
                      font-bold text-cyan-600
                      hover:text-blue-700
                      dark:text-cyan-300
                      dark:hover:text-cyan-200
                    "
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   FEATURE COMPONENT
========================================================= */

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex h-10 w-10 items-center justify-center
          rounded-xl
          border border-white/80
          bg-white/80
          text-cyan-500
          shadow-[0_8px_20px_rgba(15,118,180,0.08)]
          dark:border-white/10
          dark:bg-[#102d43]/80
          dark:text-cyan-300
        "
      >
        <span className="h-5 w-5">{icon}</span>
      </div>

      <span
        className="
          text-sm font-semibold
          text-slate-600
          dark:text-slate-300/75
        "
      >
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   FORM FIELD COMPONENT
========================================================= */

function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        className="
          mb-2 block text-[12px] font-bold
          text-slate-600
          dark:text-slate-300
        "
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="
          h-[48px] w-full rounded-xl
          border border-slate-200
          bg-[#f4faff]
          px-4
          text-sm font-medium
          text-slate-800
          outline-none transition
          placeholder:text-slate-400
          focus:border-cyan-400
          focus:bg-white
          focus:ring-4 focus:ring-cyan-100
          dark:border-white/15
          dark:bg-[#173b53]
          dark:text-white
          dark:placeholder:text-slate-400
          dark:focus:border-cyan-400
          dark:focus:bg-[#1b435d]
          dark:focus:ring-cyan-500/10
        "
      />
    </div>
  );
}