const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

dotenv.config();

const { connectDatabase } = require("./config/database");
const { processItemLifecycle } = require("./services/itemLifecycleService");
const { initializeSocketServer } = require("./services/socketService");

const authRoutes = require("./routes/authRoutes");
const lostItemRoutes = require("./routes/lostItemRoutes");
const foundItemRoutes = require("./routes/foundItemRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set([
  ...(process.env.FRONTEND_URL || "").split(","),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
].map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "40mb" }));

app.use(express.urlencoded({ extended: true }));

// Health
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lost & Found API is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is connected successfully",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/lost-items", lostItemRoutes);
app.use("/api/found-items", foundItemRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

async function startServer() {
  try {
    await connectDatabase();

    const server = http.createServer(app);
    initializeSocketServer(server, [...allowedOrigins]);
    let lifecycleRunInProgress = false;
    const runItemLifecycle = async () => {
      if (lifecycleRunInProgress) return;
      lifecycleRunInProgress = true;
      try {
        await processItemLifecycle();
      } catch (error) {
        console.error("Item lifecycle job failed:", error);
      } finally {
        lifecycleRunInProgress = false;
      }
    };

    void runItemLifecycle();
    const lifecycleInterval = setInterval(runItemLifecycle, 60 * 60 * 1000);
    lifecycleInterval.unref();

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
