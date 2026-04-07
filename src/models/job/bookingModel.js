import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "active", "completed"],
      default: "pending",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ job: 1, worker: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
