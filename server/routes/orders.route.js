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

// PUT /api/orders/status - Update order status (PROTECTED: admin)
router.put(
  "/status",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { orderId, status } = req.body;

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
        data: {
          orderId: updatedOrders[0].order_id,
          status: updatedOrders[0].status,
          total: parseFloat(updatedOrders[0].total_amount),
          pickupDate: updatedOrders[0].pickup_date,
          deliveryDate: updatedOrders[0].delivery_date,
        },
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

// GET /api/orders/delivery-available - Get available orders for delivery agents
router.get(
  "/delivery-available",
  authenticateToken,
  authorizeRole("delivery"),
  async (req, res) => {
    try {
      const [orders] = await pool.execute(
        `SELECT 
          o.order_id as id, o.customer_name as customerName, 
          o.customer_phone as customerPhone, o.status, 
          o.pickup_date as pickupDate, o.delivery_date as deliveryDate, 
          o.pickup_address as address, o.total_amount as total, 
          o.created_at as createdAt
        FROM orders o 
        WHERE o.status IN ('Pending', 'Ready for Delivery')
        AND o.delivery_agent_id IS NULL
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
      console.error("Error fetching delivery orders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch delivery orders",
        error: error.message,
      });
    }
  }
);

// PATCH /api/orders/:orderId/accept - Accept order by delivery agent
router.patch(
  "/:orderId/accept",
  authenticateToken,
  authorizeRole("delivery"),
  async (req, res) => {
    const { orderId } = req.params;
    const deliveryAgentId = req.user.userId;

    try {
      // Check if order exists and is available
      const [orders] = await pool.execute(
        "SELECT * FROM orders WHERE order_id = ? AND status IN ('Pending', 'Ready for Delivery')",
        [orderId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not available for acceptance",
        });
      }

      // Update order with delivery agent info
      await pool.execute(
        "UPDATE orders SET delivery_agent_id = ?, accepted_at = NOW() WHERE order_id = ?",
        [deliveryAgentId, orderId]
      );

      res.json({
        success: true,
        message: "Order accepted successfully",
        data: { orderId, deliveryAgentId },
      });
    } catch (error) {
      console.error("Error accepting order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to accept order",
        error: error.message,
      });
    }
  }
);

// PATCH /api/orders/:orderId/complete - Complete order and delete from database
router.patch(
  "/:orderId/complete",
  authenticateToken,
  authorizeRole("delivery"),
  async (req, res) => {
    const { orderId } = req.params;
    const deliveryAgentId = req.user.userId;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if order exists and is assigned to this delivery agent
      const [orders] = await connection.execute(
        "SELECT * FROM orders WHERE order_id = ? AND delivery_agent_id = ?",
        [orderId, deliveryAgentId]
      );

      if (orders.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Order not found or not assigned to you",
        });
      }

      // Delete order items first (due to foreign key constraint)
      await connection.execute(
        "DELETE FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_id = ?)",
        [orderId]
      );

      // Delete the order
      await connection.execute("DELETE FROM orders WHERE order_id = ?", [
        orderId,
      ]);

      await connection.commit();

      res.json({
        success: true,
        message: "Order completed and removed from database successfully",
        data: { orderId },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error completing order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to complete order",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

// PATCH /api/orders/:orderId/cancel - Cancel order (PROTECTED: customer)
router.patch(
  "/:orderId/cancel",
  authenticateToken,
  authorizeRole("customer"),
  async (req, res) => {
    const { orderId } = req.params;
    const customerId = req.user.userId;

    try {
      // Check if order exists and belongs to the customer
      const [orders] = await pool.execute(
        "SELECT * FROM orders WHERE order_id = ? AND customer_id = ?",
        [orderId, customerId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found or you don't have permission to cancel this order",
        });
      }

      const order = orders[0];

      // Check if order can be cancelled (only Pending or In Progress orders)
      if (order.status !== "Pending" && order.status !== "In Progress") {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status: ${order.status}. Only Pending or In Progress orders can be cancelled.`,
        });
      }

      // Update order status to Cancelled
      const [result] = await pool.execute(
        "UPDATE orders SET status = ?, cancelled_at = NOW() WHERE order_id = ? AND customer_id = ?",
        ["Cancelled", orderId, customerId]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to cancel order",
        });
      }

      // Get updated order details
      const [updatedOrders] = await pool.execute(
        "SELECT order_id, status, total_amount, pickup_date, delivery_date, cancelled_at FROM orders WHERE order_id = ?",
        [orderId]
      );

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: {
          orderId: updatedOrders[0].order_id,
          status: updatedOrders[0].status,
          total: parseFloat(updatedOrders[0].total_amount),
          cancelledAt: updatedOrders[0].cancelled_at,
        },
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error: error.message,
      });
    }
  }
);

// PATCH /api/orders/:orderId/release - Release order by delivery agent
router.patch(
  "/:orderId/release",
  authenticateToken,
  authorizeRole("delivery"),
  async (req, res) => {
    const { orderId } = req.params;
    const deliveryAgentId = req.user.userId;

    try {
      // Check if order exists and is assigned to this delivery agent
      const [orders] = await pool.execute(
        "SELECT * FROM orders WHERE order_id = ? AND delivery_agent_id = ?",
        [orderId, deliveryAgentId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not assigned to you",
        });
      }

      const order = orders[0];

      // Only allow release if order is not completed or delivered
      if (order.status === "Completed" || order.status === "Delivered") {
        return res.status(400).json({
          success: false,
          message: "Cannot release completed or delivered orders",
        });
      }

      // Update order to remove delivery agent assignment
      const [result] = await pool.execute(
        "UPDATE orders SET delivery_agent_id = NULL, accepted_at = NULL WHERE order_id = ? AND delivery_agent_id = ?",
        [orderId, deliveryAgentId]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to release order",
        });
      }

      res.json({
        success: true,
        message:
          "Order released successfully. Other delivery agents can now accept it.",
        data: { orderId },
      });
    } catch (error) {
      console.error("Error releasing order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to release order",
        error: error.message,
      });
    }
  }
);

// GET /api/orders/my-deliveries - Get orders assigned to current delivery agent
router.get(
  "/my-deliveries",
  authenticateToken,
  authorizeRole("delivery"),
  async (req, res) => {
    try {
      const deliveryAgentId = req.user.userId;

      const [orders] = await pool.execute(
        `SELECT 
          o.order_id as id,
          o.customer_name as customerName,
          o.customer_phone as customerPhone,
          o.pickup_address as address,
          o.status,
          o.total_amount as total,
          o.pickup_date as pickupDate,
          o.delivery_date as deliveryDate,
          o.accepted_at as acceptedAt,
          o.special_instructions as instructions
        FROM orders o
        WHERE o.delivery_agent_id = ? 
        ORDER BY o.accepted_at DESC`,
        [deliveryAgentId]
      );

      // Convert total to number for each order
      const ordersWithNumericTotal = orders.map((order) => ({
        ...order,
        total: parseFloat(order.total),
      }));

      res.json({
        success: true,
        data: ordersWithNumericTotal,
      });
    } catch (error) {
      console.error("Error fetching my delivery orders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch assigned orders",
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
