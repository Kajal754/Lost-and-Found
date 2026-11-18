"use client";

import Link from "next/link";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Pencil,
  Trash2,
  MapPin,
  CalendarDays,
  Palette,
  Tag,
  QrCode,
  Printer,
  Share2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function ItemCard({
  item,
  type = "lost",
  onDelete,
  onClose,
  onReopen,
}) {
  const isLost = type === "lost";
  const [showQr, setShowQr] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const photos = item.images?.length ? item.images : item.image ? [item.image] : [];

  const itemDate = isLost
    ? item.lostDate
    : item.foundDate;
  const qrUrl =
    item.qrToken && typeof window !== "undefined"
      ? `${window.location.origin}/recover/${item.qrToken}`
      : "";

  function printQrCode() {
    const qrSvg = document.getElementById(`item-qr-${item.qrToken}`);
    const printWindow = window.open("", "_blank", "width=420,height=520");

    if (!printWindow) {
      alert("Allow pop-ups to print the item QR code.");
      return;
    }

    if (!qrSvg) {
      printWindow.close();
      alert("QR code is not ready to print.");
      return;
    }

    const printDocument = printWindow.document;
    printDocument.write(
      "<!doctype html><html><head><title>Item QR Code</title></head><body></body></html>"
    );
    printDocument.close();

    const style = printDocument.createElement("style");
    style.textContent =
      "body{font-family:Arial,sans-serif;text-align:center;padding:32px;color:#0f172a}svg{width:240px;height:240px}h1{font-size:20px}p{font-size:13px}";
    printDocument.head.appendChild(style);

    const title = printDocument.createElement("h1");
    title.textContent = item.title;
    printDocument.body.appendChild(title);
    printDocument.body.appendChild(printDocument.importNode(qrSvg, true));

    const caption = printDocument.createElement("p");
    caption.textContent = "Scan to view item details";
    printDocument.body.appendChild(caption);

    printWindow.focus();
    printWindow.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  function downloadQrCode() {
    const svg = document.getElementById(`item-qr-${item.qrToken}`);
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `item-${item.id}-qr.svg`; anchor.click();
    URL.revokeObjectURL(url);
  }

  async function shareQr() {
    try {
      if (navigator.share) await navigator.share({ title: `${item.title} QR`, text: "Scan to view this Lost & Found item", url: qrUrl });
      else { await navigator.clipboard.writeText(qrUrl); window.alert("QR page link copied."); }
    } catch (error) { if (error.name !== "AbortError") window.alert("Could not share this QR link."); }
  }

  return (
    <div
      className="
        bg-white
        border border-[#dce3ff]
        rounded-2xl
        overflow-hidden

        shadow-[0_10px_30px_rgba(70,85,170,0.09)]
        hover:shadow-[0_16px_38px_rgba(70,85,170,0.15)]

        transition-all
        duration-300

        dark:bg-[#0d2437]
        dark:border-[#294a62]
      "
    >
      {/* ================================================= */}
      {/* IMAGE */}
      {/* ================================================= */}

      {photos.length ? (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={photos[Math.min(imageIndex, photos.length - 1)]}
            alt={item.title}
            className="
              w-full
              h-full
              object-cover

              transition-transform
              duration-500

              hover:scale-[1.03]
            "
          />

          {/* ITEM TYPE */}

          <span
            className={`
              absolute
              top-3
              left-3

              text-[9px]
              px-2.5
              py-1

              rounded-full

              font-bold
              tracking-wide

              backdrop-blur-md

              ${
                isLost
                  ? `
                    bg-red-50/95
                    text-red-700
                    border
                    border-red-100
                  `
                  : `
                    bg-green-50/95
                    text-green-700
                    border
                    border-green-100
                  `
              }
            `}
          >
            {isLost ? "LOST ITEM" : "FOUND ITEM"}
          </span>

          {/* STATUS */}

          <span
            className={`
              absolute
              top-3
              right-3

              text-[9px]
              px-2.5
              py-1

              rounded-full

              font-bold
              uppercase

              backdrop-blur-md

              ${
                isLost
                  ? `
                    bg-red-50/95
                    text-red-700
                    border
                    border-red-100
                  `
                  : `
                    bg-green-50/95
                    text-green-700
                    border
                    border-green-100
                  `
              }
            `}
          >
            {item.status}
          </span>
        </div>
      ) : (
        <div
          className="
            relative
            w-full
            h-48

            bg-gradient-to-br
            from-[#eef1ff]
            via-[#f8f7ff]
            to-[#ffeef2]

            dark:from-[#16364d]
            dark:via-[#172e48]
            dark:to-[#39273c]

            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              w-16
              h-16

              rounded-2xl

              bg-white/80
              dark:bg-[#102b40]/80

              flex
              items-center
              justify-center

              shadow-md
            "
          >
            <Tag
              size={30}
              strokeWidth={1.6}
              className="
                text-[#5a6fd5]
                dark:text-[#9eabff]
              "
            />
          </div>

          {/* ITEM TYPE */}

          <span
            className={`
              absolute
              top-3
              left-3

              text-[9px]
              px-2.5
              py-1

              rounded-full

              font-bold
              tracking-wide

              ${
                isLost
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }
            `}
          >
            {isLost ? "LOST ITEM" : "FOUND ITEM"}
          </span>

          {/* STATUS */}

          <span
            className={`
              absolute
              top-3
              right-3

              text-[9px]
              px-2.5
              py-1

              rounded-full

              font-bold
              uppercase

              ${
                isLost
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }
            `}
          >
            {item.status}
          </span>
        </div>
      )}

      {photos.length > 1 && <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-[#0d2437]">{photos.map((photo, index) => <button key={`${index}-${photo.slice(0, 30)}`} type="button" onClick={() => setImageIndex(index)} aria-label={`Show photo ${index + 1}`} className={`h-10 w-12 shrink-0 overflow-hidden rounded-md border-2 ${imageIndex === index ? "border-emerald-700" : "border-transparent"}`}><img src={photo} alt={`${item.title} photo ${index + 1}`} className="h-full w-full object-cover"/></button>)}</div>}

      {/* ================================================= */}
      {/* CARD CONTENT */}
      {/* ================================================= */}

      <div className="p-4">

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0 flex-1">

            <h3
              className="
                font-bold
                text-[17px]
                leading-tight
                truncate

                text-[#182b5d]

                dark:text-[#f5f7ff]
              "
            >
              {item.title}
            </h3>

            {/* CATEGORY */}

            <div className="flex items-center gap-1.5 mt-1.5">

              <Tag
                size={11}
                strokeWidth={2.2}
                className="
                  text-[#536bd2]
                  dark:text-[#a3afff]
                "
              />

              <p
                className="
                  text-[10px]
                  font-semibold

                  text-[#354b82]

                  dark:text-[#c5d2e8]
                "
              >
                {item.category}
              </p>

            </div>
          </div>

          {/* EDIT ICON */}

          <Link
            href={`/edit-item/${isLost ? "lost" : "found"}/${item.id}`}
            className="
              shrink-0

              w-9
              h-9

              rounded-xl

              bg-[#f0f2ff]
              dark:bg-[#193650]

              border
              border-[#dce2ff]
              dark:border-[#31536c]

              flex
              items-center
              justify-center

              hover:bg-[#e5e9ff]
              dark:hover:bg-[#21425c]

              transition-all
            "
            title="Edit Item"
          >
            <Pencil
              size={14}
              className="
                text-[#5269d2]
                dark:text-[#a3afff]
              "
            />
          </Link>
        </div>

        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        {item.description && (
          <p
            className="
              text-[10px]
              leading-4

              mt-2.5

              line-clamp-2

              text-[#35496f]

              dark:text-[#c8d4e7]
            "
          >
            {item.description}
          </p>
        )}

        {/* ================================================= */}
        {/* DETAILS */}
        {/* ================================================= */}

        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-2
          "
        >

          {/* LOCATION */}

          <div
            className="
              flex
              items-center
              gap-2

              px-2.5
              py-2

              rounded-xl

              bg-[#f7f8ff]
              dark:bg-[#132f45]

              border
              border-[#e5e8fa]
              dark:border-[#294a62]
            "
          >
            <MapPin
              size={13}
              strokeWidth={2.2}
              className="
                shrink-0

                text-[#526bd5]
                dark:text-[#9ba8ff]
              "
            />

            <div className="min-w-0">

              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-wide

                  text-[#66749a]

                  dark:text-[#9ba4b8]
                "
              >
                Location
              </p>

              <p
                className="
                  text-[9px]
                  font-semibold
                  truncate

                  text-[#344767]

                  dark:text-[#c9d5e6]
                "
              >
                {item.location}
              </p>

            </div>
          </div>

          {/* DATE */}

          <div
            className="
              flex
              items-center
              gap-2

              px-2.5
              py-2

              rounded-xl

              bg-[#f7f8ff]
              dark:bg-[#132f45]

              border
              border-[#e5e8fa]
              dark:border-[#294a62]
            "
          >
            <CalendarDays
              size={13}
              strokeWidth={2.2}
              className="
                shrink-0

                text-[#526bd5]
                dark:text-[#9ba8ff]
              "
            />

            <div>

              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-wide

                  text-[#66749a]

                  dark:text-[#9ba4b8]
                "
              >
                Date
              </p>

              <p
                className="
                  text-[9px]
                  font-semibold

                  text-[#344767]

                  dark:text-[#c9d5e6]
                "
              >
                {itemDate
                  ? new Date(
                      itemDate
                    ).toLocaleDateString()
                  : "—"}
              </p>

            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* COLOR + BRAND */}
        {/* ================================================= */}

        {(item.color || item.brand) && (
          <div
            className="
              flex
              flex-wrap
              gap-2

              mt-2.5
            "
          >

            {/* COLOR */}

            {item.color && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5

                  px-2.5
                  py-1.5

                  rounded-lg

                  bg-[#f5f7ff]
                  dark:bg-[#142f45]

                  border
                  border-[#e1e5f7]
                  dark:border-[#2c4e66]

                  text-[9px]
                  font-semibold

                  text-[#354767]

                  dark:text-[#c8d4e7]
                "
              >
                <Palette
                  size={10}
                  strokeWidth={2.2}
                  className="
                    text-[#5d71d5]
                    dark:text-[#9caaff]
                  "
                />

                {item.color}
              </span>
            )}

            {/* BRAND */}

            {item.brand && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5

                  px-2.5
                  py-1.5

                  rounded-lg

                  bg-[#f5f7ff]
                  dark:bg-[#142f45]

                  border
                  border-[#e1e5f7]
                  dark:border-[#2c4e66]

                  text-[9px]
                  font-semibold

                  text-[#354767]

                  dark:text-[#c8d4e7]
                "
              >
                <Tag
                  size={10}
                  strokeWidth={2.2}
                  className="
                    text-[#5d71d5]
                    dark:text-[#9caaff]
                  "
                />

                {item.brand}
              </span>
            )}

          </div>
        )}

        {/* ================================================= */}
        {/* DIVIDER */}
        {/* ================================================= */}

        <div
          className="
            h-px

            bg-[#e9ecf8]
            dark:bg-[#28475d]

            my-3
          "
        />

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="flex gap-2">

          {/* EDIT */}

          <Link
            href={`/edit-item/${isLost ? "lost" : "found"}/${item.id}`}
            className="
              flex-1

              h-9

              rounded-xl

              flex
              items-center
              justify-center
              gap-1.5

              bg-[#eef1ff]
              dark:bg-[#193650]

              border
              border-[#d9dfff]
              dark:border-[#31546c]

              text-[#4059b5]
              dark:text-[#b1bcff]

              text-[9px]
              font-bold

              hover:bg-[#e5e9ff]
              dark:hover:bg-[#21425c]

              hover:border-[#cbd3ff]

              transition-all
            "
          >
            <Pencil size={12} strokeWidth={2.2} />

            Edit Item
          </Link>

          <button
            type="button"
            onClick={() => setShowQr((visible) => !visible)}
            disabled={!qrUrl}
            className="
              flex-1
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              gap-1.5
              bg-emerald-50
              dark:bg-emerald-950/30
              border
              border-emerald-100
              dark:border-emerald-900/50
              text-emerald-700
              dark:text-emerald-300
              text-[9px]
              font-bold
              hover:bg-emerald-100
              dark:hover:bg-emerald-950/50
              disabled:cursor-not-allowed
              disabled:opacity-50
              transition-all
            "
          >
            <QrCode size={13} />
            {showQr ? "Hide QR" : "Show QR"}
          </button>

          {/* DELETE */}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="
                w-10
                h-9

                rounded-xl

                flex
                items-center
                justify-center

                bg-red-50
                dark:bg-red-950/30

                border
                border-red-100
                dark:border-red-900/50

                text-red-500
                dark:text-red-400

                hover:bg-red-100
                dark:hover:bg-red-950/50

                transition-all
              "
              title="Delete Item"
            >
              <Trash2
                size={13}
                strokeWidth={2.2}
              />
            </button>
          )}

        </div>

        {item.expiresAt && ["lost", "found"].includes(item.status) && (
          <p className="mt-2 text-xs text-slate-500">
            Auto-archives on {new Date(item.expiresAt).toLocaleDateString()}
          </p>
        )}

        {(onClose && ["lost", "found"].includes(item.status)) ||
        (onReopen && ["closed", "archived"].includes(item.status)) ? (
          <button
            type="button"
            onClick={
              ["closed", "archived"].includes(item.status) ? onReopen : onClose
            }
            className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {["closed", "archived"].includes(item.status) ? (
              <>
                <RotateCcw size={14} />
                Reopen report
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Close report
              </>
            )}
          </button>
        ) : null}

        {showQr && qrUrl && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-center">
            <QRCodeSVG
              id={`item-qr-${item.qrToken}`}
              value={qrUrl}
              size={192}
              level="M"
              className="mx-auto"
              title={`QR code for ${item.title}`}
            />
            <p className="mt-3 text-xs font-semibold text-slate-700">
              Print this unique QR and attach it to the item.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={downloadQrCode} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><QrCode size={14}/>Download</button>
              <button type="button" onClick={shareQr} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Share2 size={14}/>Share</button>
              <button type="button" onClick={printQrCode} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"><Printer size={14}/>Print QR</button>
            </div>
            <Link
              href="/scan-qr"
              className="mt-3 block text-xs font-semibold text-blue-700 hover:underline"
            >
              Open QR scanner
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
