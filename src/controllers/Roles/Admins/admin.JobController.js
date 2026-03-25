import Job from "../../../models/job/jobModel.js";
import Category from "../../../models/job/categoryModel.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";
import AppError from "../../../utils/appError.js";
import { uploadImages } from "../../../utils/imageUploader.js";
import cloudinary from "cloudinary";

const createJob = asyncErrorHandler(async (req, res, next) => {
  let {
    name,
    category,
    subCategories,
    wage,
    description,
    duration,
    location,
    workersNeeded,
  } = req.body;

  if (
    !name ||
    !category ||
    !wage ||
    !description ||
    !duration ||
    !location ||
    !workersNeeded
  ) {
    return next(new AppError("All fields are required", 400));
  }

  // convert string to array
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
    workersNeeded,
  });

  res.status(201).json({
    success: true,
    job,
  });
});

const getAllJobs = asyncErrorHandler(async (req, res, next) => {
  const jobs = await Job.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    count: jobs.length,
    jobs,
  });
});

const updateJob = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  let { name, category, subCategories, wage, description, duration, location } =
    req.body || {};

  let job = await Job.findById(id);
  if (!job) return next(new AppError("Job not found", 404));

  // Handle category update
  if (category) {
    let existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      existingCategory = await Category.create({ name: category });
    }
    job.category = existingCategory._id;
  }

  if (subCategories) {
    if (typeof subCategories === "string") {
      try {
        subCategories = JSON.parse(subCategories);
      } catch {
        subCategories = [subCategories];
      }
    }
    job.subCategories = subCategories;
  }

  // Handle image update
  if (req.files && req.files.image) {
    if (job.image && job.image.public_id) {
      await cloudinary.v2.uploader.destroy(job.image.public_id);
    }

    const uploadedImage = await uploadImages(req.files.image);
    job.image = uploadedImage;
  }

  // Update other fields
  if (name) job.name = name;
  if (wage) job.wage = wage;
  if (description) job.description = description;
  if (duration) job.duration = duration;
  if (location) job.location = location;

  await job.save();

  res.json({
    success: true,
    job,
  });
});

const deleteJob = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const job = await Job.findById(id);
  if (!job) return next(new AppError("Job not found", 404));

  if (job.image && job.image.public_id) {
    await cloudinary.v2.uploader.destroy(job.image.public_id);
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

// <----- Apart from CRUD Operations------>

const getCategories = asyncErrorHandler(async (req, res, next) => {
  const cat = await Category.distinct("name");

  res.status(200).json({
    success: true,
    cat,
  });
});

export { createJob, getAllJobs, deleteJob, updateJob, getCategories };
