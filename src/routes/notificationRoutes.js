import express from "express";
import {
  createNotification,
  getUserNotifications,
  markRead,
} from "../Controllers/notificationController.js";
import protect from "../middlewares/verifyUser.js";

const router = express.Router();

// create notification
router.post("/create", createNotification);

// login user notifications

router.get("/user", protect, getUserNotifications);

// read notification
router.patch("/:id/read", markRead);

export default router;