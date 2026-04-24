require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ⚠️ NO app.listen() - Vercel handles this
module.exports = app;