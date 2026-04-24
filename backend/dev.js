// Local development only - not used by Vercel
require("dotenv").config();
const app = require("./server");
const { getPool } = require("./config/db");

const PORT = process.env.PORT || 5000;

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