import Booking from "../../../models/job/bookingModel.js";
import Job from "../../../models/job/jobModel.js";
import User from "../../../models/userModel.js";
import Worker from "../../../models/workerModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";

export const jobBooking = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!id) return next(new AppError("Job not found.", 404));

  const jobToBook = await Job.findById(id);
  if (!jobToBook) return next(new AppError("Job does not exist", 404));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  if (user.role !== "worker") {
    return next(new AppError("Only workers can request jobs", 403));
  }

  const existingBooking = await Booking.findOne({
    job: id,
    worker: userId,
  });

  if (existingBooking) {
    return next(new AppError("You already requested this job", 400));
  }

  const booking = await Booking.create({
    job: id,
    worker: userId,
  });

  res.status(201).json({
    success: true,
    message: "Booking request sent successfully",
    booking,
  });
});

export const getBookings = asyncErrorHandler(async (req, res, next) => {
  const workerId = req.user.id;

  const findBookings = await Booking.find({ worker: workerId })
    .populate("job")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: findBookings.length,
    bookings: findBookings,
  });
});

// <<<<----- user books worker ---->>>>
export const uReq = asyncErrorHandler(async (req, res, next) => {
  if (req.user.role !== "worker") {
    return next(
      new AppError("Access denied: Only workers can view requests", 403),
    );
  }

  const bookings = await Booking.find({ worker: req.user.id })
    .populate({
      path: "job",
      select: "name category location workDate workTime wage workersNeeded",
    })
    .populate({
      path: "user",
      select: "firstname lastname phone email",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    bookings,
  });
});

export const updateUserReq = asyncErrorHandler(async (req, res, next) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError("Booking request not found", 404));
  }

  // Only the assigned worker can update
  if (booking.worker.toString() !== req.user.id) {
    return next(
      new AppError("You are not allowed to update this request", 403),
    );
  }

  // Update status
  booking.status = status;

  await booking.save();

  res.status(200).json({
    success: true,
    message: "Request updated successfully",
    booking,
  });
});
