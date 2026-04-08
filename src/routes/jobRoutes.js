import express from "express";
import { restrictTo } from "../middlewares/restictAccess.js";
import protect from "../middlewares/verifyUser.js";
import { getAllJobs } from "../controllers/Roles/Admins/admin.JobController.js";
import {
  deleteMyJob,
  getMyJobs,
  updateMyJob,
  userCreateJob,
} from "../controllers/Roles/Users/user.JobController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management
 */

/**
 * @swagger
 * /api/jobs/add-job:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     description: >
 *       Creates a new job posting for the authenticated user. The category and
 *       subcategories must already exist — they are validated by ObjectId and the
 *       subcategories must belong to the selected category. Images are optional
 *       and uploaded via multipart/form-data. subCategories can be sent as a
 *       JSON string when using FormData (e.g. '[\"id1\",\"id2\"]').
 *       Access: user only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - subCategories
 *               - wage
 *               - description
 *               - duration
 *               - location
 *               - workDate
 *               - workTime
 *               - workersNeeded
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fix electrical wiring
 *               category:
 *                 type: string
 *                 description: >
 *                   Name of an existing category. Matched case-insensitively.
 *                 example: Electrical
 *               subCategories:
 *                 type: string
 *                 description: >
 *                   JSON-stringified array of subcategory names that belong to
 *                   the selected category. At least one is required. Names are
 *                   matched case-insensitively. Must be sent as a raw JSON string —
 *                   do NOT use the array UI. Example value to paste: ["Wiring","Panel work"]
 *                 example: '["Wiring","Panel work"]'
 *               wage:
 *                 type: number
 *                 example: 1500
 *               description:
 *                 type: string
 *                 example: Need an electrician to fix faulty wiring in 2 rooms
 *               duration:
 *                 type: string
 *                 example: 3 hours
 *               location:
 *                 type: string
 *                 example: Kathmandu
 *               workDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-06-15
 *               workTime:
 *                 type: string
 *                 example: "09:00 AM"
 *               workersNeeded:
 *                 type: number
 *                 example: 2
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional job image (repeat field for multiple images)
 *     responses:
 *       201:
 *         description: Job created successfully
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
 *                   example: Job created successfully
 *                 job:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d1234567890abcdef9999
 *                     name:
 *                       type: string
 *                       example: Fix electrical wiring
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 67d1234567890abcdef1234
 *                         name:
 *                           type: string
 *                           example: Electrical
 *                     subCategories:
 *                       type: object
 *                       description: Map of index to subcategory name
 *                       example: { "0": "Wiring", "1": "Panel work" }
 *                     wage:
 *                       type: number
 *                       example: 1500
 *                     status:
 *                       type: string
 *                       example: pending
 *                     workersNeeded:
 *                       type: number
 *                       example: 2
 *                     postedBy:
 *                       type: string
 *                       example: 67d1234567890abcdef0001
 *       400:
 *         description: >
 *           Validation error. Possible causes: missing required fields,
 *           no subcategories provided, or invalid subCategories JSON format.
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
 *                   example: All fields are required
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
 *         description: Authenticated account is not a user role
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
 *         description: >
 *           Category name not found, or one or more subcategory names do not
 *           exist under the selected category.
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
 *                   example: Category "Electrical" does not exist
 */
router.post("/add-job", protect, restrictTo("user"), userCreateJob);

/**
 * @swagger
 * /api/jobs/get-jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     description: >
 *       Returns all jobs. Publicly accessible — no authentication required.
 *       Access: public.
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
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
 *                   example: 10
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67d1234567890abcdef9999
 *                       name:
 *                         type: string
 *                         example: Fix electrical wiring
 *                       category:
 *                         type: string
 *                         example: Electrical
 *                       wage:
 *                         type: number
 *                         example: 1500
 *                       status:
 *                         type: string
 *                         example: pending
 *                       location:
 *                         type: string
 *                         example: Kathmandu
 *                       workDate:
 *                         type: string
 *                         format: date
 *                         example: 2024-06-15
 */
router.get("/get-jobs", getAllJobs);

