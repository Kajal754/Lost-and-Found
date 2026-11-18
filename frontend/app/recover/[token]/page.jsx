"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { isLoggedIn } from "../../../lib/auth";

function RecoveryHistory({ claims, onReview, onReturn, canReview, busyId, returnClaimId, token }) {
  const [notes, setNotes] = useState({});

  if (!claims.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-slate-900">Recovery verification history</h2>
      <div className="mt-4 space-y-4">
        {claims.map((claim) => (
          <article key={claim.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Claim for {claim.lostItem.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Submitted by {claim.claimant.name} on{" "}
                  {new Date(claim.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                {claim.status}
              </span>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Ownership details provided
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{claim.proof}</p>
            </div>

            {canReview && claim.status === "pending" && (
              <div className="mt-4">
                <label htmlFor={`review-${claim.id}`} className="text-sm font-semibold text-slate-700">
                  Verification note (describe the ownership evidence checked)
                </label>
                <textarea
                  id={`review-${claim.id}`}
                  value={notes[claim.id] || ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [claim.id]: event.target.value }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
                  placeholder="For example, the claimant correctly described a private identifying detail."
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === claim.id}
                    onClick={() => onReview(claim.id, "verified", notes[claim.id] || "")}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Verify ownership
                  </button>
                  <button
                    type="button"
                    disabled={busyId === claim.id}
                    onClick={() => onReview(claim.id, "rejected", notes[claim.id] || "")}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject claim
                  </button>
                </div>
              </div>
            )}

            {canReview && claim.status === "verified" && (returnClaimId === String(claim.id) ? <button
                type="button"
                disabled={busyId === claim.id}
                onClick={() => onReturn(claim.id, notes[claim.id] || "", token)}
                className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                Record item handover
              </button> : <Link href={`/scan-qr?returnClaim=${claim.id}`} className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Scan item QR to confirm handover</Link>)}

            <ol className="mt-5 space-y-3 border-l-2 border-slate-200 pl-4">
              {claim.events.map((event) => (
                <li key={event.id} className="text-sm">
                  <p className="font-semibold capitalize text-slate-800">
                    {event.action.replaceAll("_", " ")} · {event.actor.name}
                  </p>
                  {event.note && <p className="mt-0.5 text-slate-500">{event.note}</p>}
                  <time className="mt-0.5 block text-xs text-slate-400">
                    {new Date(event.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function RecoveryPage() {
  const { token } = useParams();
  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState("");
  const [lostItems, setLostItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [lostItemId, setLostItemId] = useState("");
  const [proof, setProof] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [returnClaimId, setReturnClaimId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setReturnClaimId(new URLSearchParams(window.location.search).get("returnClaim") || ""), 0);
    return () => clearTimeout(timer);
  }, [token]);
  async function loadClaims(foundItemId) {
    if (!isLoggedIn()) return;
    try {
      const result = await api.getRecoveryClaims(foundItemId);
      setClaims(result.claims || []);
      setCanReview(Boolean(result.isReporter));
    } catch (claimError) {
      if (claimError.status !== 403 && claimError.status !== 401) {
        setError(claimError.message);
      }
    }
  }

  useEffect(() => {
    if (!token) return;
    let active = true;

    async function loadItem() {
      try {
        const result = await api.getQrItem(token);
        if (!active) return;
        setItem(result.item);
        setItemType(result.type);

        if (result.type === "found" && isLoggedIn()) {
          const lostResult = await api.getClaimableLostItems();
          if (active) setLostItems(lostResult.items || []);
          await loadClaims(result.item.id);
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItem();
    return () => {
      active = false;
    };
  }, [token]);

  async function submitClaim(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await api.createRecoveryClaim(item.id, Number(lostItemId), proof);
      setProof("");
      setNotice("Claim submitted. The person who reported this item will review the ownership details.");
      await loadClaims(item.id);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function reviewClaim(claimId, decision, note) {
    setError("");
    setNotice("");
    setBusyId(claimId);
    try {
      const result = await api.reviewRecoveryClaim(claimId, decision, note);
      setNotice(result.message);
      if (decision === "verified") setItem((current) => ({ ...current, status: "claimed" }));
      await loadClaims(item.id);
    } catch (reviewError) {
      setError(reviewError.message);
    } finally {
      setBusyId(null);
    }
  }

  async function returnItem(claimId, note, qrToken) {
    setError("");
    setNotice("");
    setBusyId(claimId);
    try {
      const result = await api.markRecoveryReturned(claimId, note, qrToken);
      setNotice(result.message);
      setItem((current) => ({ ...current, status: "returned" }));
      await loadClaims(item.id);
    } catch (returnError) {
      setError(returnError.message);
    } finally {
      setBusyId(null);
    }
  }

  const hasActiveClaim = claims.some((claim) =>
    ["pending", "verified", "returned"].includes(claim.status)
  );

  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-10 sm:px-6">
      {loading ? (
        <p className="py-16 text-center text-slate-500">Loading item details...</p>
      ) : error && !item ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          {error}
        </div>
      ) : item ? (
        <>
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              {itemType === "found" ? "Found item" : "Lost item"}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{item.title}</h1>
            <p className="mt-2 text-slate-600">
              {item.category} · {item.location} ·{" "}
              {itemType === "found" ? "Found" : "Lost"}{" "}
              {new Date(item.foundDate || item.lostDate).toLocaleDateString()}
            </p>
          </div>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {item.image && (
              <img src={item.image} alt={item.title} className="max-h-96 w-full object-cover" />
            )}
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  {item.status}
                </span>
                {item.color && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Color: {item.color}</span>}
                {item.brand && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Brand: {item.brand}</span>}
              </div>
              {item.description && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {item.description}
                </p>
              )}
            </div>
          </article>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              {notice}
            </p>
          )}

          {itemType === "found" && item.status === "found" && !canReview && (
            <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
              <h2 className="text-xl font-bold text-slate-900">Claim Item</h2>
              <p className="mt-2 text-sm text-slate-600">
                Choose your lost-item report and share a private identifying detail. The person who found the item will verify it before returning it.
              </p>
              {!isLoggedIn() ? (
                <p className="mt-2 text-sm text-slate-700">
                  <Link href="/login" className="font-semibold text-blue-700 underline">Sign in</Link>{" "}
                  and report your lost item to submit an ownership claim.
                </p>
              ) : hasActiveClaim ? (
                <p className="mt-2 text-sm text-slate-700">
                  Your claim is being reviewed. The item reporter will verify your ownership details before arranging a return.
                </p>
              ) : lostItems.length === 0 ? (
                <p className="mt-2 text-sm text-slate-700">
                  You need an active lost-item report before claiming this item.{" "}
                  <Link href="/lost-item" className="font-semibold text-blue-700 underline">Report a lost item</Link>.
                </p>
              ) : (
                <form onSubmit={submitClaim} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="lost-item" className="text-sm font-semibold text-slate-700">
                      Your lost-item report
                    </label>
                    <select
                      id="lost-item"
                      value={lostItemId}
                      onChange={(event) => setLostItemId(event.target.value)}
                      required
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                    >
                      <option value="">Select an item</option>
                      {lostItems.map((lostItem) => (
                        <option key={lostItem.id} value={lostItem.id}>
                          {lostItem.title} · {lostItem.category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ownership-proof" className="text-sm font-semibold text-slate-700">
                      Describe private details that prove it belongs to you
                    </label>
                    <textarea
                      id="ownership-proof"
                      value={proof}
                      onChange={(event) => setProof(event.target.value)}
                      minLength={10}
                      maxLength={2000}
                      required
                      rows={4}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                      placeholder="Include identifying details that are not shown in the public item description."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {submitting ? "Sending request..." : "Claim Item"}
                  </button>
                </form>
              )}
            </section>
          )}

          {itemType === "lost" && (
            <p className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
              This QR belongs to a lost-item report. Visit{" "}
              <Link href="/found-item" className="font-semibold text-blue-700 underline">Report Found</Link>{" "}
              if you have found this item.
            </p>
          )}

          <RecoveryHistory
            claims={claims}
            canReview={canReview}
            busyId={busyId}
            returnClaimId={returnClaimId}
            token={token}
            onReturn={returnItem}
            onReview={reviewClaim}
          />
        </>
      ) : null}
    </main>
  );
}
