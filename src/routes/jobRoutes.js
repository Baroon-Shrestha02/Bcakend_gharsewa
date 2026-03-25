import express from "express";
import { restrictTo } from "../middlewares/restictAccess.js";
import protect from "../middlewares/verifyUser.js";
import {
  createJob,
  getAllJobs,
  deleteJob,
  updateJob,
  getCategories,
} from "../controllers/Roles/Admins/admin.JobController.js";
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

// <<<<----Job CRUD from admin is not required---->>>>
/**
 * @swagger
 * /api/jobs/add-job:
 *   post:
 *     summary: Create a new job (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, wage, description, duration, location]
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 description: Category name (created if it does not exist)
 *               wage:
 *                 type: number
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.post(
  "/add-job",
  protect,
  restrictTo("user", "admin", "staff"),
  userCreateJob,
  // this one is okay but later might remove admin and staff from adding the job
);

/**
 * @swagger
 * /api/jobs/get-jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get("/get-jobs", getAllJobs); // this one is okay

/**
 * @swagger
 * /api/jobs/delete/:id:
 *   delete:
 *     summary: Delete a job by ID (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Job not found
 */
router.delete("/delete/:id", protect, restrictTo("admin"), deleteJob); // not admin, the user who posted the job can delete their job

/**
 * @swagger
 * /api/jobs/update/:id:
 *   patch:
 *     summary: Update a job by ID (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               wage:
 *                 type: number
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: Job not found
 */
router.patch("/update/:id", protect, restrictTo("admin"), updateJob); // not admin, only the respective user can update them

// <<<---for jobs---->>>>

// <<<<------User CRUD for their jobs----->>>>
router.post(
  "/userJob",
  protect,
  restrictTo("admin", "staff", "user"),
  userCreateJob,
);

/**
 * @swagger
 * /api/jobs/get-categories:
 *   get:
 *     summary: Get all job categories
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 cat:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Plumbing
 *       500:
 *         description: Server error
 */
router.get("/get-categories", getCategories);

/**
 * @swagger
 * /api/jobs/getmyjobs:
 *   get:
 *     summary: Get jobs posted by logged-in user
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       wage:
 *                         type: number
 *                       appliedWorkers:
 *                         type: number
 *                       workersNeeded:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/getmyjobs", protect, getMyJobs);

/**
 * @swagger
 * /api/jobs/delete-job/{id}:
 *   delete:
 *     summary: Delete a job created by the logged-in user
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
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
 *       404:
 *         description: Job not found or unauthorized
 */
router.delete("/delete-job/:id", protect, deleteMyJob);

/**
 * @swagger
 * /api/jobs/update-job/{id}:
 *   patch:
 *     summary: Update a job created by the logged-in user
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               subCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               wage:
 *                 type: number
 *               description:
 *                 type: string
 *               duration:
 *                 type: string
 *               location:
 *                 type: string
 *               workDate:
 *                 type: string
 *                 format: date
 *               workTime:
 *                 type: string
 *               workersNeeded:
 *                 type: number
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
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
 *                 message:
 *                   type: string
 *                 job:
 *                   type: object
 *       404:
 *         description: Job not found or unauthorized
 */
router.patch("/update-job/:id", protect, updateMyJob);

export default router;
