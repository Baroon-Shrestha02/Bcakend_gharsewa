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
 *     description: >
 *       Creates a new account and saves it as a pending signup, then sends an OTP
 *       to the registered email for verification. The account is not fully created
 *       until the OTP is verified via /verify-signup-otp.
 *       skill_type and experience_years are only required for the worker role.
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
 *                 example: ""
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
 *                 default: user
 *                 example: user
 *               skill_type:
 *                 type: string
 *                 enum: [plumber, electrician, carpenter, painter, mechanic, cleaner, other]
 *                 example: electrician
 *                 description: Required only when role is worker
 *               experience_years:
 *                 type: number
 *                 example: 2
 *                 description: Optional for worker role, defaults to 0
 *     responses:
 *       201:
 *         description: Pending signup created and OTP sent to email
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
 *                   example: OTP sent to email. Please verify signup.
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: baroon@gmail.com
 *                     role:
 *                       type: string
 *                       example: user
 *       400:
 *         description: >
 *           Validation error. Possible causes: missing required fields,
 *           email or phone already in use, or worker role missing skill_type.
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
 *                   example: Please fill all required fields.
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/verify-signup-otp:
 *   post:
 *     summary: Verify signup OTP and create account
 *     tags: [Auth]
 *     description: >
 *       Verifies the OTP sent during registration. On success, the pending signup
 *       is promoted to a real verified user account and the pending record is deleted.
 *       OTP expires after 5 minutes.
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
 *       201:
 *         description: Account created and email verified successfully
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
 *                   example: Signup verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 67d1234567890abcdef1234
 *                     role:
 *                       type: string
 *                       example: user
 *                     email:
 *                       type: string
 *                       example: baroon@gmail.com
 *       400:
 *         description: Invalid OTP or OTP has expired
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
 *                   example: Invalid OTP
 *       404:
 *         description: Signup request not found or already expired
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
 *                   example: Signup request expired or not found.
 */
router.post("/verify-signup-otp", verifySignupOTP);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Validate credentials and send login OTP
 *     tags: [Auth]
 *     description: >
 *       Validates the user's email and password. If correct and the email is verified,
 *       a one-time OTP is sent to the registered email. The OTP expires in 5 minutes.
 *       Submit the OTP to /verify-login-otp to receive a JWT bearer token.
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
 *         description: Credentials valid — OTP sent to registered email
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
 *                   example: OTP sent to your email
 *       400:
 *         description: Email and password fields are missing
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
 *                   example: Email and password are required.
 *       401:
 *         description: Invalid email or password
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
 *                   example: Invalid credentials.
 *       403:
 *         description: Email not yet verified — user must complete signup OTP flow first
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
 *                   example: Please verify your email first.
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/verify-login-otp:
 *   post:
 *     summary: Verify login OTP and receive JWT bearer token
 *     tags: [Auth]
 *     description: >
 *       Verifies the OTP sent during login. On success, the OTP is cleared and a
 *       signed JWT bearer token valid for 1 day is returned. Include this token
 *       in the Authorization header (Bearer <token>) for all protected routes.
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
 *         description: OTP verified — JWT token returned
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
 *                   description: JWT bearer token, valid for 1 day
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample.token
 *                 role:
 *                   type: string
 *                   enum: [user, worker, admin]
 *                   example: user
 *       400:
 *         description: Invalid OTP or OTP has expired
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
 *                   example: Invalid OTP
 *       404:
 *         description: No user found with the given email
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
router.post("/verify-login-otp", verifyOTP);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Auth]
 *     description: >
 *       Sends a 6-digit OTP to the registered email address for password reset.
 *       The OTP expires in 5 minutes. Submit the OTP along with a new password
 *       to /reset-password to complete the reset.
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
 *         description: Password reset OTP sent to email
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
 *                   example: OTP sent to email
 *       404:
 *         description: No account found with the given email
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
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     description: >
 *       Verifies the OTP from /forgot-password and updates the account password.
 *       On success, the OTP is cleared and the new password is saved as a bcrypt hash.
 *       The user must log in again after resetting their password.
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
 *         description: Password reset successfully
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
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid OTP or OTP has expired
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
 *                   example: OTP expired
 *       404:
 *         description: No account found with the given email
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
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/logged-user:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     description: >
 *       Returns the user object attached to the request by the protect middleware
 *       after validating the bearer token. Use this to confirm authentication
 *       status and fetch basic profile info on the client.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user returned successfully
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
 *                     middlename:
 *                       type: string
 *                       example: ""
 *                     lastname:
 *                       type: string
 *                       example: Shrestha
 *                     phone:
 *                       type: string
 *                       example: "9841234567"
 *                     email:
 *                       type: string
 *                       example: baroon@gmail.com
 *                     role:
 *                       type: string
 *                       enum: [user, worker, admin]
 *                       example: user
 *                     emailVerified:
 *                       type: boolean
 *                       example: true
 *                     skill_type:
 *                       type: string
 *                       description: Present only for worker accounts
 *                       example: electrician
 *                     experience_years:
 *                       type: number
 *                       description: Present only for worker accounts
 *                       example: 2
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
router.get("/logged-user", protect, getLoggedUser);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     description: >
 *       Stateless logout — the server holds no session, so the client is responsible
 *       for deleting the JWT bearer token from storage (localStorage, AsyncStorage, etc.)
 *       upon receiving this response.
 *     responses:
 *       200:
 *         description: Logout instruction returned successfully
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
 *                   example: Logged out successfully. Please remove the token from client.
 */
router.get("/logout", logout);

export default router;
