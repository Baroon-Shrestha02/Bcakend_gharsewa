import express from "express";
import { restrictTo } from "../middlewares/restictAccess.js";
import protect from "../middlewares/verifyUser.js";
import {
  getAllKyc,
  getMyKyc,
  sendDoc,
  updateStatusDocs,
} from "../controllers/documentController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: KYC
 *     description: KYC document submission for users and workers
 *   - name: Admin KYC
 *     description: KYC review and management for admins
 */

/**
 * @swagger
 * /api/documents/send-doc:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [KYC]
 *     description: >
 *       Submits KYC documents for the authenticated user or worker. The account
 *       must be active and not already verified or pending review. If a previously
 *       rejected submission exists, this will replace it (upsert). Supports multiple
 *       document uploads. Sets kycStatus to "pending" on both the KYC record and
 *       the user model.
 *       Access: user, worker.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - kyc_document_type
 *               - kyc_document
 *             properties:
 *               kyc_document_type:
 *                 type: string
 *                 description: Type of the submitted identity document
 *                 example: National ID
 *               kyc_document:
 *                 type: string
 *                 format: binary
 *                 description: >
 *                   Document image file. Repeat this field to upload multiple documents.
 *     responses:
 *       200:
 *         description: KYC documents submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: KYC documents submitted successfully
 *                 kyc:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d1234567890abcdef1111
 *                     user:
 *                       type: string
 *                       example: 67d1234567890abcdef0001
 *                     kyc_document_type:
 *                       type: string
 *                       example: National ID
 *                     kyc_document:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: https://res.cloudinary.com/sample/image/upload/v1/doc.jpg
 *                           public_id:
 *                             type: string
 *                             example: kyc/doc_abc123
 *                     kycStatus:
 *                       type: string
 *                       example: pending
 *                     rejectionReason:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     reviewedBy:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     reviewedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-06-15T10:30:00.000Z
 *       400:
 *         description: >
 *           Validation error. Possible causes: missing document type, no file
 *           uploaded, or KYC already submitted and pending review.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: KYC already submitted and under review.
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Account is inactive, already verified, or role is not user/worker
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Your account is already verified.
 *       404:
 *         description: Authenticated user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post("/send-doc", protect, restrictTo("user", "worker"), sendDoc);

/**
 * @swagger
 * /api/documents/get-doc:
 *   get:
 *     summary: Get all KYC records
 *     tags: [Admin KYC]
 *     description: >
 *       Returns all KYC records across all users and workers, sorted by most
 *       recently submitted. Optionally filter by status using the query parameter.
 *       Both the submitting user and the reviewing admin are populated.
 *       Access: admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *         description: Filter records by KYC status
 *         example: pending
 *     responses:
 *       200:
 *         description: KYC records fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 kycRecords:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67d1234567890abcdef1111
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 67d1234567890abcdef0001
 *                           firstname:
 *                             type: string
 *                             example: Baroon
 *                           lastname:
 *                             type: string
 *                             example: Shrestha
 *                           email:
 *                             type: string
 *                             example: baroon@gmail.com
 *                       kyc_document_type:
 *                         type: string
 *                         example: National ID
 *                       kyc_document:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               example: https://res.cloudinary.com/sample/image/upload/v1/doc.jpg
 *                             public_id:
 *                               type: string
 *                               example: kyc/doc_abc123
 *                       kycStatus:
 *                         type: string
 *                         enum: [pending, verified, rejected]
 *                         example: pending
 *                       rejectionReason:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       reviewedBy:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 67d1234567890abcdef0099
 *                           firstname:
 *                             type: string
 *                             example: Admin
 *                           lastname:
 *                             type: string
 *                             example: User
 *                           email:
 *                             type: string
 *                             example: admin@gmail.com
 *                       reviewedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-06-15T10:30:00.000Z
 *       400:
 *         description: Invalid status filter value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Invalid status filter. Must be pending, verified, or rejected
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Authenticated user is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Access denied
 */
