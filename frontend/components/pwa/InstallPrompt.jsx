"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Smartphone,
  X,
  CheckCircle2,
} from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Android / Chrome / Edge install event
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      setDeferredPrompt(event);
      setShowPrompt(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // App successfully installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 z-[9999] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#171126]/95 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">

        {/* Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-pink-500/20 blur-3xl" />

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          aria-label="Close install prompt"
        >
          <X size={17} />
        </button>

        <div className="relative flex items-start gap-4">
          
          {/* App Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <Smartphone
              size={27}
              className="text-white"
            />
          </div>

          <div className="pr-5">
            <h3 className="text-lg font-bold text-white">
              Install Lost & Found
            </h3>

            <p className="mt-1 text-sm leading-5 text-white/65">
              Install the app for faster access to your
              Lost & Found account.
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleInstall}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:-translate-y-0.5 hover:shadow-purple-500/40"
          >
            <Download size={18} />
            Install App
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Later
          </button>
        </div>

        <div className="relative mt-3 flex items-center gap-2 text-xs text-white/45">
          <CheckCircle2 size={14} />
          Free to install • Quick access • Secure
        </div>
      </div>
    </div>
  );
}