import Booking from "../../../models/job/bookingModel.js";
import Category from "../../../models/job/categoryModel.js";
import SubCategory from "../../../models/job/subCategoryModel.js";
import Job from "../../../models/job/jobModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";
import { uploadImages } from "../../../utils/imageUploader.js";

// <<<<-----User's Job related CRUD Operations---->>>>
// addding updated with sub dynamic sub cateogry
export const userCreateJob = asyncErrorHandler(async (req, res, next) => {
  let {
    name,
    category, // now a category NAME string
    subCategories, // now an array of subcategory NAME strings
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
    !workTime ||
    !workersNeeded
  ) {
    return next(new AppError("All fields are required", 400));
  }

  // Parse subCategories if sent as JSON string (FormData)
  if (subCategories && typeof subCategories === "string") {
    try {
      subCategories = JSON.parse(subCategories);
    } catch {
      return next(new AppError("Invalid subCategories format", 400));
    }
  }

  if (!Array.isArray(subCategories) || subCategories.length === 0) {
    return next(new AppError("At least one subcategory is required", 400));
  }

  // Look up category by name (case-insensitive)
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${category.trim()}$`, "i") },
  });
  if (!existingCategory) {
    return next(new AppError(`Category "${category}" does not exist`, 404));
  }

  // Validate each subcategory by name under the found category
  const validatedSubCategories = [];

  for (const subCatName of subCategories) {
    const existingSubCategory = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${subCatName.trim()}$`, "i") },
      category: existingCategory._id,
    });

    if (!existingSubCategory) {
      return next(
        new AppError(
          `Subcategory "${subCatName}" does not exist under "${existingCategory.name}"`,
          404,
        ),
      );
    }

    validatedSubCategories.push(existingSubCategory.name);
  }

  const subCategoriesMap = {};
  validatedSubCategories.forEach((name, index) => {
    subCategoriesMap[index] = name;
  });

  let uploadedImage = [];
  if (req.files && req.files.image) {
    uploadedImage = await uploadImages(req.files.image);
  }

  const job = await Job.create({
    name,
    category: existingCategory._id,
    subCategories: subCategoriesMap,
    wage,
    description,
    duration,
    location,
    image: uploadedImage,
    postedBy: userId,
    workersNeeded,
    workTime,
    workDate,
    status: "pending",
    assignedWorkers: [],
  });

  const populatedJob = await Job.findById(job._id).populate("category", "name");

  res.status(201).json({
    success: true,
    message: "Job created successfully",
    job: {
      ...populatedJob.toObject(),
      subCategories: Object.fromEntries(populatedJob.subCategories),
    },
  });
});
// works
export const getMyJobs = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user.id;

  const jobs = await Job.find({ postedBy: userId })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  const jobsWithApplications = await Promise.all(
    jobs.map(async (job) => {
      const appliedWorkers = await Booking.countDocuments({
        job: job._id,
      });

      // Convert Map to plain object { "0": "dish washing", "1": "laundry" }
      const subCategories = job.subCategories
        ? Object.fromEntries(job.subCategories)
        : {};

      return {
        ...job.toObject(),
        subCategories,
        appliedWorkers,
      };
    }),
  );

  res.status(200).json({
    success: true,
    count: jobsWithApplications.length,
    jobs: jobsWithApplications,
  });
});

//delete works.
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

//pedning
export const updateMyJob = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;

  const job = await Job.findOne({ _id: id, postedBy: req.user.id });
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
  if (wage) job.wage = wage;
  if (description) job.description = description;
  if (duration) job.duration = duration;
  if (location) job.location = location;
  if (workDate) job.workDate = workDate;
  if (workTime) job.workTime = workTime;
  if (workersNeeded) job.workersNeeded = workersNeeded;

  // Resolve category by name if provided
  if (category) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category.trim()}$`, "i") },
    });
    if (!existingCategory) {
      return next(new AppError(`Category "${category}" does not exist`, 404));
    }
    job.category = existingCategory._id;

    // If category changed, subCategories must also be re-validated
    if (subCategories) {
      let parsedSubs = subCategories;
      if (typeof parsedSubs === "string") {
        try {
          parsedSubs = JSON.parse(parsedSubs);
        } catch {
          return next(new AppError("Invalid subCategories format", 400));
        }
      }

      const validatedSubs = [];
      for (const subCatName of parsedSubs) {
        const existingSub = await SubCategory.findOne({
          name: { $regex: new RegExp(`^${subCatName.trim()}$`, "i") },
          category: existingCategory._id,
        });
        if (!existingSub) {
          return next(
            new AppError(
              `Subcategory "${subCatName}" does not exist under "${existingCategory.name}"`,
              404,
            ),
          );
        }
        validatedSubs.push(existingSub.name);
      }

      const subCategoriesMap = {};
      validatedSubs.forEach((name, index) => {
        subCategoriesMap[index] = name;
      });
      job.subCategories = subCategoriesMap;
    }
  }

  // Image replacement
  if (req.files && req.files.image) {
    if (job.image && job.image.length > 0) {
      for (const img of job.image) {
        await cloudinary.v2.uploader.destroy(img.public_id);
      }
    }
    const images = Array.isArray(req.files.image)
      ? req.files.image
      : [req.files.image];
    const uploadedImages = [];
    for (const file of images) {
      uploadedImages.push(await uploadImages(file));
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
