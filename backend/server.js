import "dotenv/config";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const express = require("express");
import cors from "cors";

import connectDB from "./config/db.js";

import chatRoutes from "./routes/chatRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import aiTestRoutes from "./routes/aiTestRoutes.js";

const app = express();

const PORT = process.env.PORT || 5001;

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

// Allow the Vite frontend to connect from localhost/127.0.0.1
// on any development port such as 5173, 5174, 5175, etc.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health / Root
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Voxliva Backend is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Voxliva API is healthy ✅",
    database: process.env.MONGO_URI
      ? "Configured"
      : "Not configured",
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/chat", chatRoutes);

app.use("/api/analyze", analyzeRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/usage", usageRoutes);
app.use("/api/ai-test", aiTestRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message:
      error?.message ||
      "Internal server error.",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "127.0.0.1", () => {
      console.log(
        `Voxliva Backend running at http://127.0.0.1:${PORT} 🚀`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start Voxliva backend:",
      error.message
    );

    process.exit(1);
  }
}

startServer();