const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const ML_API_URL = process.env.ML_API_URL || "http://localhost:5001";

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ── MongoDB Connection ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/road_accident_db")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("⚠️  MongoDB not connected (predictions still work):", err.message));

// ── Routes ─────────────────────────────────────────────────────────
const { protect } = require("./routes/auth");
app.use("/api/auth", require("./routes/auth").router);
app.use("/api/predict", protect, require("./routes/predict"));
app.use("/api/history", protect, require("./routes/history"));
app.use("/api/analytics", protect, require("./routes/analytics"));

// ── Health Check ──────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  let mlStatus = "unknown";
  try {
    const r = await axios.get(`${ML_API_URL}/health`, { timeout: 3000 });
    mlStatus = r.data.status;
  } catch {
    mlStatus = "offline";
  }
  res.json({
    status: "ok",
    server: "Road Accident Severity API",
    version: "1.0.0",
    mlApi: mlStatus,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`   ML API proxied from ${ML_API_URL}`);
});
