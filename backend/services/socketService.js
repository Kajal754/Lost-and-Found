const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { prisma } = require("../config/database");

let io;
const activeConversations = new Map();

function conversationKey(userId, matchId) {
  return `${userId}:${matchId}`;
}

function addConversationViewer(userId, matchId, socketId) {
  const key = conversationKey(userId, matchId);
  const sockets = activeConversations.get(key) || new Set();
  sockets.add(socketId);
  activeConversations.set(key, sockets);
}

function removeConversationViewer(userId, matchId, socketId) {
  const key = conversationKey(userId, matchId);
  const sockets = activeConversations.get(key);
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) activeConversations.delete(key);
}

function initializeSocketServer(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!Number.isInteger(Number(decoded.id)) || Number(decoded.id) < 1) {
        return next(new Error("Invalid authentication token"));
      }
      socket.data.userId = Number(decoded.id);
      return next();
    } catch {
      return next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.data.viewingMatches = new Set();
    socket.join(`user:${userId}`);

    socket.on("conversation:join", async (payload, acknowledge) => {
      const respond = typeof acknowledge === "function" ? acknowledge : () => {};
      const matchId = Number(payload?.matchId);
      if (!Number.isInteger(matchId) || matchId < 1) {
        respond({ success: false, message: "Invalid conversation" });
        return;
      }

      try {
        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [
              { lostItem: { userId } },
              { foundItem: { userId } },
            ],
          },
          select: { id: true },
        });
        if (!match) {
          respond({ success: false, message: "Conversation not found" });
          return;
        }

        socket.join(`conversation:${matchId}`);
        socket.data.viewingMatches.add(matchId);
        addConversationViewer(userId, matchId, socket.id);
        respond({ success: true });
      } catch (error) {
        console.error("Socket conversation join error:", error);
        respond({ success: false, message: "Could not join conversation" });
      }
    });

    socket.on("conversation:leave", (payload) => {
      const matchId = Number(payload?.matchId);
      if (!socket.data.viewingMatches.has(matchId)) return;
      socket.data.viewingMatches.delete(matchId);
      removeConversationViewer(userId, matchId, socket.id);
      socket.leave(`conversation:${matchId}`);
    });

    socket.on("disconnect", () => {
      for (const matchId of socket.data.viewingMatches) {
        removeConversationViewer(userId, matchId, socket.id);
      }
      socket.data.viewingMatches.clear();
    });
  });

  return io;
}

function emitToUser(userId, event, payload) {
  io?.to(`user:${userId}`).emit(event, payload);
}

function emitToConversation(matchId, event, payload) {
  io?.to(`conversation:${matchId}`).emit(event, payload);
}

function isUserViewingConversation(userId, matchId) {
  return Boolean(activeConversations.get(conversationKey(userId, matchId))?.size);
}

module.exports = {
  initializeSocketServer,
  emitToUser,
  emitToConversation,
  isUserViewingConversation,
};
