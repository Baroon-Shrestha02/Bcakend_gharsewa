// Completed controller and documentation

import cloudinary from "cloudinary";
import User from "../../../models/userModel.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";
import AppError from "../../../utils/appError.js";
import { uploadImages } from "../../../utils/imageUploader.js";

// <<<<-----user updates their profile and active status---->>>>
const updateProfile = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user.id;

  const { firstname, middlename, lastname, phone, email } = req.body || {};

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  // restrict role
  if (user.role !== "user" && user.role !== "worker") {
    return next(
      new AppError("Only users and workers can update their profile", 403),
    );
  }

  // update profile image
  if (req.files && req.files.profImg) {
    if (user.profImg && user.profImg.public_id) {
      await cloudinary.v2.uploader.destroy(user.profImg.public_id);
    }

    const uploadedImage = await uploadImages(req.files.profImg);
    user.profImg = uploadedImage;
  }

  // update fields if provided
  if (firstname) user.firstname = firstname;
  if (middlename) user.middlename = middlename;
  if (lastname) user.lastname = lastname;
  if (phone) user.phone = phone;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

const toggleActiveStatus = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const newStatus = !user.activeStatus;
  user.activeStatus = newStatus;
  await user.save();

  res.send({
    success: true,
    isActive: newStatus,
  });
});

export { updateProfile, toggleActiveStatus };
