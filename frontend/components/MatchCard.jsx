"use client";

import { useState } from "react";
import Link from "next/link";
import { getUser } from "../lib/auth";
import { api } from "../lib/api";
import {
  MapPin,
  User,
  MessageCircle,
  ArrowRight,
  Sparkles,
  PackageSearch,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function MatchCard({ match, onDeleted }) {
  const score = Math.round(match.matchScore);
  const [deleting, setDeleting] = useState(false);

  const currentUser = getUser();
  const currentUserId = Number(currentUser?.id);
  const canDeleteLostItem =
    currentUserId === Number(match.lostItem?.userId);
  const canDeleteFoundItem =
    currentUserId === Number(match.foundItem?.userId);

  const otherPerson =
    (currentUserId === match.lostItem?.userId
      ? match.foundItem?.user?.name
      : match.lostItem?.user?.name) || "Matched User";

  async function deleteOwnItem(type, itemId) {
    const itemType = type === "lost" ? "lost" : "found";

    if (
      !window.confirm(
        `Delete your ${itemType} item? Its related matches will also be removed.`
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      if (itemType === "lost") {
        await api.deleteLostItem(itemId);
      } else {
        await api.deleteFoundItem(itemId);
      }

      onDeleted(match.id);
    } catch (error) {
      window.alert(error.message || `Failed to delete your ${itemType} item.`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="
        group
        relative
        w-full
        overflow-hidden

        rounded-[20px]

        bg-white/90
        dark:bg-[#0d2538]/95

        border
        border-emerald-100
        dark:border-[#294b63]

        shadow-[0_12px_35px_rgba(23,92,67,0.10)]
        dark:shadow-[0_14px_40px_rgba(0,0,0,0.30)]

        p-4

        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_18px_42px_rgba(23,92,67,0.16)]
        dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.42)]
      "
    >
      {/* ================================================= */}
      {/* SOFT GLOW */}
      {/* ================================================= */}

      <div
        className="
          absolute
          -top-12
          -right-12

          w-28
          h-28

          rounded-full

          bg-emerald-300/10
          dark:bg-emerald-500/8

          blur-3xl

          pointer-events-none
        "
      />

      <div
        className="
          absolute
          -bottom-12
          -left-12

          w-24
          h-24

          rounded-full

          bg-[#ff9dac]/8
          dark:bg-[#ff9dac]/5

          blur-3xl

          pointer-events-none
        "
      />

      {/* ================================================= */}
      {/* TOP */}
      {/* ================================================= */}

      <div className="relative flex items-center justify-between gap-3 mb-4">
        {/* LEFT */}

        <div className="flex items-center gap-3 min-w-0">
          <div
            className="
              w-10
              h-10
              shrink-0

              rounded-[12px]

              bg-gradient-to-br
              from-emerald-50
              to-green-100

              dark:from-[#193b55]
              dark:to-[#26365b]

              flex
              items-center
              justify-center

              shadow-[0_5px_14px_rgba(92,108,220,0.12)]
            "
          >
            <Sparkles
              size={18}
              className="
                text-emerald-700
                dark:text-emerald-300
              "
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[10px]
                leading-tight
                font-semibold
                tracking-wide

                text-slate-400
                dark:text-[#7892a8]
              "
            >
              MATCH #{match.id}
            </p>

            <h3
              className="
                text-[15px]
                leading-tight
                font-bold
                truncate
                mt-0.5

                text-[#293c76]
                dark:text-[#edf3ff]
              "
            >
              Possible Match
            </h3>
          </div>
        </div>

        {/* SCORE */}

        <div
          className="
            shrink-0

            flex
            items-center
            gap-2.5

            px-3
            py-2

            rounded-xl

            bg-emerald-50
            dark:bg-[#172f47]

            border
            border-emerald-100
            dark:border-[#2c4d65]
          "
        >
          <div className="text-right">
            <p
              className="
                text-[18px]
                leading-none
                font-extrabold

                text-emerald-700
                dark:text-emerald-300
              "
            >
              {score}%
            </p>

            <p
              className="
                text-[8px]
                mt-1
                font-semibold
                tracking-wide

                text-slate-400
                dark:text-[#7892a8]
              "
            >
              MATCH
            </p>
            {match.imageScore != null && <p className="mt-1 text-[8px] font-semibold text-emerald-700 dark:text-emerald-300">Photo similarity {Math.round(match.imageScore)}%</p>}
          </div>

          <CheckCircle2
            size={16}
            className="
              text-emerald-700
              dark:text-emerald-300
            "
          />
        </div>
      </div>

      {/* ================================================= */}
      {/* ITEMS */}
      {/* ================================================= */}

      <div className="relative grid grid-cols-2 gap-3">
        {/* LOST */}

        <div
          className="
            relative
            overflow-hidden

            rounded-[14px]

            p-3

            bg-gradient-to-br
            from-[#fff5f6]
            to-[#fffafb]

            dark:from-[#351f2b]
            dark:to-[#2a202b]

            border
            border-[#ffe0e5]
            dark:border-[#523340]
          "
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-2">
              <div
                className="
                  w-7
                  h-7

                  rounded-lg

                  bg-[#ffe5e9]
                  dark:bg-[#512b38]

                  flex
                  items-center
                  justify-center
                "
              >
                <PackageSearch
                  size={14}
                  className="
                    text-[#e87589]
                    dark:text-[#ff9bab]
                  "
                />
              </div>

              <span
                className="
                  text-[9px]
                  font-bold
                  tracking-wide

                  text-[#d95d73]
                  dark:text-[#ff9bab]
                "
              >
                LOST
              </span>
            </div>
            {canDeleteLostItem && (
              <button
                type="button"
                onClick={() => deleteOwnItem("lost", match.lostItem.id)}
                disabled={deleting}
                aria-label="Delete your lost item"
                title="Delete your lost item"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-white/80 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-black/10 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <h4
            className="
              text-[13px]
              leading-tight
              font-bold
              truncate

              text-[#3b4263]
              dark:text-[#f1e9ed]
            "
          >
            {match.lostItem?.title || "Lost Item"}
          </h4>

          <p
            className="
              text-[10px]
              mt-1
              truncate

              text-slate-500
              dark:text-[#a58d98]
            "
          >
            {match.lostItem?.category || "Item"}
          </p>

          <div className="flex items-center gap-1.5 mt-2.5">
            <MapPin
              size={11}
              className="
                shrink-0
                text-[#df7184]
                dark:text-[#ff9aaa]
              "
            />

            <p
              className="
                text-[9px]
                truncate

                text-slate-500
                dark:text-[#a98f9b]
              "
            >
              {match.lostItem?.location || "Location unavailable"}
            </p>
          </div>
        </div>

        {/* FOUND */}

        <div
          className="
            relative
            overflow-hidden

            rounded-[14px]

            p-3

            bg-gradient-to-br
            from-[#f1fff8]
            to-[#fbfffd]

            dark:from-[#18382f]
            dark:to-[#192f2c]

            border
            border-[#d9f3e5]
            dark:border-[#2c5548]
          "
        >
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-2">
              <div
                className="
                  w-7
                  h-7

                  rounded-lg

                  bg-[#dcf7e8]
                  dark:bg-[#214b3e]

                  flex
                  items-center
                  justify-center
                "
              >
                <CheckCircle2
                  size={14}
                  className="
                    text-[#45ad78]
                    dark:text-[#73d49e]
                  "
                />
              </div>

              <span
                className="
                  text-[9px]
                  font-bold
                  tracking-wide

                  text-[#3a9a69]
                  dark:text-[#73d49e]
                "
              >
                FOUND
              </span>
            </div>
            {canDeleteFoundItem && (
              <button
                type="button"
                onClick={() => deleteOwnItem("found", match.foundItem.id)}
                disabled={deleting}
                aria-label="Delete your found item"
                title="Delete your found item"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-white/80 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-black/10 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <h4
            className="
              text-[13px]
              leading-tight
              font-bold
              truncate

              text-[#354c46]
              dark:text-[#e8f6ef]
            "
          >
            {match.foundItem?.title || "Found Item"}
          </h4>

          <p
            className="
              text-[10px]
              mt-1
              truncate

              text-slate-500
              dark:text-[#91aaa0]
            "
          >
            {match.foundItem?.category || "Item"}
          </p>

          <div className="flex items-center gap-1.5 mt-2.5">
            <MapPin
              size={11}
              className="
                shrink-0
                text-[#49a978]
                dark:text-[#75d49f]
              "
            />

            <p
              className="
                text-[9px]
                truncate

                text-slate-500
                dark:text-[#91aaa0]
              "
            >
              {match.foundItem?.location || "Location unavailable"}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MATCHED USER */}
      {/* ================================================= */}

      <div
        className="
          relative

          flex
          items-center
          justify-between
          gap-3

          mt-3
          px-3
          py-2.5

          rounded-xl

          bg-emerald-50/70
          dark:bg-[#122d42]

          border
          border-emerald-100
          dark:border-[#294960]
        "
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="
              w-7
              h-7
              shrink-0

              rounded-full

              bg-gradient-to-br
              from-emerald-800
              to-green-700

              flex
              items-center
              justify-center
            "
          >
            <User
              size={13}
              className="text-white"
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[9px]
                leading-tight
                text-slate-400
                dark:text-[#7892a8]
              "
            >
              MATCHED WITH
            </p>

            <p
              className="
                text-[11px]
                leading-tight
                font-semibold
                truncate
                mt-0.5

                text-[#354778]
                dark:text-[#e8efff]
              "
            >
              {otherPerson}
            </p>
          </div>
        </div>

        <Link
          href={`/messages?matchId=${match.id}&user=${encodeURIComponent(
            otherPerson
          )}`}
          className="
            shrink-0

            flex
            items-center
            gap-1.5

            px-3
            py-2

            rounded-lg

            bg-gradient-to-r
            from-emerald-800
            to-green-700

            text-white
            text-[10px]
            font-bold

            shadow-[0_5px_12px_rgba(23,92,67,0.22)]

            hover:shadow-[0_7px_16px_rgba(23,92,67,0.32)]

            transition-all
          "
        >
          <MessageCircle size={12} />
          Chat
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