/**
 * @swagger
 * /api/jobs/getmyjobs:
 *   get:
 *     summary: Get all jobs posted by the logged-in user
 *     tags: [Jobs]
 *     description: >
 *       Returns all jobs created by the currently authenticated user, sorted
 *       by newest first. Each job includes the number of workers who have applied
 *       (via bookings) and subcategories as a plain key-value map.
 *       Access: user (any authenticated role).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's jobs fetched successfully
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
 *                   example: 3
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67d1234567890abcdef9999
 *                       name:
 *                         type: string
 *                         example: Fix electrical wiring
 *                       category:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 67d1234567890abcdef1234
 *                           name:
 *                             type: string
 *                             example: Electrical
 *                       subCategories:
 *                         type: object
 *                         description: Map of index to subcategory name
 *                         example: { "0": "Wiring", "1": "Panel work" }
 *                       wage:
 *                         type: number
 *                         example: 1500
 *                       workersNeeded:
 *                         type: number
 *                         example: 2
 *                       appliedWorkers:
 *                         type: integer
 *                         description: Number of workers who have applied via bookings
 *                         example: 4
 *                       status:
 *                         type: string
 *                         example: pending
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
 */
router.get("/getmyjobs", protect, getMyJobs);

/**
 * @swagger
 * /api/jobs/delete-job/{id}:
 *   delete:
 *     summary: Delete a job posted by the logged-in user
 *     tags: [Jobs]
 *     description: >
 *       Deletes the job only if it belongs to the currently authenticated user.
 *       If the job belongs to a different user, a 404 is returned (not 403)
 *       to avoid leaking job ownership.
 *       Access: authenticated user (own jobs only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the job to delete
 *         example: 67d1234567890abcdef9999
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Job deleted successfully
 *       400:
 *         description: Job ID not provided
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
 *                   example: Job id is required
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
 *         description: Job not found or does not belong to the authenticated user
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
 *                   example: Job not found or you are not authorized
 */
router.delete("/delete-job/:id", protect, deleteMyJob);

/**
 * @swagger
 * /api/jobs/update-job/{id}:
 *   patch:
 *     summary: Update a job posted by the logged-in user
 *     tags: [Jobs]
 *     description: >
 *       Partially updates a job. Only fields provided in the request body are updated —
 *       all fields are optional. If new images are uploaded, the old images are deleted
 *       from Cloudinary and replaced. The job must belong to the authenticated user.
 *       Access: authenticated user (own jobs only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the job to update
 *         example: 67d1234567890abcdef9999
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fix electrical wiring
 *               category:
 *                 type: string
 *                 description: >
 *                   Name of the new category. Matched case-insensitively.
 *                   If provided alongside subCategories, both are re-validated together.
 *                 example: Electrical
 *               subCategories:
 *                 type: string
 *                 description: >
 *                   JSON-stringified array of subcategory names under the selected category.
 *                   Only applied when category is also provided. Names matched case-insensitively.
 *                   Example value to paste: ["Wiring","Panel work"]
 *                 example: '["Wiring","Panel work"]'
 *               wage:
 *                 type: number
 *                 example: 2000
 *               description:
 *                 type: string
 *                 example: Updated job description
 *               duration:
 *                 type: string
 *                 example: 4 hours
 *               location:
 *                 type: string
 *                 example: Lalitpur
 *               workDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-07-01
 *               workTime:
 *                 type: string
 *                 example: "10:00 AM"
 *               workersNeeded:
 *                 type: number
 *                 example: 3
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: >
 *                   New images to replace existing ones. Uploading new images
 *                   deletes all previously stored images from Cloudinary.
 *     responses:
 *       200:
 *         description: Job updated successfully
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
 *                   example: Job updated successfully
 *                 job:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d1234567890abcdef9999
 *                     name:
 *                       type: string
 *                       example: Fix electrical wiring
 *                     wage:
 *                       type: number
 *                       example: 2000
 *                     status:
 *                       type: string
 *                       example: pending
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
 *         description: Job not found or does not belong to the authenticated user
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
 *                   example: Job not found or unauthorized
 */
router.patch("/update-job/:id", protect, updateMyJob);

export default router;
