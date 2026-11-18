import { io } from "socket.io-client";
import { getToken } from "./auth";

let socket;

function getSocketUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }

  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return "http://localhost:5000";
  }
  return typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
}

export function connectAppSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      auth: { token: getToken() },
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
