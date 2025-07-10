import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.config.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/register - User registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate address for customers
    if (role === "customer" && !address) {
      return res.status(400).json({
        success: false,
        message: "Address is required for customers",
      });
    }

    // Validate role
    if (!["customer", "admin", "delivery"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user with address (null for non-customers)
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, phone, role, address) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, role, role === "customer" ? address : null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Get the created user (without password)
    const [users] = await pool.execute(
      "SELECT id, name, email, phone, role, address FROM users WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: users[0],
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
});

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user exists
    const [users] = await pool.execute(
      "SELECT id, name, email, password, phone, role, address FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
});

// GET /api/auth/me - Get current user info
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, phone, role, customer_id, employee_id, agent_id FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          customerId: user.customer_id,
          employeeId: user.employee_id,
          agentId: user.agent_id,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user info",
      error: error.message,
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, address } = req.body;

    // Update user profile
    const [result] = await pool.execute(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone, address, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get updated user data
    const [users] = await pool.execute(
      "SELECT id, name, email, phone, role, address FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: users[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// PUT /api/auth/change-password - Change user password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get current user
    const [users] = await pool.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const [result] = await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to update password",
      });
    }

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
});

// DELETE /api/auth/delete-account - Delete user account
router.delete("/delete-account", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Delete user account
    const [result] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
});

export default router;
