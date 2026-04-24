require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { getPool } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Start server after DB connection
const start = async () => {
  try {
    await getPool();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  }
};

start();
