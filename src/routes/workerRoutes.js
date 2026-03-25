import express from "express";
import {
  deleteWorker,
  getActiveWorker,
  getAllWorkers,
  getWorkerById,
  updateActiveStatus,
  updateWorkerProfile,
} from "../controllers/Roles/Workers/workerController.js";
import protect from "../middlewares/verifyUser.js";
import { restrictTo } from "../middlewares/restictAccess.js";
import { uReq } from "../controllers/Roles/Workers/worker.BookingController.js";

const router = express.Router();

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Get all workers
 *     tags: [Workers]
 *     responses:
 *       200:
 *         description: List of workers
 */
router.get("/", getAllWorkers);

/**
 * @swagger
 * /api/workers/active:
 *   get:
 *     summary: Get only active workers
 *     tags: [Workers]
 *     responses:
 *       200:
 *         description: List of active workers
 */
router.get("/active", getActiveWorker);

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Get worker by ID
 *     tags: [Workers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker details
 *       404:
 *         description: Worker not found
 */
router.get("/:id", getWorkerById);

/**
 * @swagger
 * /api/workers/{id}:
 *   patch:
 *     summary: Update worker details
 *     tags: [Workers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               job:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin, staff, or worker access required
 *       404:
 *         description: Worker not found
 */
router.patch("/update/me", protect, restrictTo("worker"), updateWorkerProfile);

/**
 * @swagger
 * /api/workers/{id}:
 *   delete:
 *     summary: Delete a worker
 *     tags: [Workers]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Worker not found
 */
router.patch("/updateStatus/me", protect, updateActiveStatus);

// <<<<----- get users booking requests ----->>>>>
// router.get("/my-req", protect, restrictTo("worker"), getUsersRequets);
// router.get("/users-req", protect, uReq);

export default router;
