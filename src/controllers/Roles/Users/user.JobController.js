import Booking from "../../../models/job/bookingModel.js";
import Category from "../../../models/job/categoryModel.js";
import Job from "../../../models/job/jobModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";
import { uploadImages } from "../../../utils/imageUploader.js";

// <<<<-----User's Job related CRUD Operations---->>>>
export const userCreateJob = asyncErrorHandler(async (req, res, next) => {
  let {
    name,
    category,
    subCategories,
    wage,
    description,
    duration,
    location,
    workersNeeded,
    workTime,
    workDate,
  } = req.body;

  const userId = req.user.id;

  if (
    !name ||
    !category ||
    !wage ||
    !description ||
    !duration ||
    !location ||
    !workDate ||
    !workTime
  ) {
    return next(new AppError("All fields are required", 400));
  }

  if (subCategories && typeof subCategories === "string") {
    subCategories = JSON.parse(subCategories);
  }

  let existingCategory = await Category.findOne({ name: category });

  if (!existingCategory) {
    existingCategory = await Category.create({ name: category });
  }

  let uploadedImage = null;

  if (req.files && req.files.image) {
    uploadedImage = await uploadImages(req.files.image);
  }

  const job = await Job.create({
    name,
    category: existingCategory._id,
    subCategories,
    wage,
    description,
    duration,
    location,
    image: uploadedImage,
    postedBy: userId, // 👈 important
    workersNeeded,
    workTime,
    workDate,
  });

  res.status(201).json({
    success: true,
    job,
  });
});

export const getMyJobs = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user.id;

  const jobs = await Job.find({ postedBy: userId }).sort({ createdAt: -1 });

  const jobsWithApplications = await Promise.all(
    jobs.map(async (job) => {
      const appliedWorkers = await Booking.countDocuments({ job: job._id });

      return {
        ...job.toObject(),
        appliedWorkers,
        workersNeeded: job.workersNeeded,
      };
    }),
  );

  res.json({
    success: true,
    count: jobsWithApplications.length,
    jobs: jobsWithApplications,
  });
});

export const deleteMyJob = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new AppError("Job id is required", 400));

  const job = await Job.findOneAndDelete({
    _id: id,
    postedBy: req.user.id, // or worker / user depending on your schema
  });

  if (!job) {
    return next(new AppError("Job not found or you are not authorized", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Job deleted successfully",
  });
});

export const updateMyJob = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const job = await Job.findOne({
    _id: id,
    postedBy: req.user.id,
  });

  if (!job) {
    return next(new AppError("Job not found or unauthorized", 404));
  }

  const {
    name,
    category,
    subCategories,
    wage,
    description,
    duration,
    location,
    workDate,
    workTime,
    workersNeeded,
  } = req.body;

  if (name) job.name = name;
  if (category) job.category = category;
  if (subCategories) job.subCategories = subCategories;
  if (wage) job.wage = wage;
  if (description) job.description = description;
  if (duration) job.duration = duration;
  if (location) job.location = location;
  if (workDate) job.workDate = workDate;
  if (workTime) job.workTime = workTime;
  if (workersNeeded) job.workersNeeded = workersNeeded;

  // Image update (multiple images)
  if (req.files && req.files.image) {
    // delete old images
    if (job.image && job.image.length > 0) {
      for (const img of job.image) {
        await cloudinary.v2.uploader.destroy(img.public_id);
      }
    }

    const uploadedImages = [];

    const images = Array.isArray(req.files.image)
      ? req.files.image
      : [req.files.image];

    for (const file of images) {
      const uploaded = await uploadImages(file);
      uploadedImages.push(uploaded);
    }

    job.image = uploadedImages;
  }

  await job.save();

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    job,
  });
});
