"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { Download } from "lucide-react";

function subscribeToInstallStatus(onChange) {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);

  return () => {
    displayMode.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

function getInstallStatusSnapshot() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallButton({
  className = "",
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [installed, setInstalled] = useState(false);
  const isStandalone = useSyncExternalStore(
    subscribeToInstallStatus,
    getInstallStatusSnapshot,
    () => false
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert(
        "Your browser does not currently provide the install option. Please use Chrome or Edge and look for the Install App option in the browser menu."
      );
      return;
    }

    deferredPrompt.prompt();

    const { outcome } =
      await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (installed || isStandalone) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={installApp}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 hover:shadow-sky-500/40 ${className}`}
    >
      <Download size={18} />

      Install App
    </button>
  );
}