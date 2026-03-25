import Booking from "../../../models/job/bookingModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";

// <<<----this might not be needed----->>>>
export const getAllBooking = asyncErrorHandler(async (req, res, next) => {
  const findBookings = await Booking.find();

  res.status(200).json({
    success: true,
    findBookings,
  });
});

export const updateBooking = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new AppError("Booking id is required", 400));
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  const currentStatus = booking.status;

  // Allowed transitions
  const validTransitions = {
    pending: ["accepted", "rejected"],
    accepted: ["completed"],
  };

  const allowedNextStatus = validTransitions[currentStatus];

  if (!allowedNextStatus || !allowedNextStatus.includes(status)) {
    return next(
      new AppError(
        `Cannot change status from ${currentStatus} to ${status}`,
        400,
      ),
    );
  }

  booking.status = status;
  await booking.save();

  res.status(200).json({
    success: true,
    booking,
  });
});
