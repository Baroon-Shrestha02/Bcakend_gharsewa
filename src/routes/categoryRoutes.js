import express from "express";
import protect from "../middlewares/verifyUser.js";
import { restrictTo } from "../middlewares/restictAccess.js";
import {
  createCategory,
  createSubCategory,
  deleteCategory,
  getAllCategories,
  getSubCategoriesByCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     description: >
 *       Returns all categories sorted by newest first.
 *       Pass the query parameter withSubCategories=true to include each
 *       category's subcategories (name and _id only) in the response.
 *     parameters:
 *       - in: query
 *         name: withSubCategories
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         required: false
 *         description: Set to "true" to include subcategories nested under each category
 *         example: true
 *     responses:
 *       200:
 *         description: Categories fetched successfully
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
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67d1234567890abcdef1234
 *                       name:
 *                         type: string
 *                         example: Electrical
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00.000Z
 *                       subCategories:
 *                         type: array
 *                         description: Only present when withSubCategories=true
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 67d9876543210abcdef5678
 *                             name:
 *                               type: string
 *                               example: Wiring
 */
router.get("/", getAllCategories);

/**
 * @swagger
 * /api/category/{categoryId}/subcategory:
 *   get:
 *     summary: Get all subcategories for a category
 *     tags: [Categories]
 *     description: >
 *       Returns all subcategories belonging to the given category,
 *       sorted by newest first. Returns 404 if the parent category does not exist.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the parent category
 *         example: 67d1234567890abcdef1234
 *     responses:
 *       200:
 *         description: Subcategories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 category:
 *                   type: string
 *                   description: Name of the parent category
 *                   example: Electrical
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 subCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67d9876543210abcdef5678
 *                       name:
 *                         type: string
 *                         example: Wiring
 *                       category:
 *                         type: string
 *                         example: 67d1234567890abcdef1234
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00.000Z
 *       404:
 *         description: Parent category not found
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
 *                   example: Parent category not found
 */
router.get("/:categoryId/subcategory", getSubCategoriesByCategory);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     description: >
 *       Creates a new category with a trimmed name. Names must be unique —
 *       attempting to create a duplicate returns 409. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electrical
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: Category created successfully
 *                 category:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d1234567890abcdef1234
 *                     name:
 *                       type: string
 *                       example: Electrical
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00.000Z
 *       400:
 *         description: Category name is missing or blank
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
 *                   example: Category name is required
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
 *       409:
 *         description: A category with this name already exists
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
 *                   example: Category with this name already exists
 */
router.post("/", protect, restrictTo("admin"), createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category and all its subcategories
 *     tags: [Categories]
 *     description: >
 *       Deletes the category by ID and cascades to remove all subcategories
 *       that belong to it. This action is irreversible. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the category to delete
 *         example: 67d1234567890abcdef1234
 *     responses:
 *       200:
 *         description: Category and its subcategories deleted successfully
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
 *                   example: Category and its subcategories deleted successfully
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
 *         description: Category not found
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
 *                   example: Category not found
 */
router.delete("/:id", protect, restrictTo("admin"), deleteCategory);

/**
 * @swagger
 * /api/categories/{categoryId}/subcategory:
 *   post:
 *     summary: Create a subcategory under a category
 *     tags: [Categories]
 *     description: >
 *       Creates a new subcategory under the specified parent category.
 *       Subcategory names must be unique within the same parent category —
 *       the same name can exist under a different category. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the parent category
 *         example: 67d1234567890abcdef1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wiring
 *     responses:
 *       201:
 *         description: Subcategory created successfully
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
 *                   example: Subcategory created successfully
 *                 subCategory:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d9876543210abcdef5678
 *                     name:
 *                       type: string
 *                       example: Wiring
 *                     category:
 *                       type: string
 *                       example: 67d1234567890abcdef1234
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00.000Z
 *       400:
 *         description: Subcategory name is missing or blank
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
 *                   example: Subcategory name is required
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
 *         description: Parent category not found
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
 *                   example: Parent category not found
 *       409:
 *         description: Subcategory with this name already exists under the same category
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
 *                   example: Subcategory "Wiring" already exists under "Electrical"
 */
router.post(
  "/:categoryId/subcategory",
  protect,
  restrictTo("admin"),
  createSubCategory,
);

export default router;
