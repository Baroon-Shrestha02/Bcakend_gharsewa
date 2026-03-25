import User from "../../../models/userModel.js";
import Worker from "../../../models/workerModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//   Get All Active Workers (Public)
export const getAllWorkers = asyncErrorHandler(async (req, res, next) => {
  const workers = await User.find({
    role: "worker",
  })
    .select("-password") // hide password
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: workers.length,
    data: workers,
  });
});

export const getActiveWorker = asyncErrorHandler(async (req, res, next) => {
  const workers = await User.find({
    role: "worker",
    activeStatus: true,
    kycStatus: "verified",
  })
    .select("-password") // hide password
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: workers.length,
    data: workers,
  });
});

// Get singke worker
export const getWorkerById = asyncErrorHandler(async (req, res, next) => {
  const worker = await User.findById(req.params.id);

  if (!worker || !worker.activeStatus) {
    return next(new AppError("Worker not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: worker,
  });
});

// Update Worker (admin , staff and own worker )
export const updateWorkerProfile = asyncErrorHandler(async (req, res, next) => {
  const worker = await User.findById(req.user._id);

  if (!worker || worker.role !== "worker") {
    return next(new AppError("Worker not found", 404));
  }

  // Allowed fields worker can update
  const allowedFields = [
    "firstname",
    "middlename",
    "lastname",
    "phone",
    "skill_type",
    "experience_years",
    "location",
    "isAvailable",
  ];

  // update only allowed fields
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      worker[field] = req.body[field];
    }
  });

  // PROFILE IMAGE UPDATE
  if (req.files && req.files.profImg) {
    if (worker.profImg?.public_id) {
      await cloudinary.v2.uploader.destroy(worker.profImg.public_id);
    }

    const uploadedImage = await uploadImages(req.files.profImg);
    worker.profImg = uploadedImage;
  }

  await worker.save();

  res.status(200).json({
    status: "success",
    message: "Worker profile updated successfully",
    data: worker,
  });
});

// Delete worker (Admin Only ) -- left to update - worker should be able to make themsleves inactive and then admin can delete them
export const deleteWorker = asyncErrorHandler(async (req, res, next) => {
  const worker = await Worker.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!worker) {
    return next(new AppError("Worker not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Worker deleted successfully",
  });
});

export const updateActiveStatus = asyncErrorHandler(async (req, res, next) => {
  const worker = await User.findById(req.user._id);
  if (!worker) return next(new AppError("User not found", 404));

  const newStatus = !worker.activeStatus;
  worker.activeStatus = newStatus;
  await worker.save();

  res.send({
    success: true,
    isActive: newStatus,
  });
});

export const getRequests = asyncErrorHandler(async (req, res, next) => {});
