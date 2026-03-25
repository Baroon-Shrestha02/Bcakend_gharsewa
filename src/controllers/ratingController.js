import Rating from "../Models/ratingModel.js";
import Worker from "../Models/workerModel.js";
import AppError from "../Utils/appError.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";

export const addRating = asyncErrorHandler(async (req, res, next) => {
  const { workerId, rating, review } = req.body;

  const worker = await Worker.findById(workerId);

  if (!worker || !worker.isActive) {
    return next(new AppError("Worker not found", 404));
  }

  const newRating = await Rating.create({
    user: req.user._id,
    worker: workerId,
    rating,
    review,
  });

  const ratings = await Rating.find({ worker: workerId });

  const totalReviews = ratings.length;

  const ratingSum = ratings.reduce((sum, r) => sum + r.rating, 0);

  const avgRating = ratingSum / totalReviews;

  await Worker.findByIdAndUpdate(workerId, {
    rating: avgRating,
    total_reviews: totalReviews,
  });

  res.status(201).json({
    status: "success",
    data: newRating,
  });
});

export const getWorkerReviews = asyncErrorHandler(async (req, res, next) => {
  const { workerId } = req.params;

  const reviews = await Rating.find({ worker: workerId }).populate(
    "user",
    "name",
  );

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: reviews,
  });
});
