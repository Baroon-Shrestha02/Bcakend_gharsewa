import Booking from "../../../models/job/bookingModel.js";
import Job from "../../../models/job/jobModel.js";
import User from "../../../models/userModel.js";
import Worker from "../../../models/workerModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";

export const getWorkers = asyncErrorHandler(async (req, res, next) => {
  const findWorkers = await User.find({
    role: "worker",
    kycStatus: "verified",
  });

  res.status(200).json({
    success: true,
    findWorkers,
  });
});

export const getSentWorkerRequests = asyncErrorHandler(
  async (req, res, next) => {
    const userId = req.user.id;

    const requests = await Booking.find({ user: userId })
      .populate("worker", "firstname lastname phone email")
      .populate("job", "name location workDate workTime wage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  },
);

export const updateWorkerRequests = asyncErrorHandler(
  async (req, res, next) => {},
);

// <<<<----workers send request for your job post---->>>>
export const getWorkerRequests = asyncErrorHandler(async (req, res, next) => {
  const workerId = req.user.id;

  const requests = await Booking.find({ worker: workerId })
    .populate("job", "name location workDate workTime wage")
    .populate("user", "firstname lastname phone email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

export const requestWorkerForJob = asyncErrorHandler(async (req, res, next) => {
  const { jobId, workerId } = req.params;
  const userId = req.user.id;

  const job = await Job.findById(jobId);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  const worker = await User.findOne({
    _id: workerId,
    role: "worker",
    kycStatus: "verified",
  }).select("firstname lastname phone email role");

  if (!worker || worker.role !== "worker") {
    return next(new AppError("Worker not found", 404));
  }

  const existingBooking = await Booking.findOne({
    job: jobId,
    worker: workerId,
  });

  if (existingBooking) {
    return next(new AppError("Worker already requested", 400));
  }

  const booking = await Booking.create({
    job: jobId,
    user: userId,
    worker: workerId,
    workDate: job.workDate,
    workTime: job.workTime,
  });

  res.status(201).json({
    success: true,
    message: "Worker request sent",
    booking,
  });
});
