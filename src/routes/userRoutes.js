import express from "express";

import protect from "../middlewares/verifyUser.js";
import { restrictTo } from "../middlewares/restictAccess.js";
import {
  getAllUser,
  updateActiveStatus,
  deleteInactiveUser,
} from "../controllers/Roles/Admins/admin.UserController.js";
import {
  toggleActiveStatus,
  updateProfile,
} from "../controllers/Roles/Users/userController.js";

const router = express.Router();

/**
 * @swagger
 * /api/users/all-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get("/all-users", protect, restrictTo("admin"), getAllUser);

// /**
//  * @swagger
//  * /api/users/toggle-status/{id}:
//  *   patch:
//  *     summary: Toggle user's active status (Admin only)
//  *     tags: [Admin]
//  *     security:
//  *       - cookieAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: User ID
//  *     responses:
//  *       200:
//  *         description: User status updated successfully
//  *       400:
//  *         description: Bad request
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden - admin access required
//  *       404:
//  *         description: User not found
//  */
// router.patch(
//   "/toggle-status/:id",
//   protect,
//   restrictTo("admin"),
//   updateActiveStatus,
// );

/**
 * @swagger
 * /api/users/delete/{id}:
 *   delete:
 *     summary: Delete inactive user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: User not found
 */
router.delete("/delete/:id", protect, restrictTo("admin"), deleteInactiveUser);

/**
 * @swagger
 * /api/users/update-profile:
 *   patch:
 *     summary: Update logged-in user's profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               middlename:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: number
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch("/update-profile", protect, updateProfile);

/**
 * @swagger
 * /api/users/active-status:
 *   patch:
 *     summary: Toggle logged-in user's active status
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Active status updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/active-status", protect, toggleActiveStatus);

export default router;
