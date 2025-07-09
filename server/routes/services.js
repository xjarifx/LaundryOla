import express from "express";
import pool from "../config/database.js";

const router = express.Router();

// GET /api/services - Get all active services
router.get("/", async (req, res) => {
  try {
    const [services] = await pool.execute(
      "SELECT id, name, description, price, unit, duration FROM services WHERE is_active = 1 ORDER BY name"
    );

    // Transform the data to match your frontend format
    const formattedServices = services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: parseFloat(service.price),
      unit: service.unit,
      duration: service.duration,
      type: service.unit.includes("kg") ? "weight" : "item",
    }));

    res.json({
      success: true,
      data: formattedServices,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
});

// GET /api/services/:id - Get specific service
router.get("/:id", async (req, res) => {
  try {
    const [services] = await pool.execute(
      "SELECT * FROM services WHERE id = ? AND is_active = 1",
      [req.params.id]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = services[0];
    res.json({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        description: service.description,
        price: parseFloat(service.price),
        unit: service.unit,
        duration: service.duration,
        type: service.unit.includes("kg") ? "weight" : "item",
      },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
});

export default router;
