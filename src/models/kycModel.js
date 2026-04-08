import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one KYC record per user
    },

    kyc_document_type: {
      type: String,
      enum: ["citizenship", "license", "National ID"],
      required: true,
    },

    kyc_document: [
      {
        public_id: String,
        url: String,
      },
    ],

    kycStatus: {
      type: String,
      enum: ["not submitted", "pending", "verified", "rejected"],
      default: "pending", // always pending on creation since user just submitted
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin/staff who reviewed
    },

    reviewedAt: {
      type: Date,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const KYC = mongoose.model("KYC", kycSchema);

export default KYC;
