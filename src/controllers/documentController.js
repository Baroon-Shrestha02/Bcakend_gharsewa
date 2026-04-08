import User from "../models/userModel.js";
import { uploadImages } from "../utils/imageUploader.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import AppError from "../utils/appError.js";
import KYC from "../models/kycModel.js";

export const sendDoc = asyncErrorHandler(async (req, res, next) => {
  const { kyc_document_type } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  if (!user.activeStatus) {
    return next(
      new AppError("Your account is inactive. You cannot submit KYC.", 403),
    );
  }

  if (user.kycStatus === "verified") {
    return next(new AppError("Your account is already verified.", 403));
  }

  if (user.kycStatus === "pending") {
    return next(new AppError("KYC already submitted and under review.", 400));
  }

  if (!kyc_document_type || !kyc_document_type.trim()) {
    return next(new AppError("KYC document type is required", 400));
  }

  if (!req.files?.kyc_document) {
    return next(new AppError("You must upload at least one document", 400));
  }

  const documents = Array.isArray(req.files.kyc_document)
    ? req.files.kyc_document
    : [req.files.kyc_document];

  const uploadedDocs = await Promise.all(
    documents.map((doc) => uploadImages(doc)),
  );

  // Upsert KYC record (create or replace on resubmission)
  const kyc = await KYC.findOneAndUpdate(
    { user: user._id },
    {
      kyc_document_type: kyc_document_type.trim(),
      kyc_document: uploadedDocs,
      kycStatus: "pending",
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: Date.now(),
    },
    { upsert: true, new: true },
  );

  // Keep user model kycStatus in sync
  user.kycStatus = "pending";
  await user.save();

  res.status(200).json({
    success: true,
    message: "KYC documents submitted successfully",
    kyc,
  });
});

// user fetches their own KYC record
export const getMyKyc = asyncErrorHandler(async (req, res, next) => {
  const kyc = await KYC.findOne({ user: req.user.id })
    .populate("user", "firstname lastname email")
    .populate("reviewedBy", "firstname lastname email");

  if (!kyc) {
    return next(new AppError("No KYC record found for your account", 404));
  }

  res.status(200).json({
    success: true,
    kyc,
  });
});

// admin gets ALL kyc records (any status), with optional status filter
export const getAllKyc = asyncErrorHandler(async (req, res, next) => {
  const { status } = req.query;

  const filter = {};
  if (status) {
    if (!["pending", "verified", "rejected"].includes(status)) {
      return next(
        new AppError(
          "Invalid status filter. Must be pending, verified, or rejected",
          400,
        ),
      );
    }
    filter.kycStatus = status;
  }

  const kycRecords = await KYC.find(filter)
    .populate("user", "firstname lastname email")
    .populate("reviewedBy", "firstname lastname email")
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: kycRecords.length,
    kycRecords,
  });
});
// Approve or reject a KYC submission
export const updateStatusDocs = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params; // KYC record _id
  const { kycStatus, rejectionReason } = req.body;

  if (!["verified", "rejected"].includes(kycStatus)) {
    return next(
      new AppError("Invalid KYC status. Must be 'verified' or 'rejected'", 400),
    );
  }

  if (kycStatus === "rejected" && !rejectionReason?.trim()) {
    return next(
      new AppError("Rejection reason is required when rejecting KYC", 400),
    );
  }

  const kyc = await KYC.findById(id);
  if (!kyc) return next(new AppError("KYC record not found", 404));

  if (kyc.kycStatus !== "pending") {
    return next(
      new AppError("KYC has already been reviewed and cannot be changed", 400),
    );
  }

  kyc.kycStatus = kycStatus;
  kyc.rejectionReason =
    kycStatus === "rejected" ? rejectionReason.trim() : null;
  kyc.reviewedBy = req.user.id;
  kyc.reviewedAt = Date.now();
  await kyc.save();

  const user = await User.findById(kyc.user);
  if (user) {
    user.kycStatus = kycStatus;
    user.isVerified = kycStatus === "verified";
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: `KYC ${kycStatus} successfully`,
    kyc,
  });
});
