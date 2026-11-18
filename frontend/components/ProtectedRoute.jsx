"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../lib/auth";

function subscribeToAuth(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getAuthSnapshot() {
  return isLoggedIn() ? "authenticated" : "unauthenticated";
}

function getServerAuthSnapshot() {
  return "loading";
}

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const authStatus = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  useEffect(() => {
    function handleAuthExpired() {
      router.replace("/login");
    }

    window.addEventListener("lostFoundAuthExpired", handleAuthExpired);
    return () => {
      window.removeEventListener(
        "lostFoundAuthExpired",
        handleAuthExpired
      );
    };
  }, [router]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/login");
    }
  }, [authStatus, router]);

  if (authStatus !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  return children;
}