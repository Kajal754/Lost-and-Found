"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Search,
  Package,
  Target,
  Zap,
  ArrowUpRight,
  Plus,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  FileSearch,
  MessageCircle,
  ShieldCheck,
  Activity,
  Layers3,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";

import { api } from "../../lib/api";
import { getToken, getUser } from "../../lib/auth";

export default function DashboardPage() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getUser();

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [lost, found, matched] = await Promise.all([
        api.getLostItems(),
        api.getFoundItems(),
        api.getMatches(),
      ]);

      setLostItems(lost.items || []);
      setFoundItems(found.items || []);
      setMatches(matched.matches || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  const myLostItems = lostItems.filter(
    (item) => item.userId === user?.id
  );

  const myFoundItems = foundItems.filter(
    (item) => item.userId === user?.id
  );

  const activeLostItems = myLostItems.filter(
    (item) =>
      String(item.status || "").toLowerCase() === "lost"
  );

  const recentItems = [
    ...myLostItems.map((item) => ({
      ...item,
      itemType: "Lost",
    })),
    ...myFoundItems.map((item) => ({
      ...item,
      itemType: "Found",
    })),
  ].slice(0, 6);

  return (
    <ProtectedRoute>
      <div
        id="dashboard"
        className="
          dashboard-shell
          min-h-screen
          overflow-x-hidden

          bg-[#edf8fc]
          text-slate-800

          dark:bg-[#05080e]
          dark:text-slate-100

          transition-colors
          duration-300
        "
      >
        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <Sidebar />

        {/* ================================================= */}
        {/* MAIN */}
        {/* ================================================= */}

        <div className="lg:ml-64">
          <Navbar />

          <main
            className="
              dashboard-main
              relative
              px-4
              pb-16
              pt-20

              sm:px-6
              sm:pt-20

              lg:px-8
              lg:pt-8

              xl:px-10
            "
          >
            {/* ================================================= */}
            {/* GLOBAL BACKGROUND GLOW */}
            {/* ================================================= */}

            <div
              className="
                pointer-events-none
                fixed
                left-[18%]
                top-20
                -z-0

                h-72
                w-72

                rounded-full

                bg-cyan-300/10
                blur-[110px]

                dark:bg-cyan-500/[0.035]
              "
            />

            <div
              className="
                pointer-events-none
                fixed
                right-[5%]
                top-[35%]
                -z-0

                h-80
                w-80

                rounded-full

                bg-indigo-300/10
                blur-[120px]

                dark:bg-indigo-500/[0.04]
              "
            />

            {/* ================================================= */}
            {/* HERO */}
            {/* ================================================= */}

            <section
              className="
                dashboard-hero
                group
                relative
                mb-7
                overflow-hidden

                rounded-[32px]

                border
                border-white/80
                dark:border-white/[0.08]

                bg-gradient-to-br
                from-[#e5f9ff]
                via-[#d9f5fc]
                to-[#cceeff]

                dark:from-[#0d1c2a]
                dark:via-[#101b2a]
                dark:to-[#101421]

                p-6
                sm:p-8
                lg:p-10

                shadow-[0_25px_80px_rgba(38,155,195,0.16)]
                dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)]

                transition-all
                duration-500

                hover:shadow-[0_30px_90px_rgba(38,155,195,0.20)]
                dark:hover:shadow-[0_35px_100px_rgba(0,0,0,0.52)]
              "
            >
              {/* HERO 3D GLOW */}

              <div
                className="
                  absolute
                  -right-24
                  -top-24

                  h-96
                  w-96

                  rounded-full

                  bg-white/75
                  dark:bg-cyan-300/[0.035]

                  blur-[80px]
                "
              />

              <div
                className="
                  absolute
                  -bottom-36
                  left-[25%]

                  h-96
                  w-96

                  rounded-full

                  bg-cyan-300/30
                  dark:bg-cyan-500/[0.04]

                  blur-[90px]
                "
              />

              <div
                className="
                  absolute
                  left-[15%]
                  top-0

                  h-60
                  w-60

                  rounded-full

                  bg-white/40
                  dark:bg-white/[0.015]

                  blur-[70px]
                "
              />

              {/* DECORATIVE RINGS */}

              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-100px]
                  top-[-100px]

                  h-[420px]
                  w-[420px]

                  rounded-full

                  border
                  border-white/40
                  dark:border-white/[0.035]

                  rotate-12
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-60px]
                  top-[-60px]

                  h-[330px]
                  w-[330px]

                  rounded-full

                  border
                  border-white/40
                  dark:border-white/[0.035]

                  rotate-12
                "
              />

              <div
                className="
                  relative
                  z-10

                  grid
                  items-center
                  gap-10

                  lg:grid-cols-[1fr_auto]
                "
              >
                {/* ================================================= */}
                {/* HERO CONTENT */}
                {/* ================================================= */}

                <div className="max-w-2xl">
                  {/* BADGE */}

                  <div
                    className="
                      dashboard-hero-badge
                      mb-5
                      inline-flex
                      items-center
                      gap-2

                      rounded-full

                      border
                      border-white/80
                      dark:border-white/10

                      bg-white/50
                      dark:bg-white/[0.045]

                      px-3.5
                      py-2

                      text-xs
                      font-bold

                      text-sky-700
                      dark:text-cyan-300

                      shadow-[0_8px_25px_rgba(45,150,190,0.08)]
                      dark:shadow-[0_8px_25px_rgba(0,0,0,0.20)]

                      backdrop-blur-xl
                    "
                  >
                    <span
                      className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center

                        rounded-full

                        bg-sky-100
                        dark:bg-cyan-500/10
                      "
                    >
                      <Sparkles
                        size={12}
                        className="
                          text-sky-600
                          dark:text-cyan-300
                        "
                      />
                    </span>

                    Your Lost & Found Space
                  </div>

                  {/* TITLE */}

                  <h1
                    className="
                      dashboard-hero-title
                      text-3xl
                      font-black
                      leading-[1.06]
                      tracking-tight

                      text-slate-800
                      dark:text-white

                      sm:text-4xl
                      lg:text-5xl
                    "
                  >
                    Welcome back,
                    <br />

                    <span
                      className="
                        dashboard-hero-name
                        bg-gradient-to-r
                        from-sky-600
                        via-cyan-500
                        to-blue-500

                        dark:from-cyan-300
                        dark:via-sky-300
                        dark:to-indigo-300

                        bg-clip-text
                        text-transparent
                      "
                    >
                      {user?.name || "User"}
                    </span>

                    <span className="ml-2">👋</span>
                  </h1>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      dashboard-hero-description
                      mt-5
                      max-w-xl

                      text-sm
                      leading-7

                      text-slate-500
                      dark:text-slate-400

                      sm:text-base
                    "
                  >
                    Keep track of everything you've lost,
                    found, and matched — all in one beautiful
                    place.
                  </p>

                  {/* BUTTONS */}

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/lost-item"
                      className="
                        dashboard-hero-primary
                        group/button
                        inline-flex
                        items-center
                        gap-2

                        rounded-xl

                        border
                        border-white/80
                        dark:border-white/10

                        bg-white
                        dark:bg-white/[0.08]

                        px-5
                        py-3

                        text-sm
                        font-bold

                        text-sky-700
                        dark:text-cyan-200

                        shadow-[0_12px_30px_rgba(55,160,200,0.15)]
                        dark:shadow-[0_12px_30px_rgba(0,0,0,0.25)]

                        transition-all
                        duration-300

                        hover:-translate-y-1
                        hover:bg-white
                        dark:hover:bg-white/[0.13]

                        hover:shadow-[0_18px_35px_rgba(55,160,200,0.22)]
                        dark:hover:shadow-[0_18px_35px_rgba(0,0,0,0.35)]
                      "
                    >
                      <span
                        className="
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center

                          rounded-lg

                          bg-sky-50
                          dark:bg-cyan-400/10
                        "
                      >
                        <Plus size={16} />
                      </span>

                      Report Lost Item

                      <ArrowUpRight
                        size={15}
                        className="
                          transition
                          group-hover/button:-translate-y-0.5
                          group-hover/button:translate-x-0.5
                        "
                      />
                    </Link>

                    <Link
                      href="/found-item"
                      className="
                        dashboard-hero-secondary
                        inline-flex
                        items-center
                        gap-2

                        rounded-xl

                        border
                        border-white/80
                        dark:border-white/10

                        bg-white/30
                        dark:bg-white/[0.035]

                        px-5
                        py-3

                        text-sm
                        font-semibold

                        text-sky-700
                        dark:text-slate-200

                        shadow-[0_8px_25px_rgba(55,160,200,0.07)]
                        dark:shadow-[0_8px_25px_rgba(0,0,0,0.20)]

                        backdrop-blur-xl

                        transition-all
                        duration-300

                        hover:-translate-y-1
                        hover:bg-white/60
                        dark:hover:bg-white/[0.08]

                        hover:shadow-lg
                      "
                    >
                      <Package size={17} />

                      Report Found Item
                    </Link>
                  </div>

                  {/* HERO TRUST */}

                  <div
                    className="
                      mt-6
                      flex
                      flex-wrap
                      items-center
                      gap-4

                      text-[11px]
                      font-semibold

                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck
                        size={14}
                        className="
                          text-emerald-500
                        "
                      />

                      Secure account
                    </div>

                    <div className="h-3 w-px bg-slate-300 dark:bg-white/10" />

                    <div className="flex items-center gap-1.5">
                      <Activity
                        size={14}
                        className="
                          text-sky-500
                          dark:text-cyan-400
                        "
                      />

                      Live matching
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* HERO 3D VISUAL */}
                {/* ================================================= */}

                <div
                  className="
                    dashboard-hero-visual
                    relative
                    h-[210px]
                    w-full
                    max-w-[320px]

                    items-center
                    justify-center

                    flex
                    scale-[0.78]
                    sm:h-[230px]
                    sm:scale-[0.9]
                    lg:h-[250px]
                    lg:scale-100
                  "
                >
                  {/* OUTER RING */}

                  <div
                    className="
                      dashboard-orbit
                      dashboard-orbit--outer
                      absolute

                      h-60
                      w-60

                      rounded-full

                      border
                      border-white/80
                      dark:border-white/[0.08]

                      shadow-[0_0_80px_rgba(90,190,220,0.15)]
                      dark:shadow-[0_0_80px_rgba(34,211,238,0.05)]
                    "
                  />

                  {/* SECOND RING */}

                  <div
                    className="
                      dashboard-orbit
                      dashboard-orbit--middle
                      absolute

                      h-48
                      w-48

                      rounded-full

                      border
                      border-white/70
                      dark:border-white/[0.06]
                    "
                  />

                  {/* THIRD RING */}

                  <div
                    className="
                      dashboard-orbit
                      dashboard-orbit--inner
                      absolute

                      h-36
                      w-36

                      rounded-full

                      border
                      border-white/50
                      dark:border-white/[0.05]
                    "
                  />

                  {/* CENTER */}

                  <div
                    className="
                      dashboard-hero-core
                      relative
                      z-10

                      flex
                      h-32
                      w-32

                      rotate-6
                      items-center
                      justify-center

                      rounded-[34px]

                      border
                      border-white/80
                      dark:border-white/10

                      bg-white/50
                      dark:bg-white/[0.045]

                      shadow-[0_25px_60px_rgba(45,150,190,0.18)]
                      dark:shadow-[0_25px_60px_rgba(0,0,0,0.40)]

                      backdrop-blur-2xl

                      transition-transform
                      duration-500

                      group-hover:rotate-0
                    "
                  >
                    <div
                      className="
                        dashboard-float
                        absolute
                        inset-4

                        rounded-[25px]

                        bg-gradient-to-br
                        from-white/70
                        to-sky-100/40

                        dark:from-cyan-300/[0.07]
                        dark:to-indigo-500/[0.04]
                      "
                    />

                    <Search
                      size={52}
                      strokeWidth={1.4}
                      className="
                        relative
                        z-10

                        text-sky-500
                        dark:text-cyan-300
                      "
                    />
                  </div>

                  {/* SYSTEM CARD */}

                  <div
                    className="
                      dashboard-float
                      dashboard-float--delayed
                      absolute
                      right-0
                      top-0

                      rounded-2xl

                      border
                      border-white/80
                      dark:border-white/10

                      bg-white/55
                      dark:bg-[#101923]/80

                      px-4
                      py-3

                      shadow-[0_15px_35px_rgba(40,130,170,0.14)]
                      dark:shadow-[0_15px_35px_rgba(0,0,0,0.35)]

                      backdrop-blur-xl
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center

                          rounded-xl

                          bg-emerald-50
                          dark:bg-emerald-500/10
                        "
                      >
                        <CheckCircle2
                          size={16}
                          className="
                            text-emerald-500
                          "
                        />
                      </div>

                      <div>
                        <p
                          className="
                            text-[10px]

                            text-slate-400
                            dark:text-slate-500
                          "
                        >
                          System
                        </p>

                        <p
                          className="
                            text-xs
                            font-bold

                            text-slate-700
                            dark:text-slate-200
                          "
                        >
                          Active & Searching
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MATCH CARD */}

                  <div
                    className="
                      absolute
                      bottom-0
                      left-0

                      rounded-2xl

                      border
                      border-white/80
                      dark:border-white/10

                      bg-white/75
                      dark:bg-[#101923]/85

                      px-4
                      py-3

                      shadow-[0_18px_40px_rgba(40,130,170,0.14)]
                      dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]

                      backdrop-blur-xl
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center

                          rounded-xl

                          bg-sky-100
                          dark:bg-sky-500/10
                        "
                      >
                        <Target
                          size={17}
                          className="
                            text-sky-600
                            dark:text-sky-300
                          "
                        />
                      </div>

                      <div>
                        <p
                          className="
                            text-[10px]

                            text-slate-400
                            dark:text-slate-500
                          "
                        >
                          Matching
                        </p>

                        <p
                          className="
                            text-xs
                            font-bold

                            text-slate-700
                            dark:text-slate-200
                          "
                        >
                          Find your item
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================= */}
            {/* STATS */}
            {/* ================================================= */}

            <section
              className="
                relative
                z-10

                grid
                grid-cols-1
                gap-4

                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              <PremiumStat
                href="/my-items"
                title="Lost Items"
                value={myLostItems.length}
                subtitle="Items you've reported lost"
                icon={Search}
                iconStyle="
                  bg-sky-50
                  text-sky-600
                  dark:bg-sky-500/10
                  dark:text-sky-300
                "
                accent="from-sky-300/40"
              />

              <PremiumStat
                href="/my-items"
                title="Found Items"
                value={myFoundItems.length}
                subtitle="Items you've reported found"
                icon={Package}
                iconStyle="
                  bg-cyan-50
                  text-cyan-600
                  dark:bg-cyan-500/10
                  dark:text-cyan-300
                "
                accent="from-cyan-300/40"
              />

              <PremiumStat
                href="/matches"
                title="Matches"
                value={matches.length}
                subtitle="Possible connections found"
                icon={Target}
                iconStyle="
                  bg-indigo-50
                  text-indigo-600
                  dark:bg-indigo-500/10
                  dark:text-indigo-300
                "
                accent="from-indigo-300/40"
              />

              <PremiumStat
                href="/my-items"
                title="Active"
                value={activeLostItems.length}
                subtitle="Currently looking for"
                icon={Zap}
                iconStyle="
                  bg-teal-50
                  text-teal-600
                  dark:bg-teal-500/10
                  dark:text-teal-300
                "
                accent="from-teal-300/40"
              />
            </section>

            <DashboardInsights
              lostItems={myLostItems}
              foundItems={myFoundItems}
              matches={matches}
              matchCount={matches.length}
            />

            {/* ================================================= */}
            {/* QUICK ACTIONS */}
            {/* ================================================= */}

            <section className="relative z-10 mt-8">
              <div className="mb-5">
                <p
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.2em]

                    text-sky-500
                    dark:text-cyan-400
                  "
                >
                  Get started
                </p>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <h2
                    className="
                      text-xl
                      font-extrabold

                      text-slate-800
                      dark:text-white

                      sm:text-2xl
                    "
                  >
                    What would you like to do?
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <PremiumAction
                  href="/lost-item"
                  icon={Search}
                  title="Report a Lost Item"
                  description="Tell the community what you've lost and where you last saw it."
                  label="Report Lost"
                  type="lost"
                />

                <PremiumAction
                  href="/found-item"
                  icon={Package}
                  title="Report a Found Item"
                  description="Help someone get their belongings back by reporting what you found."
                  label="Report Found"
                  type="found"
                />
              </div>
            </section>

            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <div
              className="
                relative
                z-10

                mt-8

                grid
                gap-6

                xl:grid-cols-[1.35fr_0.65fr]
              "
            >
              {/* ================================================= */}
              {/* RECENT ITEMS */}
              {/* ================================================= */}

              <section
                className="
                  dashboard-panel
                  group
                  overflow-hidden

                  rounded-[28px]

                  border
                  border-white/80
                  dark:border-white/[0.08]

                  bg-white/70
                  dark:bg-[#0b1119]/85

                  shadow-[0_18px_55px_rgba(50,150,190,0.08)]
                  dark:shadow-[0_22px_65px_rgba(0,0,0,0.35)]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:shadow-[0_24px_70px_rgba(50,150,190,0.12)]
                  dark:hover:shadow-[0_25px_75px_rgba(0,0,0,0.42)]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between

                    border-b
                    border-sky-100/70
                    dark:border-white/[0.07]

                    px-5
                    py-5

                    sm:px-6
                  "
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center

                          rounded-xl

                          bg-sky-50
                          dark:bg-sky-500/10
                        "
                      >
                        <Layers3
                          size={17}
                          className="
                            text-sky-600
                            dark:text-sky-300
                          "
                        />
                      </div>

                      <h2
                        className="
                          text-lg
                          font-extrabold

                          text-slate-800
                          dark:text-white
                        "
                      >
                        My Recent Items
                      </h2>
                    </div>

                    <p
                      className="
                        mt-1
                        ml-11

                        text-xs

                        text-slate-400
                        dark:text-slate-500
                      "
                    >
                      Your latest reported items
                    </p>
                  </div>

                  <Link
                    href="/my-items"
                    className="
                      flex
                      items-center
                      gap-1

                      text-xs
                      font-bold

                      text-sky-600
                      dark:text-cyan-400

                      transition-all
                      hover:gap-2

                      sm:text-sm
                    "
                  >
                    View all
                    <ChevronRight size={15} />
                  </Link>
                </div>

                <div className="p-5 sm:p-6">
                  {loading ? (
                    <LoadingState text="Loading your items..." />
                  ) : recentItems.length === 0 ? (
                    <EmptyItems />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {recentItems.map((item) => (
                        <ItemPreviewCard
                          key={`${item.itemType}-${item.id}`}
                          item={item}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* ================================================= */}
              {/* MATCHES */}
              {/* ================================================= */}

              <section
                className="
                  dashboard-panel
                  group
                  overflow-hidden

                  rounded-[28px]

                  border
                  border-white/80
                  dark:border-white/[0.08]

                  bg-white/70
                  dark:bg-[#0b1119]/85

                  shadow-[0_18px_55px_rgba(50,150,190,0.08)]
                  dark:shadow-[0_22px_65px_rgba(0,0,0,0.35)]

                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    border-b
                    border-sky-100/70
                    dark:border-white/[0.07]

                    px-5
                    py-5

                    sm:px-6
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2
                        className="
                          text-lg
                          font-extrabold

                          text-slate-800
                          dark:text-white
                        "
                      >
                        Recent Matches
                      </h2>

                      <p
                        className="
                          mt-1
                          text-xs

                          text-slate-400
                          dark:text-slate-500
                        "
                      >
                        Potential item connections
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center

                        rounded-2xl

                        border
                        border-sky-100
                        dark:border-sky-500/10

                        bg-gradient-to-br
                        from-sky-50
                        to-cyan-50

                        dark:from-sky-500/10
                        dark:to-cyan-500/5

                        shadow-sm
                      "
                    >
                      <Target
                        size={19}
                        className="
                          text-sky-600
                          dark:text-cyan-300
                        "
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {loading ? (
                    <LoadingState text="Finding matches..." />
                  ) : matches.length === 0 ? (
                    <EmptyMatches />
                  ) : (
                    <div className="space-y-3">
                      {matches.slice(0, 4).map((match) => (
                        <Link
                          href={`/messages?matchId=${match.id}`}
                          key={match.id}
                          className="
                            group/match
                            block

                            rounded-2xl

                            border
                            border-sky-100/80
                            dark:border-white/[0.07]

                            bg-white/45
                            dark:bg-white/[0.025]

                            p-4

                            transition-all
                            duration-300

                            hover:-translate-y-0.5

                            hover:border-sky-200
                            dark:hover:border-cyan-400/20

                            hover:bg-sky-50/50
                            dark:hover:bg-cyan-400/[0.035]

                            hover:shadow-[0_12px_30px_rgba(50,150,190,0.08)]
                            dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.30)]
                          "
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center

                                rounded-2xl

                                bg-gradient-to-br
                                from-sky-50
                                to-cyan-50

                                dark:from-sky-500/10
                                dark:to-cyan-500/5

                                border
                                border-sky-100
                                dark:border-sky-500/10
                              "
                            >
                              <Target
                                size={17}
                                className="
                                  text-sky-600
                                  dark:text-cyan-300
                                "
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-3
                                "
                              >
                                <div className="min-w-0">
                                  <h3
                                    className="
                                      truncate

                                      text-sm
                                      font-bold

                                      text-slate-700
                                      dark:text-slate-200
                                    "
                                  >
                                    {match.lostItem?.title ||
                                      "Lost Item"}
                                  </h3>

                                  <p
                                    className="
                                      mt-1
                                      truncate

                                      text-xs

                                      text-slate-400
                                      dark:text-slate-500
                                    "
                                  >
                                    Found:{" "}
                                    {match.foundItem?.title ||
                                      "Found Item"}
                                  </p>
                                </div>

                                <div
                                  className="
                                    shrink-0

                                    rounded-lg

                                    bg-sky-50
                                    dark:bg-sky-500/10

                                    px-2
                                    py-1

                                    text-sm
                                    font-black

                                    text-sky-600
                                    dark:text-cyan-300
                                  "
                                >
                                  {Math.round(
                                    match.matchScore || 0
                                  )}
                                  %
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5

                                    rounded-full

                                    bg-emerald-50
                                    dark:bg-emerald-500/10

                                    px-2.5
                                    py-1

                                    text-[10px]
                                    font-bold

                                    text-emerald-600
                                    dark:text-emerald-400
                                  "
                                >
                                  <CheckCircle2 size={11} />

                                  {match.status || "Pending"}
                                </span>

                                <ArrowUpRight
                                  size={15}
                                  className="
                                    text-slate-300
                                    dark:text-slate-600

                                    transition

                                    group-hover/match:text-sky-500
                                    dark:group-hover/match:text-cyan-400

                                    group-hover/match:translate-x-0.5
                                    group-hover/match:-translate-y-0.5
                                  "
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {matches.length > 0 && (
                    <Link
                      href="/matches"
                      className="
                        mt-4

                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2

                        rounded-xl

                        border
                        border-sky-100
                        dark:border-sky-500/10

                        bg-sky-50
                        dark:bg-sky-500/10

                        py-3

                        text-sm
                        font-bold

                        text-sky-700
                        dark:text-cyan-300

                        transition-all

                        hover:bg-sky-100
                        dark:hover:bg-sky-500/15

                        hover:shadow-md
                      "
                    >
                      View all matches
                      <ArrowUpRight size={15} />
                    </Link>
                  )}
                </div>
              </section>
            </div>

            {/* ================================================= */}
            {/* QUICK ACCESS */}
            {/* ================================================= */}

            <section className="relative z-10 mt-8">
              <div className="mb-5">
                <p
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.2em]

                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Quick access
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-extrabold

                    text-slate-800
                    dark:text-white
                  "
                >
                  Your workspace
                </h2>
              </div>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-4

                  md:grid-cols-4
                "
              >
                <QuickAccess
                  href="/my-items"
                  icon={Package}
                  title="My Items"
                  description="Manage items"
                />

                <QuickAccess
                  href="/matches"
                  icon={Target}
                  title="Matches"
                  description="Possible matches"
                />

                <QuickAccess
                  href="/messages"
                  icon={MessageCircle}
                  title="Messages"
                  description="Connect with users"
                />

                <QuickAccess
                  href="/profile"
                  icon={FileSearch}
                  title="Profile"
                  description="Your account"
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function DashboardInsights({ lostItems, foundItems, matches, matchCount }) {
  const [range, setRange] = useState("6m");
  const [visibleSeries, setVisibleSeries] = useState({
    lost: true,
    found: true,
    matches: true,
  });
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(null);
  const activity = buildActivityData(lostItems, foundItems, matches, range);
  const selectedIndex = Math.min(
    selectedPeriodIndex ?? activity.length - 1,
    activity.length - 1
  );
  const selectedPeriod = activity[selectedIndex];
  const totalLost = lostItems.length;
  const totalFound = foundItems.length;
  const totalReports = totalLost + totalFound;
  const maxActivity = Math.max(
    4,
    ...activity.map((period) =>
      Math.max(period.lost, period.found, period.matches)
    )
  );
  const plotBottom = 190;
  const plotTop = 34;
  const pointsFor = (key) =>
    activity.map((month, index) => ({
      x: activity.length === 1 ? 300 : 52 + index * (496 / (activity.length - 1)),
      y: plotBottom - (month[key] / maxActivity) * (plotBottom - plotTop),
      value: month[key],
      label: month.label,
    }));
  const lostPoints = pointsFor("lost");
  const foundPoints = pointsFor("found");
  const matchPoints = pointsFor("matches");
  const toPath = (points) =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
  const lostArea =
    `${toPath(lostPoints)} L ${lostPoints[lostPoints.length - 1].x} ${plotBottom}` +
    ` L ${lostPoints[0].x} ${plotBottom} Z`;
  const circumference = 326.73;
  const lostArc = totalReports ? (totalLost / totalReports) * circumference : 0;
  const foundArc = totalReports ? (totalFound / totalReports) * circumference : 0;
  const hasActivity = activity.some(
    (period) => period.lost > 0 || period.found > 0 || period.matches > 0
  );
  const hasVisibleSeries = Object.values(visibleSeries).some(Boolean);
  const rangeLabels = {
    "30d": "30 days",
    "6m": "6 months",
    "1y": "1 year",
    all: "All time",
  };
  const eventCount = activity.reduce(
    (sum, period) => sum + period.lost + period.found + period.matches,
    0
  );
  const toggleSeries = (series) => {
    setVisibleSeries((current) => ({
      ...current,
      [series]: !current[series],
    }));
  };

  return (
    <section className="dashboard-insights relative z-10 mt-6 grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
      <div className="dashboard-insight-card dashboard-chart-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="dashboard-insight-eyebrow">Activity insights</p>
            <h2 className="dashboard-insight-title">Activity timeline</h2>
            <p className="dashboard-insight-copy">
              Explore item reports and matches by date
            </p>
          </div>
          <div className="dashboard-chart-total">
            <span className="dashboard-chart-total-value">
              {eventCount}
            </span>
            <span className="dashboard-chart-total-label">
              events · {rangeLabels[range]}
            </span>
          </div>
        </div>

        <div className="dashboard-chart-controls">
          <div className="dashboard-range-selector" role="group" aria-label="Activity date range">
            {Object.entries(rangeLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={range === value}
                className={`dashboard-range-button${range === value ? " is-active" : ""}`}
                onClick={() => setRange(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="dashboard-chart-hint">Choose a period · toggle series below</span>
        </div>

        <div className="dashboard-chart-wrap">
          <svg
            className="dashboard-activity-chart"
            viewBox="0 0 600 238"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Lost item reports, found item reports, and matches for ${rangeLabels[range]}`}
          >
            <defs>
              <linearGradient id="lost-area-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#79d9a4" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#79d9a4" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[34, 112, 190].map((y) => (
              <line
                key={y}
                x1="45"
                x2="555"
                y1={y}
                y2={y}
                className="dashboard-chart-gridline"
              />
            ))}
            {visibleSeries.lost && (
              <>
                <path d={lostArea} fill="url(#lost-area-fill)" />
                <path
                  d={toPath(lostPoints)}
                  className="dashboard-chart-line dashboard-chart-line--lost"
                />
              </>
            )}
            {visibleSeries.found && (
              <path
                d={toPath(foundPoints)}
                className="dashboard-chart-line dashboard-chart-line--found"
              />
            )}
            {visibleSeries.matches && (
              <path
                d={toPath(matchPoints)}
                className="dashboard-chart-line dashboard-chart-line--matches"
              />
            )}
            {activity.map((month, index) => (
              <g key={month.key}>
                {visibleSeries.lost && (
                  <circle
                    cx={lostPoints[index].x}
                    cy={lostPoints[index].y}
                    r="4"
                    className={`dashboard-chart-point dashboard-chart-point--lost${index === selectedIndex ? " is-selected" : ""}`}
                  >
                    <title>{`${month.label}: ${month.lost} lost reports`}</title>
                  </circle>
                )}
                {visibleSeries.found && (
                  <circle
                    cx={foundPoints[index].x}
                    cy={foundPoints[index].y}
                    r="4"
                    className={`dashboard-chart-point dashboard-chart-point--found${index === selectedIndex ? " is-selected" : ""}`}
                  >
                    <title>{`${month.label}: ${month.found} found reports`}</title>
                  </circle>
                )}
                {visibleSeries.matches && (
                  <circle
                    cx={matchPoints[index].x}
                    cy={matchPoints[index].y}
                    r="4"
                    className={`dashboard-chart-point dashboard-chart-point--matches${index === selectedIndex ? " is-selected" : ""}`}
                  >
                    <title>{`${month.label}: ${month.matches} matches`}</title>
                  </circle>
                )}
              </g>
            ))}
          </svg>
          <div
            className="dashboard-chart-months"
            style={{
              gridTemplateColumns: `repeat(${activity.length}, minmax(0, 1fr))`,
            }}
          >
            {activity.map((period, index) => (
              <button
                key={period.key}
                type="button"
                aria-label={`Show activity for ${period.label}`}
                aria-pressed={index === selectedIndex}
                className={`dashboard-chart-month-button${index === selectedIndex ? " is-selected" : ""}`}
                onClick={() => setSelectedPeriodIndex(index)}
              >
                {period.label}
              </button>
            ))}
          </div>
          <div className="dashboard-period-breakdown" aria-live="polite">
            <strong>{selectedPeriod.label}</strong>
            <span>Lost <b>{selectedPeriod.lost}</b></span>
            <span>Found <b>{selectedPeriod.found}</b></span>
            <span>Matches <b>{selectedPeriod.matches}</b></span>
          </div>
          {(!hasActivity || !hasVisibleSeries) && (
            <div className="dashboard-chart-empty">
              {hasVisibleSeries
                ? "No activity in this range. Try another date range or report an item."
                : "Turn on a legend item to see its trend."}
            </div>
          )}
        </div>

        <div className="dashboard-chart-legend">
          {[
            ["lost", "Lost reports"],
            ["found", "Found reports"],
            ["matches", "Matches"],
          ].map(([series, label]) => (
            <button
              key={series}
              type="button"
              aria-pressed={visibleSeries[series]}
              className={`dashboard-chart-legend-button${visibleSeries[series] ? " is-active" : ""}`}
              onClick={() => toggleSeries(series)}
            >
              <i className={`dashboard-legend-dot dashboard-legend-dot--${series}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <aside className="dashboard-insight-card dashboard-mix-card">
        <div>
          <p className="dashboard-insight-eyebrow">At a glance</p>
          <h2 className="dashboard-insight-title">Your report mix</h2>
          <p className="dashboard-insight-copy">
            A live breakdown of the items you have shared
          </p>
        </div>

        <div className="dashboard-mix-content">
          <svg
            className="dashboard-mix-chart"
            viewBox="0 0 140 140"
            role="img"
            aria-label={`${totalLost} lost reports and ${totalFound} found reports`}
          >
            <circle
              cx="70"
              cy="70"
              r="52"
              className="dashboard-mix-track"
            />
            <circle
              cx="70"
              cy="70"
              r="52"
              className="dashboard-mix-lost"
              strokeDasharray={`${lostArc} ${circumference - lostArc}`}
            />
            <circle
              cx="70"
              cy="70"
              r="52"
              className="dashboard-mix-found"
              strokeDasharray={`${foundArc} ${circumference - foundArc}`}
              strokeDashoffset={-lostArc}
            />
            <text x="70" y="67" textAnchor="middle" className="dashboard-mix-total">
              {totalReports}
            </text>
            <text x="70" y="85" textAnchor="middle" className="dashboard-mix-caption">
              reports
            </text>
          </svg>

          <div className="dashboard-mix-legend">
            <div>
              <span className="dashboard-mix-label">
                <i className="dashboard-legend-dot dashboard-legend-dot--lost" />
                Lost
              </span>
              <strong>{totalLost}</strong>
            </div>
            <div>
              <span className="dashboard-mix-label">
                <i className="dashboard-legend-dot dashboard-legend-dot--found" />
                Found
              </span>
              <strong>{totalFound}</strong>
            </div>
          </div>
        </div>

        <Link href="/matches" className="dashboard-match-summary">
          <span>
            <span className="dashboard-match-summary-label">Potential matches</span>
            <strong>{matchCount}</strong>
          </span>
          <span className="dashboard-match-summary-link">
            View matches <ArrowUpRight size={15} />
          </span>
        </Link>
      </aside>
    </section>
  );
}

function buildActivityData(lostItems, foundItems, matches, range) {
  const now = new Date();
  const records = [
    ...lostItems.map((item) => ({ ...item, type: "lost" })),
    ...foundItems.map((item) => ({ ...item, type: "found" })),
    ...matches.map((item) => ({ ...item, type: "matches" })),
  ]
    .map((item) => ({ ...item, date: new Date(item.createdAt) }))
    .filter((item) => !Number.isNaN(item.date.getTime()));

  if (range === "30d") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const periods = Array.from({ length: 6 }, (_, index) => {
      const start = new Date(firstDay);
      start.setDate(firstDay.getDate() + index * 5);
      return {
        key: `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`,
        label: start.toLocaleString("en-US", { month: "short", day: "numeric" }),
        lost: 0,
        found: 0,
        matches: 0,
      };
    });

    records.forEach((record) => {
      const elapsedDays = Math.floor(
        (record.date - firstDay) / (24 * 60 * 60 * 1000)
      );
      if (elapsedDays < 0 || elapsedDays >= 30) return;
      const period = periods[Math.floor(elapsedDays / 5)];
      period[record.type] += 1;
    });

    return periods;
  }

  const earliestDate = records.reduce(
    (earliest, record) => (record.date < earliest ? record.date : earliest),
    now
  );
  const monthsSinceFirstRecord =
    (now.getFullYear() - earliestDate.getFullYear()) * 12 +
    now.getMonth() -
    earliestDate.getMonth() +
    1;
  const useYears = range === "all" && monthsSinceFirstRecord > 12;
  let periodCount = Math.max(1, monthsSinceFirstRecord);
  if (range === "6m") {
    periodCount = 6;
  } else if (range === "1y") {
    periodCount = 12;
  } else if (records.length === 0) {
    periodCount = 6;
  } else if (useYears) {
    periodCount = now.getFullYear() - earliestDate.getFullYear() + 1;
  }
  const firstDate = useYears
    ? new Date(now.getFullYear() - periodCount + 1, 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - periodCount + 1, 1);
  const periods = Array.from({ length: periodCount }, (_, index) => {
    const date = useYears
      ? new Date(firstDate.getFullYear() + index, 0, 1)
      : new Date(firstDate.getFullYear(), firstDate.getMonth() + index, 1);
    return {
      key: useYears
        ? String(date.getFullYear())
        : `${date.getFullYear()}-${date.getMonth()}`,
      label: useYears
        ? String(date.getFullYear())
        : date.toLocaleString("en-US", { month: "short" }),
      year: date.getFullYear(),
      month: date.getMonth(),
      lost: 0,
      found: 0,
      matches: 0,
    };
  });
  const periodIndexes = new Map(periods.map((period, index) => [period.key, index]));

  records.forEach((record) => {
    const key = useYears
      ? String(record.date.getFullYear())
      : `${record.date.getFullYear()}-${record.date.getMonth()}`;
    const index = periodIndexes.get(key);
    if (index !== undefined) periods[index][record.type] += 1;
  });

  return periods;
}

/* ============================================================
   PREMIUM STAT
============================================================ */

function PremiumStat({
  href,
  title,
  value,
  subtitle,
  icon: Icon,
  iconStyle,
  accent,
}) {
  return (
    <Link
      href={href}
      className="
        dashboard-stat
        group
        relative
        overflow-hidden

        rounded-[24px]

        border
        border-white/80
        dark:border-white/[0.08]

        bg-white/70
        dark:bg-[#0c141e]/85

        p-5

        shadow-[0_12px_38px_rgba(50,150,190,0.07)]
        dark:shadow-[0_16px_45px_rgba(0,0,0,0.30)]

        backdrop-blur-xl

        transition-all
        duration-300

        hover:-translate-y-1.5

        hover:border-sky-200
        dark:hover:border-sky-400/15

        hover:bg-white/90
        dark:hover:bg-[#101a25]

        hover:shadow-[0_20px_50px_rgba(50,150,190,0.13)]
        dark:hover:shadow-[0_22px_55px_rgba(0,0,0,0.40)]
      "
    >
      {/* GLOW */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-12
          -top-12

          h-32
          w-32

          rounded-full

          bg-gradient-to-br
          ${accent}

          to-transparent

          blur-2xl

          transition-transform
          duration-500

          group-hover:scale-125
        `}
      />

      {/* SHINE */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px

          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent

          dark:via-white/10
        "
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center

              rounded-2xl

              border
              border-white/70
              dark:border-white/[0.06]

              ${iconStyle}

              shadow-sm

              transition-transform
              duration-300

              group-hover:scale-105
              group-hover:rotate-2
            `}
          >
            <Icon size={21} />
          </div>

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center

              rounded-full

              bg-slate-50
              dark:bg-white/[0.035]

              text-slate-300
              dark:text-slate-600

              transition-all

              group-hover:bg-sky-50
              dark:group-hover:bg-sky-500/10

              group-hover:text-sky-500
              dark:group-hover:text-cyan-400
            "
          >
            <ArrowUpRight
              size={16}
              className="
                transition

                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </div>
        </div>

        <p
          className="
            mt-5
            text-sm
            font-semibold

            text-slate-500
            dark:text-slate-400
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-3xl
            font-black
            tracking-tight

            text-slate-800
            dark:text-white
          "
        >
          {value}
        </p>

        <p
          className="
            mt-1
            text-[11px]

            text-slate-400
            dark:text-slate-500
          "
        >
          {subtitle}
        </p>
      </div>
    </Link>
  );
}

/* ============================================================
   PREMIUM ACTION
============================================================ */

function PremiumAction({
  href,
  icon: Icon,
  title,
  description,
  label,
  type,
}) {
  const isLost = type === "lost";

  return (
    <Link
      href={href}
      className="
        dashboard-action
        group
        relative
        overflow-hidden

        rounded-[28px]

        border
        border-white/80
        dark:border-white/[0.08]

        bg-white/70
        dark:bg-[#0c141e]/85

        p-6

        shadow-[0_14px_42px_rgba(50,150,190,0.07)]
        dark:shadow-[0_18px_50px_rgba(0,0,0,0.32)]

        backdrop-blur-xl

        transition-all
        duration-300

        hover:-translate-y-1.5

        hover:border-sky-200
        dark:hover:border-sky-400/15

        hover:bg-white/90
        dark:hover:bg-[#101a25]

        hover:shadow-[0_22px_55px_rgba(50,150,190,0.13)]
        dark:hover:shadow-[0_25px_65px_rgba(0,0,0,0.42)]
      "
    >
      {/* GLOW */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-16
          -top-16

          h-48
          w-48

          rounded-full

          blur-3xl

          ${
            isLost
              ? "bg-sky-300/20 dark:bg-sky-500/[0.06]"
              : "bg-cyan-300/20 dark:bg-cyan-500/[0.06]"
          }

          transition-transform
          duration-500

          group-hover:scale-125
        `}
      />

      {/* TOP SHINE */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-10
          top-0
          h-px

          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent

          dark:via-white/10
        "
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center

              rounded-2xl

              border
              border-white/70
              dark:border-white/[0.06]

              ${
                isLost
                  ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"
                  : "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300"
              }

              shadow-sm

              transition-all
              duration-300

              group-hover:scale-105
              group-hover:rotate-3
            `}
          >
            <Icon size={24} />
          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              bg-slate-50
              dark:bg-white/[0.035]

              text-slate-300
              dark:text-slate-600

              transition-all

              group-hover:bg-sky-50
              dark:group-hover:bg-sky-500/10

              group-hover:text-sky-500
              dark:group-hover:text-cyan-400
            "
          >
            <ArrowUpRight
              size={18}
              className="
                transition

                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </div>
        </div>

        <h3
          className="
            mt-5
            text-lg
            font-extrabold

            text-slate-800
            dark:text-white
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-2
            max-w-md

            text-sm
            leading-6

            text-slate-500
            dark:text-slate-400
          "
        >
          {description}
        </p>

        <div
          className={`
            mt-5
            inline-flex
            items-center
            gap-2

            text-sm
            font-extrabold

            ${
              isLost
                ? "text-sky-600 dark:text-cyan-300"
                : "text-cyan-600 dark:text-cyan-300"
            }
          `}
        >
          {label}

          <ChevronRight
            size={16}
            className="
              transition-transform

              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   ITEM CARD
============================================================ */

function ItemPreviewCard({ item }) {
  const isLost = item.itemType === "Lost";

  return (
    <Link
      href="/my-items"
      className="
        group
        overflow-hidden

        rounded-[20px]

        border
        border-sky-100/80
        dark:border-white/[0.07]

        bg-white/50
        dark:bg-white/[0.025]

        shadow-[0_8px_25px_rgba(50,150,190,0.04)]
        dark:shadow-[0_10px_30px_rgba(0,0,0,0.20)]

        transition-all
        duration-300

        hover:-translate-y-1

        hover:border-sky-200
        dark:hover:border-cyan-400/15

        hover:bg-white/80
        dark:hover:bg-white/[0.045]

        hover:shadow-[0_15px_35px_rgba(50,150,190,0.10)]
        dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.30)]
      "
    >
      {item.image ? (
        <div className="relative h-36 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="
              h-full
              w-full
              object-cover

              transition-transform
              duration-700

              group-hover:scale-110
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-gradient-to-t
              from-black/35
              via-transparent
              to-transparent

              opacity-70
            "
          />

          <div
            className="
              absolute
              left-3
              top-3

              rounded-full

              border
              border-white/20

              bg-slate-800/55

              px-2.5
              py-1

              text-[10px]
              font-bold

              text-white

              backdrop-blur-md
            "
          >
            {item.itemType}
          </div>
        </div>
      ) : (
        <div
          className="
            relative
            flex
            h-36
            items-center
            justify-center

            bg-gradient-to-br
            from-[#e8f8fd]
            to-[#dff4fa]

            dark:from-[#102a39]
            dark:to-[#101d2a]
          "
        >
          <div
            className="
              absolute
              -top-10
              -right-10

              h-28
              w-28

              rounded-full

              bg-white/50
              dark:bg-cyan-400/[0.04]

              blur-3xl
            "
          />

          <div
            className={`
              relative

              flex
              h-16
              w-16

              items-center
              justify-center

              rounded-[20px]

              border
              border-white/70
              dark:border-white/[0.07]

              ${
                isLost
                  ? "bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"
                  : "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300"
              }

              shadow-[0_12px_30px_rgba(50,150,190,0.10)]
              dark:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
            `}
          >
            {isLost ? (
              <Search size={27} />
            ) : (
              <Package size={27} />
            )}
          </div>

          <div
            className="
              absolute
              left-3
              top-3

              rounded-full

              border
              border-white/70
              dark:border-white/10

              bg-white/80
              dark:bg-black/20

              px-2.5
              py-1

              text-[10px]
              font-bold

              text-slate-600
              dark:text-slate-300

              shadow-sm

              backdrop-blur
            "
          >
            {item.itemType}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="
              truncate

              text-sm
              font-extrabold

              text-slate-700
              dark:text-slate-200
            "
          >
            {item.title}
          </h3>

          <span
            className={`
              shrink-0

              rounded-full

              border
              border-transparent
              dark:border-white/[0.05]

              px-2
              py-1

              text-[9px]
              font-black

              ${
                isLost
                  ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"
                  : "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300"
              }
            `}
          >
            {isLost ? "LOST" : "FOUND"}
          </span>
        </div>

        <p
          className="
            mt-2
            text-xs

            text-slate-400
            dark:text-slate-500
          "
        >
          {item.category || "General item"}
        </p>

        {item.location && (
          <div
            className="
              mt-3
              flex
              items-center
              gap-1.5

              text-[11px]

              text-slate-400
              dark:text-slate-500
            "
          >
            <MapPin size={12} />

            <span className="truncate">
              {item.location}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ============================================================
   QUICK ACCESS
============================================================ */

function QuickAccess({
  href,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="
        group

        rounded-[22px]

        border
        border-white/80
        dark:border-white/[0.08]

        bg-white/65
        dark:bg-[#0c141e]/80

        p-4
        sm:p-5

        shadow-[0_10px_30px_rgba(50,150,190,0.06)]
        dark:shadow-[0_12px_35px_rgba(0,0,0,0.25)]

        backdrop-blur-xl

        transition-all
        duration-300

        hover:-translate-y-1.5

        hover:border-sky-200
        dark:hover:border-cyan-400/15

        hover:bg-white/85
        dark:hover:bg-[#101a25]

        hover:shadow-[0_18px_40px_rgba(50,150,190,0.10)]
        dark:hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center

            rounded-2xl

            border
            border-sky-100
            dark:border-white/[0.06]

            bg-sky-50
            dark:bg-sky-500/10

            text-sky-500
            dark:text-cyan-300

            transition-all
            duration-300

            group-hover:scale-105
            group-hover:rotate-3
          "
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-sm
              font-extrabold

              text-slate-700
              dark:text-slate-200
            "
          >
            {title}
          </p>

          <p
            className="
              mt-0.5
              text-[10px]

              text-slate-400
              dark:text-slate-500
            "
          >
            {description}
          </p>
        </div>

        <ChevronRight
          size={15}
          className="
            ml-auto
            shrink-0

            text-slate-300
            dark:text-slate-600

            transition-all

            group-hover:translate-x-1
            group-hover:text-sky-500
            dark:group-hover:text-cyan-400
          "
        />
      </div>
    </Link>
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingState({ text }) {
  return (
    <div className="py-12 text-center">
      <div
        className="
          relative
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center

          rounded-2xl

          bg-sky-50
          dark:bg-sky-500/10
        "
      >
        <div
          className="
            h-8
            w-8

            animate-spin

            rounded-full

            border-2
            border-sky-100
            border-t-sky-500
            border-r-cyan-400

            dark:border-sky-500/10
            dark:border-t-cyan-400
            dark:border-r-sky-400
          "
        />
      </div>

      <p
        className="
          mt-4
          text-sm

          text-slate-400
          dark:text-slate-500
        "
      >
        {text}
      </p>
    </div>
  );
}

/* ============================================================
   EMPTY ITEMS
============================================================ */

function EmptyItems() {
  return (
    <div className="py-10 text-center">
      <div
        className="
          mx-auto

          flex
          h-16
          w-16
          items-center
          justify-center

          rounded-[20px]

          border
          border-sky-100
          dark:border-sky-500/10

          bg-gradient-to-br
          from-sky-50
          to-cyan-50

          dark:from-sky-500/10
          dark:to-cyan-500/5

          shadow-sm
        "
      >
        <Package
          size={27}
          className="
            text-sky-400
            dark:text-cyan-300
          "
        />
      </div>

      <h3
        className="
          mt-4
          font-extrabold

          text-slate-700
          dark:text-slate-200
        "
      >
        No items yet
      </h3>

      <p
        className="
          mt-1
          text-xs

          text-slate-400
          dark:text-slate-500
        "
      >
        Report a lost or found item to get started.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/lost-item"
          className="
            rounded-xl

            bg-gradient-to-r
            from-sky-500
            to-blue-500

            px-4
            py-2.5

            text-xs
            font-bold
            text-white

            shadow-[0_8px_20px_rgba(14,165,233,0.18)]

            transition-all

            hover:-translate-y-0.5
            hover:shadow-lg
          "
        >
          Report Lost
        </Link>

        <Link
          href="/found-item"
          className="
            rounded-xl

            bg-gradient-to-r
            from-cyan-500
            to-teal-500

            px-4
            py-2.5

            text-xs
            font-bold
            text-white

            shadow-[0_8px_20px_rgba(20,184,166,0.18)]

            transition-all

            hover:-translate-y-0.5
            hover:shadow-lg
          "
        >
          Report Found
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY MATCHES
============================================================ */

function EmptyMatches() {
  return (
    <div className="py-10 text-center">
      <div
        className="
          mx-auto

          flex
          h-16
          w-16
          items-center
          justify-center

          rounded-[20px]

          border
          border-sky-100
          dark:border-sky-500/10

          bg-gradient-to-br
          from-sky-50
          to-indigo-50

          dark:from-sky-500/10
          dark:to-indigo-500/5

          shadow-sm
        "
      >
        <Target
          size={27}
          className="
            text-sky-500
            dark:text-cyan-300
          "
        />
      </div>

      <h3
        className="
          mt-4
          font-extrabold

          text-slate-700
          dark:text-slate-200
        "
      >
        No matches yet
      </h3>

      <p
        className="
          mx-auto
          mt-1
          max-w-[240px]

          text-xs
          leading-5

          text-slate-400
          dark:text-slate-500
        "
      >
        Once your lost and found details match,
        possible connections will appear here.
      </p>

      <Link
        href="/matches"
        className="
          mt-4

          inline-flex
          items-center
          gap-1.5

          text-xs
          font-bold

          text-sky-600
          dark:text-cyan-400
        "
      >
        Explore matches
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}