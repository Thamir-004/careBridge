import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import hospitalRoutes from "./routes/hospitalRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// Routes
app.use("/api/hospitals", hospitalRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
