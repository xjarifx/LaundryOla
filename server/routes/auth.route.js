import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.config.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Helper function to generate unique IDs
const generateUniqueId = (role) => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  switch (role) {
    case "customer":
      return `CUS${timestamp}${random}`;
    case "admin":
      return `EMP${timestamp}${random}`;
    case "delivery":
      return `AGT${timestamp}${random}`;
    default:
      return `USR${timestamp}${random}`;
  }
};

// POST /api/auth/register - User registration
router.post("/register", async (req, res) => {
  const connection = await pool.getConnection();

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

    // Start transaction
    await connection.beginTransaction();

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password, phone, role, address) VALUES (?, ?, ?, ?, ?, ?)",
      [
        name,
        email,
        hashedPassword,
        phone,
        role,
        role === "customer" ? address : null,
      ]
    );

    const userId = result.insertId;

    // Generate and insert role-specific ID
    const uniqueId = generateUniqueId(role);

    if (role === "customer") {
      await connection.execute(
        "INSERT INTO customer_ids (user_id, customer_id) VALUES (?, ?)",
        [userId, uniqueId]
      );
    } else if (role === "admin") {
      await connection.execute(
        "INSERT INTO employee_ids (user_id, employee_id) VALUES (?, ?)",
        [userId, uniqueId]
      );
    } else if (role === "delivery") {
      await connection.execute(
        "INSERT INTO agent_ids (user_id, agent_id) VALUES (?, ?)",
        [userId, uniqueId]
      );
    }

    // Commit transaction
    await connection.commit();

    // Generate JWT token
    const token = jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Get the created user with role-specific ID
    let userQuery = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.address
    `;
    let joinClause = "";

    if (role === "customer") {
      userQuery += ", c.customer_id";
      joinClause = "LEFT JOIN customer_ids c ON u.id = c.user_id";
    } else if (role === "admin") {
      userQuery += ", e.employee_id";
      joinClause = "LEFT JOIN employee_ids e ON u.id = e.user_id";
    } else if (role === "delivery") {
      userQuery += ", a.agent_id";
      joinClause = "LEFT JOIN agent_ids a ON u.id = a.user_id";
    }

    userQuery += ` FROM users u ${joinClause} WHERE u.id = ?`;

    const [users] = await connection.execute(userQuery, [userId]);

    // Transform the user object to use camelCase for ID fields
    const user = users[0];
    const transformedUser = {
      ...user,
      customerId: user.customer_id,
      employeeId: user.employee_id,
      agentId: user.agent_id
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: transformedUser,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  } finally {
    connection.release();
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

    // Check if user exists with role-specific IDs
    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.password, u.phone, u.role, u.address,
              c.customer_id, e.employee_id, a.agent_id
       FROM users u
       LEFT JOIN customer_ids c ON u.id = c.user_id
       LEFT JOIN employee_ids e ON u.id = e.user_id
       LEFT JOIN agent_ids a ON u.id = a.user_id
       WHERE u.email = ?`,
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

    // Transform the user object to use camelCase for ID fields
    const transformedUser = {
      ...userWithoutPassword,
      customerId: userWithoutPassword.customer_id,
      employeeId: userWithoutPassword.employee_id,
      agentId: userWithoutPassword.agent_id
    };

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: transformedUser,
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
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.address,
              c.customer_id, e.employee_id, a.agent_id
       FROM users u
       LEFT JOIN customer_ids c ON u.id = c.user_id
       LEFT JOIN employee_ids e ON u.id = e.user_id
       LEFT JOIN agent_ids a ON u.id = a.user_id
       WHERE u.id = ?`,
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // Transform the user object to use camelCase for ID fields
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      customerId: user.customer_id,
      employeeId: user.employee_id,
      agentId: user.agent_id,
    };

    res.json({
      success: true,
      data: {
        user: transformedUser,
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

    // Get updated user data with role-specific IDs
    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.address,
              c.customer_id, e.employee_id, a.agent_id
       FROM users u
       LEFT JOIN customer_ids c ON u.id = c.user_id
       LEFT JOIN employee_ids e ON u.id = e.user_id
       LEFT JOIN agent_ids a ON u.id = a.user_id
       WHERE u.id = ?`,
      [userId]
    );

    // Transform the user object to use camelCase for ID fields
    const user = users[0];
    const transformedUser = {
      ...user,
      customerId: user.customer_id,
      employeeId: user.employee_id,
      agentId: user.agent_id
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: transformedUser,
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
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      users[0].password
    );
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

    // Delete user account (CASCADE will handle related tables)
    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

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
