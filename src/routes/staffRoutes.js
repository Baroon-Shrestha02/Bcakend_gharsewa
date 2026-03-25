import express from "express";
import { restrictTo } from "../middlewares/restictAccess.js";
import protect from "../middlewares/verifyUser.js";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/Roles/Staffs/staffController.js";

const router = express.Router();

/**
 * @swagger
 * /api/staffs:
 *   post:
 *     summary: Create a new staff member (Admin only)
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.post("/", protect, restrictTo("admin"), createStaff);

/**
 * @swagger
 * /api/staffs:
 *   get:
 *     summary: Get all staff members
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of staff members
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or staff access required
 */
router.get("/", protect, restrictTo("admin", "staff"), getAllStaff);

/**
 * @swagger
 * /api/staffs/{id}:
 *   get:
 *     summary: Get staff member by ID
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or staff access required
 *       404:
 *         description: Staff not found
 */
router.get("/:id", protect, restrictTo("admin", "staff"), getStaffById);

/**
 * @swagger
 * /api/staffs/{id}:
 *   patch:
 *     summary: Update staff member details
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or staff access required
 *       404:
 *         description: Staff not found
 */
router.patch("/:id", protect, restrictTo("admin", "staff"), updateStaff);

/**
 * @swagger
 * /api/staffs/{id}:
 *   delete:
 *     summary: Delete a staff member (Admin only)
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Staff not found
 */
router.delete("/:id", protect, restrictTo("admin"), deleteStaff);

export default router;
