const express = require("express");
const db = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/user/:userId",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    try {
      const { userId } = req.params;

      console.log(`📋 Fetching permissions for user ID: ${userId}`);

      const [permissions] = await db.query(
        `SELECT * FROM user_permissions WHERE user_id = ? ORDER BY section, sub_section`,
        [userId]
      );

      console.log(
        `✅ Found ${permissions.length} permissions for user ${userId}`
      );
      res.json(permissions);
    } catch (error) {
      console.error("❌ Error fetching user permissions:", error);
      res.status(500).json({
        error: "Failed to fetch permissions",
        details: error.message,
      });
    }
  }
);

// Update user permissions
router.put(
  "/user/:userId",
  authenticateToken,
  requireRole(["super_admin", "admin"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      console.log(`✏️ Updating permissions for user ID: ${userId}`);
      console.log("Permissions data:", permissions);

      await db.query("START TRANSACTION");

      await db.query("DELETE FROM user_permissions WHERE user_id = ?", [
        userId,
      ]);

      if (permissions && permissions.length > 0) {
        for (const perm of permissions) {
          await db.query(
            `INSERT INTO user_permissions 
          (user_id, section, sub_section, can_view, can_create, can_edit, can_delete, can_publish) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              perm.section,
              perm.sub_section || null,
              perm.can_view || false,
              perm.can_create || false,
              perm.can_edit || false,
              perm.can_delete || false,
              perm.can_publish || false,
            ]
          );
        }
      }

      await db.query("COMMIT");

      await db.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) 
      VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.id,
          "update_permissions",
          "user",
          userId,
          `Updated permissions for user ${userId}`,
        ]
      );

      console.log(`✅ Permissions updated successfully for user ${userId}`);
      res.json({
        message: "Permissions updated successfully",
        updatedCount: permissions ? permissions.length : 0,
      });
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("❌ Error updating permissions:", error);
      res.status(500).json({
        error: "Failed to update permissions",
        details: error.message,
        sqlMessage: error.sqlMessage,
      });
    }
  }
);

// Get default permissions for role
router.get("/role/:role", authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;

    console.log(`🔍 Getting default permissions for role: ${role}`);

    const defaultPermissions = {
      viewer: {
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_publish: false,
      },
      editor: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: false,
        can_publish: false,
      },
      admin: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_publish: true,
      },
      super_admin: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_publish: true,
      },
    };

    const permissions = defaultPermissions[role] || defaultPermissions.viewer;
    console.log(`✅ Default permissions for ${role}:`, permissions);
    res.json(permissions);
  } catch (error) {
    console.error("❌ Error fetching role permissions:", error);
    res.status(500).json({
      error: "Failed to fetch role permissions",
      details: error.message,
    });
  }
});

router.get("/my-permissions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`🔍 Getting permissions for current user ID: ${userId}`);

    const [permissions] = await db.query(
      `SELECT * FROM user_permissions WHERE user_id = ? ORDER BY section, sub_section`,
      [userId]
    );

    if (permissions.length === 0) {
      const defaultPermissions = {
        viewer: {
          can_view: true,
          can_create: false,
          can_edit: false,
          can_delete: false,
          can_publish: false,
        },
        editor: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: false,
          can_publish: false,
        },
        admin: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
          can_publish: true,
        },
        super_admin: {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: true,
          can_publish: true,
        },
      };

      const rolePermissions =
        defaultPermissions[req.user.role] || defaultPermissions.viewer;
      console.log(`✅ Using role-based permissions for ${req.user.role}`);
      return res.json({ roleBased: true, permissions: rolePermissions });
    }

    console.log(
      `✅ Found ${permissions.length} custom permissions for user ${userId}`
    );
    res.json({ roleBased: false, permissions });
  } catch (error) {
    console.error("❌ Error fetching user permissions:", error);
    res.status(500).json({
      error: "Failed to fetch user permissions",
      details: error.message,
    });
  }
});

module.exports = router;
