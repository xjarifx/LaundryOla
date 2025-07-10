import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database.config.js";
import servicesRoutes from "./routes/services.route.js";
import ordersRoutes from "./routes/orders.route.js";
import authRoutes from "./routes/auth.route.js"; // Add this line

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes); // Add this line
app.use("/api/services", servicesRoutes);
app.use("/api/orders", ordersRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "LaundryOla API is running!",
    version: "1.0.0",
    database: "Connected to Aiven MySQL",
    endpoints: [
      "GET /api/health",
      "GET /api/services",
      "POST /api/orders",
      "GET /api/orders",
    ],
  });
});

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: "healthy",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
