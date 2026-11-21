import { io } from "socket.io-client";
import { getToken } from "./auth";

let socket;

function getSocketUrl() {
  const isLocalBrowser = typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const candidates = [process.env.NEXT_PUBLIC_SOCKET_URL];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    candidates.push(apiUrl.replace(/\/api\/?$/, ""));
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    const candidateUrl = candidate.replace(/\/$/, "");
    let isLoopback = false;
    try {
      isLoopback = ["localhost", "127.0.0.1", "::1"].includes(new URL(candidateUrl).hostname);
    } catch {
      continue;
    }
    if (!isLoopback || isLocalBrowser) return candidateUrl;
  }

  if (isLocalBrowser || typeof window === "undefined") return "http://localhost:5000";
  return null;
}

export function connectAppSocket() {
  const socketUrl = getSocketUrl();
  if (!socketUrl) return null;

  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      auth: { token: getToken() },
      transports: ["websocket", "polling"],
      tryAllTransports: true,
    });
  }
  socket.auth = { token: getToken() };
  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectAppSocket() {
  if (socket?.connected) socket.disconnect();
  socket = null;
}
