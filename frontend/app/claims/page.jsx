"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { api } from "../../lib/api";
import { getUser } from "../../lib/auth";

const statusStyle = {
  pending: "bg-amber-50 text-amber-700",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  returned: "bg-sky-50 text-sky-700",
};

function ClaimsContent() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = Number(getUser()?.id);
  const claimId = Number(searchParams.get("claimId"));

  async function refresh() {
    try {
      const result = await api.getMyRecoveryClaims();
      setClaims(result.claims || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || !claimId) return;
    document.getElementById(`claim-${claimId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [claimId, loading, claims]);

  async function review(claim, decision) {
    const note = window.prompt(
      decision === "verified"
        ? "Confirm a detail you used to verify ownership:"
        : "Why are you declining this claim?"
    );
    if (!note) return;
    try {
      await api.reviewRecoveryClaim(claim.id, decision, note);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function markReturned(claim) {
    router.push(`/scan-qr?returnClaim=${claim.id}`);
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:ml-64">
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
              <h1 className="text-2xl font-bold sm:text-3xl">My Claims</h1>
              <p className="mt-2 text-sm text-slate-500">
                Track ownership requests and manage claims for items you found.
              </p>
            </header>
            {error && (
              <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((number) => (
                  <div key={number} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : claims.length === 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <h2 className="font-bold">No claims yet</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Claims you submit or receive will appear here.
                </p>
              </section>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {claims.map((claim) => {
                  const isFinder = claim.foundItem?.userId === userId;
                  return (
                    <article
                      id={`claim-${claim.id}`}
                      key={claim.id}
                      className={`rounded-2xl border bg-white p-5 shadow-sm ${
                        claim.id === claimId
                          ? "border-emerald-400 ring-2 ring-emerald-100"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-bold">{claim.foundItem?.title || "Found item"}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle[claim.status] || "bg-slate-100 text-slate-700"}`}>
                          {claim.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {isFinder ? `Claim from ${claim.claimant?.name || "user"}` : "Your ownership claim"}
                        {" · Lost report: "}
                        {claim.lostItem?.title || "Item"}
                      </p>
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-500">Ownership details</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{claim.proof}</p>
                      </div>
                      {claim.events?.length > 0 && (
                        <ol className="mt-3 space-y-1">
                          {claim.events.map((event) => (
                            <li key={event.id} className="text-xs text-slate-500">
                              {event.action.replaceAll("_", " ")} · {new Date(event.createdAt).toLocaleString()}
                            </li>
                          ))}
                        </ol>
                      )}
                      {isFinder && claim.status === "pending" && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => review(claim, "verified")}
                            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                          >
                            Approve claim
                          </button>
                          <button
                            onClick={() => review(claim, "rejected")}
                            className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {isFinder && claim.status === "verified" && (
                        <button
                          onClick={() => markReturned(claim)}
                          className="mt-4 rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white"
                        >
                          Confirm handover · mark returned
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center">Loading claims...</div>}>
      <ClaimsContent />
    </Suspense>
  );
}
