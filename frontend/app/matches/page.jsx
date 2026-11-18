"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import MatchCard from "../../components/MatchCard";
import { api } from "../../lib/api";

function MatchesContent() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const matchId = Number(searchParams.get("matchId"));

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await api.getMatches();
        setMatches(data.matches || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  useEffect(() => {
    if (loading || !matchId) return;
    document.getElementById(`match-${matchId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [loading, matchId, matches]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="lg:ml-64">
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold sm:text-3xl">Matches 🎯</h1>
              <p className="mt-2 text-slate-500">
                Potential matches for your lost and found items.
              </p>
            </div>
            {loading ? (
              <div className="py-16 text-center">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <div className="mb-4 text-5xl">🎯</div>
                <h2 className="text-lg font-bold">No matches found</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Keep reporting lost and found items.
                </p>
              </div>
            ) : (
              <div className="max-w-4xl space-y-5">
                {matches.map((match) => (
                  <div
                    id={`match-${match.id}`}
                    key={match.id}
                    className={match.id === matchId ? "rounded-2xl ring-2 ring-emerald-300" : ""}
                  >
                    <MatchCard
                      match={match}
                      onDeleted={(deletedMatchId) =>
                        setMatches((current) =>
                          current.filter((entry) => entry.id !== deletedMatchId)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center">Loading matches...</div>}>
      <MatchesContent />
    </Suspense>
  );
}
