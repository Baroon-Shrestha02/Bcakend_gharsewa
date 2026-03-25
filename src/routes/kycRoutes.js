import express from "express";
import { restrictTo } from "../middlewares/restictAccess.js";
import { sendDoc } from "../controllers/Roles/Workers/worker.KycController.js";
import protect from "../middlewares/verifyUser.js";
import {
  getDocs,
  updateStatusDocs,
} from "../controllers/Roles/Admins/admin.doc.js";

const router = express.Router();

/**
 * @swagger
 * /api/documents/send-doc:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               kyc_document:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documents submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized or inactive user
 */
router.post("/send-doc", protect, restrictTo("user", "worker"), sendDoc);

/**
 * @swagger
 * /api/documents/get-doc:
 *   get:
 *     summary: Get all submitted KYC documents (Admin/Staff)
 *     tags: [Admin KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 *       403:
 *         description: Forbidden
 */
router.get("/get-doc", protect, restrictTo("admin", "staff"), getDocs);

/**
 * @swagger
 * /api/documents/update-doc/{id}:
 *   patch:
 *     summary: Update KYC status (Approve/Reject)
 *     tags: [Admin KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kycStatus:
 *                 type: string
 *                 enum: [approved, rejected]
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: KYC status updated
 *       404:
 *         description: User not found
 */
router.patch(
  "/update-doc/:id",
  protect,
  restrictTo("admin", "staff"),
  updateStatusDocs,
);

export default router;
