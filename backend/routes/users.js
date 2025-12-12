const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");
const consoleLogger = require("../utils/logger");

const router = express.Router();

// Get all users (Admin only)
router.get(
  "/",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    consoleLogger.log("🔍 Fetching all users...");

    const query = `
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.role, 
      u.status, 
      u.mobile_number, 
      u.address,
      u.created_at,
      u.created_by,
      creator.username as created_by_name 
    FROM users u 
    LEFT JOIN users creator ON u.created_by = creator.id 
    ORDER BY u.created_at DESC
  `;

    try {
      const [results] = await db.query(query);
      consoleLogger.log(`✅ Found ${results.length} users in database`);

      const usersWithFallbackCreator = results.map((user) => ({
        ...user,
        created_by_name: user.created_by_name || "System",
      }));

      res.json(usersWithFallbackCreator);
    } catch (err) {
      consoleLogger.error("❌ Database error fetching users:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch users", details: err.message });
    }
  }
);

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  consoleLogger.log("Fetching user profile for ID:", req.user.id);

  const query = `
    SELECT 
      id, username, email, role, status, 
      mobile_number, address, created_at, created_by
    FROM users 
    WHERE id = ?
  `;

  try {
    const [results] = await db.query(query, [req.user.id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  } catch (err) {
    consoleLogger.error("❌ Database error fetching user profile:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch user profile", details: err.message });
  }
});

// Create new user (Admin only)
router.post(
  "/",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    const { username, email, password, role, mobile_number, address } =
      req.body;

    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Username, email, password, and role are required" });
    }

    if (!["admin", "editor", "viewer"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be admin, editor, or viewer" });
    }

    try {
      const [existing] = await db.query(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
      );

      if (existing.length > 0) {
        return res
          .status(409)
          .json({ error: "Username or email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
      INSERT INTO users 
        (username, email, password, role, mobile_number, address, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, 'approved', ?)
    `;

      const [result] = await db.query(insertQuery, [
        username,
        email,
        hashedPassword,
        role,
        mobile_number || null,
        address || null,
        req.user.id,
      ]);

      await db.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
       VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.id,
          "create",
          "user",
          result.insertId,
          `Created user ${username} with role ${role}`,
        ]
      );

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: result.insertId,
          username,
          email,
          role,
          status: "approved",
          mobile_number: mobile_number || null,
          address: address || null,
        },
      });
    } catch (err) {
      console.error("❌ Error creating user:", err);
      res
        .status(500)
        .json({ error: "Failed to create user", details: err.message });
    }
  }
);

// Update user status
router.patch(
  "/:id/status",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    try {
      const [userRows] = await db.query(
        "SELECT username FROM users WHERE id = ?",
        [id]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const username = userRows[0].username;

      const [result] = await db.query(
        "UPDATE users SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
       VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.id,
          "update_status",
          "user",
          id,
          `Changed status of user ${username} to ${status}`,
        ]
      );

      res.json({
        message: `User status updated to ${status} successfully`,
        userId: id,
        username,
        status,
      });
    } catch (err) {
      consoleLogger.error("❌ Error updating user status:", err);
      res
        .status(500)
        .json({ error: "Failed to update user status", details: err.message });
    }
  }
);

// Update user role
router.patch(
  "/:id/role",
  authenticateToken,
  requireRole(["super_admin"]),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["super_admin", "admin", "editor", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (parseInt(id) === req.user.id && role !== "super_admin") {
      return res
        .status(400)
        .json({
          error: "Cannot remove super_admin role from your own account",
        });
    }

    try {
      const [userRows] = await db.query(
        "SELECT username FROM users WHERE id = ?",
        [id]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const username = userRows[0].username;

      const [result] = await db.query(
        "UPDATE users SET role = ? WHERE id = ?",
        [role, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
       VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.id,
          "update_role",
          "user",
          id,
          `Changed role of user ${username} to ${role}`,
        ]
      );

      res.json({
        message: `User role updated to ${role} successfully`,
        userId: id,
        username,
        role,
      });
    } catch (err) {
      consoleLogger.error("❌ Error updating user role:", err);
      res
        .status(500)
        .json({ error: "Failed to update user role", details: err.message });
    }
  }
);

// Update own profile
router.put("/profile", authenticateToken, async (req, res) => {
  const { email, mobile_number, address } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE users SET email = ?, mobile_number = ?, address = ? WHERE id = ?`,
      [email, mobile_number, address, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    consoleLogger.error("❌ Error updating profile:", err);
    res
      .status(500)
      .json({ error: "Failed to update profile", details: err.message });
  }
});

// Delete user
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["super_admin"]),
  async (req, res) => {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    try {
      const [userRows] = await db.query(
        "SELECT username FROM users WHERE id = ?",
        [id]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const username = userRows[0].username;

      // 🔥 FIX: delete dependent login_attempts first
      await db.query("DELETE FROM login_attempts WHERE user_id = ?", [id]);

      // Delete user now that dependencies are removed
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, "delete", "user", id, `Deleted user account: ${username}`]
      );

      res.json({
        message: "User deleted successfully",
        deletedUser: { id, username },
      });
    } catch (err) {
      consoleLogger.error("❌ Error deleting user:", err);
      res
        .status(500)
        .json({ error: "Failed to delete user", details: err.message });
    }
  }
);


// Debug schema
router.get(
  "/debug/schema",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    const testQuery = `
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' 
    AND TABLE_SCHEMA = DATABASE()
    ORDER BY ORDINAL_POSITION
  `;

    try {
      const [results] = await db.query(testQuery);
      res.json({ schema: results });
    } catch (err) {
      consoleLogger.error("❌ Schema check error:", err);
      res
        .status(500)
        .json({ error: "Failed to check schema", details: err.message });
    }
  }
);

// Get user by ID
router.get(
  "/:id",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [results] = await db.query(
        `SELECT id, username, email, role, status, mobile_number, address, created_at 
       FROM users WHERE id = ?`,
        [id]
      );

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(results[0]);
    } catch (err) {
      consoleLogger.error("❌ Error fetching user:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch user", details: err.message });
    }
  }
);

// User statistics
router.get(
  "/stats/overview",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    try {
      const queries = {
        total: "SELECT COUNT(*) as count FROM users",
        approved:
          'SELECT COUNT(*) as count FROM users WHERE status = "approved"',
        pending: 'SELECT COUNT(*) as count FROM users WHERE status = "pending"',
        rejected:
          'SELECT COUNT(*) as count FROM users WHERE status = "rejected"',
        suspended:
          'SELECT COUNT(*) as count FROM users WHERE status = "suspended"',
        byRole: `
        SELECT role, COUNT(*) as count 
        FROM users 
        WHERE status = "approved" 
        GROUP BY role
      `,
      };

      const [
        [total],
        [approved],
        [pending],
        [rejected],
        [suspended],
        [byRole],
      ] = await Promise.all([
        db.query(queries.total),
        db.query(queries.approved),
        db.query(queries.pending),
        db.query(queries.rejected),
        db.query(queries.suspended),
        db.query(queries.byRole),
      ]);

      const stats = {
        total: total[0].count,
        approved: approved[0].count,
        pending: pending[0].count,
        rejected: rejected[0].count,
        suspended: suspended[0].count,
        byRole: byRole.reduce((acc, row) => {
          acc[row.role] = row.count;
          return acc;
        }, {}),
      };

      res.json(stats);
    } catch (err) {
      consoleLogger.error("❌ Error fetching user statistics:", err);
      res
        .status(500)
        .json({
          error: "Failed to fetch user statistics",
          details: err.message,
        });
    }
  }
);

module.exports = router;
