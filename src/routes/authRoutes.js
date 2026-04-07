import express from "express";
import {
  getLoggedUser,
  login,
  logout,
  registerUser,
  verifySignupOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import protect from "../middlewares/verifyUser.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user or worker and send signup OTP
 *     tags: [Auth]
 *     description: Creates a new account and sends an OTP to the registered email address for signup verification - [skill & exp years only for worker role].
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - phone
 *               - email
 *               - password
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: Baroon
 *               middlename:
 *                 type: string
 *                 example:
 *               lastname:
 *                 type: string
 *                 example: Shrestha
 *               phone:
 *                 type: string
 *                 example: "9841234567"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: baroon@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test123
 *               role:
 *                 type: string
 *                 enum: [user, worker]
 *                 example: user
 *               skill_type:
 *                 type: string
 *                 enum: [plumber, electrician, carpenter, painter, mechanic, cleaner, other]
 *                 example: electrician
 *               experience_years:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: User registered successfully and OTP sent to email
 *       400:
 *         description: Validation error, missing fields, existing user, or missing worker skill type
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/verify-signup-otp:
 *   post:
 *     summary: Verify signup OTP
 *     tags: [Auth]
 *     description: Verifies the OTP sent during signup and marks the user's email as verified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: baroon@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Signup verified successfully
 *       400:
 *         description: Invalid OTP or OTP expired
 *       404:
 *         description: User not found
 */
router.post("/verify-signup-otp", verifySignupOTP);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and send OTP
 *     tags: [Auth]
 *     description: Validates user credentials and sends a login OTP to the registered email. This is the regular login flow.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: baroon@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test123
 *     responses:
 *       200:
 *         description: OTP sent to your email
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/verify-login-otp:
 *   post:
 *     summary: Verify login OTP and generate JWT
 *     tags: [Auth]
 *     description: Verifies login OTP and returns a bearer token for authenticated access.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: barooon@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.token
 *                 role:
 *                   type: string
 *                   example: user
 *       400:
 *         description: Invalid OTP or OTP expired
 *       404:
 *         description: User not found
 */
router.post("/verify-login-otp", verifyOTP);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     description: Sends an OTP to the registered email address for password reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: baroon@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     description: Resets the account password after successful OTP verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: baroon@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid OTP or OTP expired
 *       404:
 *         description: User not found
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/logged-user:
 *   get:
 *     summary: Get currently logged in user
 *     tags: [Auth]
 *     description: Returns the currently authenticated user based on the bearer token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched logged in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67d1234567890abcdef1234
 *                     firstname:
 *                       type: string
 *                       example: Baroon
 *                     lastname:
 *                       type: string
 *                       example: Shrestha
 *                     email:
 *                       type: string
 *                       example: baroon@gmail.com
 *                     role:
 *                       type: string
 *                       example: user
 *       401:
 *         description: Unauthorized
 */
router.get("/logged-user", protect, getLoggedUser);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: Logs out the current user on the client side by instructing removal of the bearer token.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.get("/logout", logout);

export default router;
