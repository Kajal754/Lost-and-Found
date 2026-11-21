"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";
import { connectAppSocket } from "../lib/socket";

export default function MessageBox({
  matchId,
  otherUserName = "the matched user",
}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const user = getUser();
  const currentUserId = Number(user?.id);

  async function loadMessages() {
    try {
      const data = await api.getMessages(matchId);
      setMessages(data.messages || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!matchId) return;

    const initialLoad = setTimeout(loadMessages, 0);

    const interval = setInterval(loadMessages, 5000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return undefined;
    const socket = connectAppSocket();
    if (!socket) return undefined;
    const joinConversation = () => {
      socket.emit("conversation:join", { matchId: Number(matchId) });
    };
    const handleNewMessage = (newMessage) => {
      if (Number(newMessage.matchId) !== Number(matchId)) return;
      setMessages((current) =>
        current.some((item) => item.id === newMessage.id)
          ? current
          : [...current, newMessage]
      );
    };

    socket.on("connect", joinConversation);
    socket.on("message:new", handleNewMessage);
    if (socket.connected) joinConversation();

    return () => {
      socket.emit("conversation:leave", { matchId: Number(matchId) });
      socket.off("connect", joinConversation);
      socket.off("message:new", handleNewMessage);
    };
  }, [matchId]);

  async function sendMessage(e) {
    e.preventDefault();

    if (!message.trim()) return;

    setSending(true);
    setError("");

    try {
      await api.sendMessage(matchId, message.trim());

      setMessage("");
      await loadMessages();
    } catch (error) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-colors duration-300 dark:border-white/10 dark:bg-[#102119] dark:shadow-[0_20px_70px_rgba(0,0,0,0.45)]">

        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-100/50 blur-3xl dark:bg-emerald-700/15" />

        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-lime-100/40 blur-3xl dark:bg-lime-700/10" />

        <div className="relative flex min-h-[420px] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-950/30">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />

            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Loading conversation
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Please wait a moment...
            </p>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.09)] transition-all duration-300 hover:shadow-[0_25px_80px_rgba(15,23,42,0.13)] dark:border-white/10 dark:bg-[#102119] dark:shadow-[0_25px_80px_rgba(0,0,0,0.45)] dark:hover:border-emerald-500/20 dark:hover:shadow-[0_25px_90px_rgba(23,92,67,0.18)]">

      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-700/15" />

      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-lime-200/15 blur-3xl dark:bg-lime-700/10" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative border-b border-slate-100 bg-gradient-to-r from-white via-emerald-50/50 to-lime-50/30 px-5 py-5 transition-colors duration-300 dark:border-white/10 dark:from-[#15271e] dark:via-emerald-950/20 dark:to-lime-950/10 sm:px-6">

        <div className="flex items-center justify-between gap-4">

          <div className="flex min-w-0 items-center gap-3">

            {/* Avatar */}

            <div className="relative shrink-0">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-700 text-lg font-extrabold text-white shadow-lg shadow-emerald-200/70 dark:shadow-emerald-950/50">
                {otherUserName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500 shadow-sm dark:border-[#151520]" />

            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h2 className="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {otherUserName}
                </h2>

                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 sm:inline-block">
                  Matched
                </span>

              </div>

              <p className="mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                Secure conversation • Match #{matchId}
              </p>

            </div>
          </div>

          {/* Active Badge */}

          <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-emerald-100 bg-white/80 px-3 py-2 shadow-sm dark:border-emerald-500/15 dark:bg-white/[0.04] sm:flex">

            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Active
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          MESSAGES AREA
      ===================================================== */}

      <div className="relative h-[280px] overflow-y-auto bg-gradient-to-b from-slate-50/80 via-white to-emerald-50/30 p-4 transition-colors duration-300 dark:from-[#0b1813] dark:via-[#102119] dark:to-emerald-950/10 sm:h-[320px] sm:p-6">

        {/* Dotted Pattern */}

        <div className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(#347b58 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
        </div>

        {messages.length === 0 ? (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div className="relative flex h-full items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-emerald-100 to-lime-50 shadow-inner dark:from-emerald-900/30 dark:to-lime-900/10">

                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="text-emerald-700 dark:text-emerald-300"
                >
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-4.7-1.4L3 20l1.4-4.1A8.5 8.5 0 1 1 21 11.5Z"
                  />

                  <path d="M8 11h.01M12 11h.01M16 11h.01" />
                </svg>

              </div>

              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Start the conversation
              </h3>

              <p className="mx-auto mt-1 max-w-[240px] text-xs leading-5 text-slate-400 dark:text-slate-500">
                Send a message to coordinate the return of the matched item.
              </p>

            </div>
          </div>

        ) : (

          <div className="relative space-y-4">

            {messages.map((item) => {

              const mine =
                Number(item.senderId) === currentUserId;

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    mine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`flex max-w-[82%] items-end gap-2 sm:max-w-[72%] ${
                      mine
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >

                    {/* Mini Avatar */}

                    <div
                      className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold sm:flex ${
                        mine
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-lime-100 text-lime-800 dark:bg-lime-500/15 dark:text-lime-300"
                      }`}
                    >
                      {item.sender?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    {/* Message Bubble */}

                    <div
                      className={`relative rounded-[20px] px-4 py-3 shadow-sm ${
                        mine
                          ? "rounded-br-md bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-700 text-white shadow-emerald-200/50 dark:shadow-emerald-950/40"
                          : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-slate-200/60 dark:border-white/10 dark:bg-[#1a1a25] dark:text-slate-200 dark:shadow-black/30"
                      }`}
                    >

                      <p className="break-words text-sm leading-5">
                        {item.message}
                      </p>

                      <div
                        className={`mt-1.5 flex items-center gap-1.5 ${
                          mine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <p
                          className={`text-[9px] font-semibold ${
                            mine
                              ? "text-white/70"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {item.sender?.name}
                        </p>

                        {mine && (
                          <span className="text-[10px] text-white/70">
                            ✓
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="relative border-t border-red-100 bg-red-50/70 px-5 py-3 dark:border-red-500/10 dark:bg-red-950/20">

          <div className="flex items-center gap-2">

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              !
            </div>

            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>

          </div>
        </div>
      )}

      {/* =====================================================
          INPUT AREA
      ===================================================== */}

      <form
        onSubmit={sendMessage}
        className="relative border-t border-slate-100 bg-white p-4 transition-colors duration-300 dark:border-white/10 dark:bg-[#11111a] sm:p-5"
      >

        <div className="flex items-center gap-2 rounded-[20px] border border-slate-200 bg-slate-50/80 p-1.5 shadow-inner transition-all duration-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-[0_8px_30px_rgba(23,92,67,0.08)] dark:border-white/10 dark:bg-[#102119] dark:focus-within:border-emerald-500/40 dark:focus-within:bg-[#1b3428] dark:focus-within:shadow-[0_8px_35px_rgba(23,92,67,0.12)]">

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={sending}
            className="group/send flex h-11 shrink-0 items-center justify-center gap-2 rounded-[15px] bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-200/70 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:shadow-emerald-950/40 dark:hover:shadow-emerald-900/50"
          >

            {sending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                <span className="hidden sm:inline">
                  Sending
                </span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  Send
                </span>

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform duration-200 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5"
                >
                  <path d="M22 2 11 13" />
                  <path d="m22 2-7 20-4-9-9-4Z" />
                </svg>
              </>
            )}

          </button>

        </div>

        <div className="mt-2 flex items-center justify-between px-1">

          <p className="text-[9px] font-medium text-slate-400 dark:text-slate-600">
            Messages are connected to this match.
          </p>

          <span className="hidden text-[9px] font-bold uppercase tracking-wider text-slate-300 dark:text-slate-700 sm:block">
            Lost & Found
          </span>

        </div>

      </form>

    </div>
  );
}
