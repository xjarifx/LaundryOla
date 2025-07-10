import express from "express";
import pool from "../config/database.config.js";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/orders - Create new order (PROTECTED)
router.post(
  "/",
  authenticateToken,
  authorizeRole("customer"),
  async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        customerName,
        phone,
        address,
        pickupDate,
        pickupTime,
        deliveryDate,
        instructions,
        services,
        total,
      } = req.body;

      // Use authenticated user's ID instead of hardcoded customer_id
      const customerId = req.user.userId;

      // Validate required fields
      if (
        !customerName ||
        !phone ||
        !address ||
        !pickupDate ||
        !pickupTime ||
        !services ||
        services.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Calculate delivery date if not provided (pickup date + 2 days)
      let calculatedDeliveryDate = deliveryDate;
      if (!calculatedDeliveryDate) {
        const pickup = new Date(pickupDate);
        pickup.setDate(pickup.getDate() + 2);
        calculatedDeliveryDate = pickup.toISOString().split("T")[0];
      }

      // Insert order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          customer_id, customer_name, customer_phone, pickup_address, 
          pickup_date, pickup_time, delivery_date, special_instructions, 
          total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          customerName,
          phone,
          address,
          pickupDate,
          pickupTime,
          calculatedDeliveryDate,
          instructions || null,
          total,
          "Pending",
        ]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const service of services) {
        await connection.execute(
          `INSERT INTO order_items (
            order_id, service_id, service_name, unit_price, unit, quantity, item_total
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            service.id,
            service.name,
            service.price,
            service.unit,
            service.quantity,
            service.total,
          ]
        );
      }

      await connection.commit();

      // Get the created order with order_id
      const [createdOrder] = await connection.execute(
        "SELECT order_id, status, total_amount FROM orders WHERE id = ?",
        [orderId]
      );

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          orderId: createdOrder[0].order_id,
          status: createdOrder[0].status,
          total: parseFloat(createdOrder[0].total_amount),
        },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

// GET /api/orders - Get orders for authenticated user (PROTECTED)
router.get(
  "/",
  authenticateToken,
  authorizeRole("customer"),
  async (req, res) => {
    try {
      // Use authenticated user's ID instead of hardcoded customer_id
      const customerId = req.user.userId;

      const [orders] = await pool.execute(
        `SELECT 
          o.order_id, o.status, o.pickup_date, o.delivery_date, 
          o.total_amount, o.created_at
        FROM orders o 
        WHERE o.customer_id = ? 
        ORDER BY o.created_at DESC`,
        [customerId]
      );

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const [items] = await pool.execute(
            `SELECT service_name, quantity, unit, item_total 
             FROM order_items 
             WHERE order_id = (SELECT id FROM orders WHERE order_id = ?)`,
            [order.order_id]
          );

          return {
            id: order.order_id,
            status: order.status,
            pickupDate: order.pickup_date,
            deliveryDate: order.delivery_date,
            total: parseFloat(order.total_amount),
            services: items.map((item) => ({
              name: item.service_name,
              quantity: `${item.quantity} ${item.unit.replace("per ", "")}`,
              price: parseFloat(item.item_total),
            })),
            trackingStage: getTrackingStage(order.status),
          };
        })
      );

      res.json({
        success: true,
        data: ordersWithItems,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }
);

// PATCH /api/orders/:orderId/status - Update order status (PROTECTED: admin, delivery)
router.patch(
  "/:orderId/status",
  authenticateToken,
  authorizeRole("admin", "delivery"),
  async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Allowed statuses
    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Ready for Delivery",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    try {
      // Check if order exists
      const [orders] = await pool.execute(
        "SELECT * FROM orders WHERE order_id = ?",
        [orderId]
      );
      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Update status
      await pool.execute("UPDATE orders SET status = ? WHERE order_id = ?", [
        status,
        orderId,
      ]);

      // Fetch updated order
      const [updatedOrders] = await pool.execute(
        "SELECT order_id, status, total_amount, pickup_date, delivery_date FROM orders WHERE order_id = ?",
        [orderId]
      );

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrders[0],
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message,
      });
    }
  }
);

// GET /api/orders/all - Get all orders for admin (PROTECTED: admin only)
router.get(
  "/all",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const [orders] = await pool.execute(
        `SELECT 
          o.order_id as id, o.customer_name as customerName, 
          o.customer_phone as customerPhone, o.status, 
          o.pickup_date as pickupDate, o.delivery_date as deliveryDate, 
          o.total_amount as total, o.created_at as createdAt
        FROM orders o 
        ORDER BY o.created_at DESC`
      );

      // Convert total to number
      const ordersWithNumericTotal = orders.map((order) => ({
        ...order,
        total: parseFloat(order.total),
      }));

      res.json({
        success: true,
        data: ordersWithNumericTotal,
      });
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }
);

// Helper function to map status to tracking stage
function getTrackingStage(status) {
  switch (status) {
    case "Pending":
      return "Picked Up";
    case "In Progress":
      return "Processing";
    case "Ready for Delivery":
      return "Ready";
    case "Completed":
      return "Delivered";
    default:
      return "Picked Up";
  }
}

export default router;
