import User from "../../../models/userModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";
import { uploadImages } from "../../../utils/imageUploader.js";

export const sendDoc = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) return next(new AppError("User not found", 404));

  if (!user.activeStatus) {
    return next(
      new AppError("Your account is inactive. You cannot submit KYC.", 403),
    );
  }

  if (user.isVerified) {
    return next(new AppError("Your account is already verified.", 403));
  }

  if (user.kycStatus === "pending") {
    return next(new AppError("KYC already submitted and under review.", 400));
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

  user.kyc_document = uploadedDocs;
  user.kycStatus = "pending";

  await user.save();

  res.status(200).json({
    success: true,
    message: "KYC documents submitted successfully",
    documents: user.kyc_document,
  });
});
