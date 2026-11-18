"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import MessageBox from "../../components/MessageBox";
import { api } from "../../lib/api";
import { getUser } from "../../lib/auth";

function MessagesContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const matchId =
    searchParams.get("matchId");
  const otherUserName =
    searchParams.get("user") || "the matched user";
  const currentUserId = Number(getUser()?.id);

  useEffect(() => {
    if (matchId) {
      return;
    }

    async function loadConversations() {
      try {
        const data = await api.getConversations();
        setConversations(data.conversations || []);
      } catch (error) {
        if (error.status !== 401) {
          console.error(error);
        }
      } finally {
        setLoadingConversations(false);
      }
    }

    loadConversations();
    const interval = setInterval(loadConversations, 5000);

    return () => clearInterval(interval);
  }, [matchId]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="lg:ml-64">
          <Navbar />

          <main className="p-4 sm:p-6 lg:p-8 max-w-4xl">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Messages 💬
              </h1>

              <p className="text-slate-500 mt-2">
                Connect with the other person about your matched item.
              </p>
            </div>

            {!matchId ? (
              <div className="space-y-3">
                {loadingConversations ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <h2 className="font-bold">No messages yet</h2>
                    <p className="text-sm text-slate-500 mt-2">
                      Start a conversation from the Matches page.
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherUser =
                      Number(conversation.senderId) === currentUserId
                        ? conversation.receiver
                        : conversation.sender;

                    return (
                      <a
                        key={conversation.matchId}
                        href={`/messages?matchId=${conversation.matchId}&user=${encodeURIComponent(otherUser?.name || "the matched user")}`}
                        className="block bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className="font-bold truncate">
                              {otherUser?.name || "Matched user"}
                            </h2>
                            <p className="text-sm text-slate-500 truncate mt-1">
                              {conversation.message}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-blue-600">
                            Reply
                          </span>
                        </div>
                      </a>
                    );
                  })
                )}
              </div>
            ) : (
              <MessageBox
                matchId={matchId}
                otherUserName={otherUserName}
              />
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 text-center">
          Loading messages...
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}