router.get("/get-doc", protect, restrictTo("admin"), getAllKyc);

/**
 * @swagger
 * /api/documents/get-my-doc:
 *   get:
 *     summary: Get the authenticated user's own KYC record
 *     tags: [KYC]
 *     description: >
 *       Returns the KYC record for the currently authenticated user or worker,
 *       including document URLs, submission status, and review details if already
 *       reviewed. Returns 404 if no KYC submission has been made yet.
 *       Access: any authenticated user or worker.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC record returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 kyc:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d1234567890abcdef1111
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 67d1234567890abcdef0001
 *                         firstname:
 *                           type: string
 *                           example: Baroon
 *                         lastname:
 *                           type: string
 *                           example: Shrestha
 *                         email:
 *                           type: string
 *                           example: baroon@gmail.com
 *                     kyc_document_type:
 *                       type: string
 *                       example: National ID
 *                     kyc_document:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: https://res.cloudinary.com/sample/image/upload/v1/doc.jpg
 *                           public_id:
 *                             type: string
 *                             example: kyc/doc_abc123
 *                     kycStatus:
 *                       type: string
 *                       enum: [pending, verified, rejected]
 *                       example: pending
 *                     rejectionReason:
 *                       type: string
 *                       nullable: true
 *                       description: Populated only when kycStatus is rejected
 *                       example: Document image is blurry
 *                     reviewedBy:
 *                       type: object
 *                       nullable: true
 *                       description: Populated only after admin review
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 67d1234567890abcdef0099
 *                         firstname:
 *                           type: string
 *                           example: Admin
 *                         lastname:
 *                           type: string
 *                           example: User
 *                         email:
 *                           type: string
 *                           example: admin@gmail.com
 *                     reviewedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-06-15T10:30:00.000Z
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: No KYC submission found for this account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No KYC record found for your account
 */
router.get("/get-my-doc", protect, getMyKyc);

/**
 * @swagger
 * /api/documents/update-doc/{id}:
 *   patch:
 *     summary: Approve or reject a KYC submission
 *     tags: [Admin KYC]
 *     description: >
 *       Reviews a pending KYC record by its KYC record ID (not user ID). Status
 *       can only be set to "verified" or "rejected" — not back to "pending".
 *       A rejection reason is required when rejecting. Once reviewed, the record
 *       is locked and cannot be changed again. On approval, the user's isVerified
 *       flag is set to true and kycStatus synced on the user model. On rejection,
 *       the user can resubmit via /send-doc which upserts the record back to pending.
 *       Access: admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the KYC record to review (not the user ID)
 *         example: 67d1234567890abcdef1111
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kycStatus
 *             properties:
 *               kycStatus:
 *                 type: string
 *                 enum: [verified, rejected]
 *                 example: verified
 *               rejectionReason:
 *                 type: string
 *                 description: Required when kycStatus is "rejected"
 *                 example: Document image is blurry
 *     responses:
 *       200:
 *         description: KYC reviewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: KYC verified successfully
 *                 kyc:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d1234567890abcdef1111
 *                     kycStatus:
 *                       type: string
 *                       example: verified
 *                     rejectionReason:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     reviewedBy:
 *                       type: string
 *                       description: ObjectId of the admin who reviewed
 *                       example: 67d1234567890abcdef0099
 *                     reviewedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-06-16T08:00:00.000Z
 *       400:
 *         description: >
 *           Validation error. Possible causes: invalid status value, missing
 *           rejection reason, or KYC has already been reviewed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Rejection reason is required when rejecting KYC
 *       401:
 *         description: Missing or invalid bearer token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Authenticated user is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Access denied
 *       404:
 *         description: KYC record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: KYC record not found
 */
router.patch("/update-doc/:id", protect, restrictTo("admin"), updateStatusDocs);

export default router;
