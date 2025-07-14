import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database.config.js";
import servicesRoutes from "./routes/services.route.js";
import ordersRoutes from "./routes/orders.route.js";
import authRoutes from "./routes/auth.route.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration based on environment
const corsOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL, "https://laundry-ola-three.vercel.app"]
    : [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:3000", // Additional development ports
      ];

console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔗 CORS Origins: ${corsOrigins.join(", ")}`);

app.use(
  cors({
    origin: "https://laundry-ola-three.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/orders", ordersRoutes);

// Basic route with environment info
app.get("/", (req, res) => {
  res.json({
    message: "LaundryOla API is running!",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    database: "Connected to Aiven MySQL",
    clientUrl: process.env.CLIENT_URL,
    endpoints: [
      "GET /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/services",
      "POST /api/orders",
      "GET /api/orders",
    ],
  });
});

// Health check route with environment details
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: "healthy",
      environment: process.env.NODE_ENV,
      database: dbConnected ? "connected" : "disconnected",
      clientUrl: process.env.CLIENT_URL,
      serverUrl: process.env.SERVER_URL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      environment: process.env.NODE_ENV,
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
    environment: process.env.NODE_ENV,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// Start server with environment-aware logging
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
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(
        `🌐 API URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`
      );
      console.log(
        `🏥 Health check: ${
          process.env.SERVER_URL || `http://localhost:${PORT}`
        }/api/health`
      );
      console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
