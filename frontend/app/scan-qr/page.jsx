"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageUp, QrCode } from "lucide-react";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";

export default function ScanQrPage() {
  const router = useRouter();
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [returnClaim, setReturnClaim] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setReturnClaim(new URLSearchParams(window.location.search).get("returnClaim") || ""), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch((scanError) => console.error("Stop QR scanner error:", scanError));
      }
    };
  }, []);

  async function getScanner() {
    if (!scannerRef.current) {
      const { Html5Qrcode } = await import("html5-qrcode");
      scannerRef.current = new Html5Qrcode("qr-code-reader");
    }

    return scannerRef.current;
  }

  function openScannedItem(decodedText) {
    try {
      const scannedUrl = new URL(decodedText, window.location.origin);
      const match = scannedUrl.pathname.match(/^\/recover\/([^/]+)\/?$/);
      if (scannedUrl.origin !== window.location.origin || !match) {
        setError("This QR code is not a Lost & Found item code.");
        return;
      }

      const returnClaim = new URL(window.location.href).searchParams.get("returnClaim");
      router.push(`/recover/${encodeURIComponent(match[1])}${returnClaim ? `?returnClaim=${encodeURIComponent(returnClaim)}` : ""}`);
    } catch {
      setError("This QR code does not contain a valid item link.");
    }
  }

  async function startScanner() {
    setError("");
    setIsStarting(true);

    try {
      const scanner = await getScanner();
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        openScannedItem,
        () => {}
      );
      setIsScanning(true);
    } catch (scanError) {
      setError(
        scanError.message ||
          "Camera could not start. Allow camera access or scan a QR image instead."
      );
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } finally {
      setIsStarting(false);
    }
  }

  async function scanImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    try {
      const scanner = await getScanner();
      if (scanner.isScanning) {
        await scanner.stop();
        setIsScanning(false);
      }
      const decodedText = await scanner.scanFile(file, true);
      scanner.clear();
      scannerRef.current = null;
      openScannedItem(decodedText);
    } catch {
      const scanner = scannerRef.current;
      if (scanner?.isScanning) {
        try {
          await scanner.stop();
        } catch (stopError) {
          console.error("Stop camera before clearing QR scanner:", stopError);
        }
      }
      if (scanner && !scanner.isScanning) {
        scanner.clear();
        scannerRef.current = null;
      }
      setError(
        "No readable QR code was found. Upload a clear image with the entire QR code in view, or use the camera."
      );
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setError("");
    } catch (scanError) {
      setError(scanError.message || "Could not stop the camera.");
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:ml-64">
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">
            <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <QrCode size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Scan an item QR</h1>
              <p className="mt-2 text-sm text-slate-600">
                {returnClaim ? "Scan the found item's QR code to verify and complete its handover." : "Select Start Camera, allow camera access, then point it at the item QR to open its details."}
              </p>
              <div
                id="qr-code-reader"
                className={`mx-auto mt-6 w-full max-w-sm overflow-hidden rounded-xl ${isScanning || isStarting ? "" : "hidden"}`}
              />
              {!isScanning && !isStarting && (
                <div className="mx-auto mt-6 flex min-h-48 w-full max-w-sm items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                  <Camera size={20} className="mr-2" />
                  Start the camera or upload a QR image.
                </div>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {isScanning ? (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Stop camera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startScanner}
                    disabled={isStarting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    <Camera size={16} />
                    {isStarting ? "Starting Camera..." : "Start Camera"}
                  </button>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <ImageUp size={16} />
                  Scan QR image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={scanImage}
                  />
                </label>
              </div>
              {error && (
                <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </section>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
