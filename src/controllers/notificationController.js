import Notification from "../models/notificationModel.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

// create notification
export const createNotification = asyncErrorHandler(async (req, res) => {
  const { userId, title, message, type } = req.body;

  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
  });
  res.status(201).json({ status: "success", data: notification });
});

// get notification for logged-in user
export const getUserNotifications = asyncErrorHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: notifications,
  });
});

// mark notification as read
export const markRead = asyncErrorHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { data: notification },
  );

  res.status(200).json({
    status: "success",
    data: notification,
  });
});
