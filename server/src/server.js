import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./config/db.js";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    await connectToDatabase(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
      console.log(`Docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

