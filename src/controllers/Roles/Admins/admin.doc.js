import User from "../../../models/userModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";

export const getDocs = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find({
    kyc_document: { $exists: true, $ne: [] },
    kycStatus: "pending",
  }).select("firstname lastname email kyc_document kycStatus");

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

export const updateStatusDocs = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { kycStatus } = req.body;

  if (!["verified", "rejected"].includes(kycStatus)) {
    return next(new AppError("Invalid KYC status", 400));
  }

  const user = await User.findById(id);

  if (!user) return next(new AppError("User not found", 404));

  if (user.kycStatus !== "pending") {
    return next(
      new AppError(
        "KYC status has already been reviewed and cannot be changed",
        400,
      ),
    );
  }

  user.kycStatus = kycStatus;
  user.isVerified = kycStatus === "verified";

  await user.save();

  res.status(200).json({
    success: true,
    message: `KYC ${kycStatus} successfully`,
    user,
  });
});
