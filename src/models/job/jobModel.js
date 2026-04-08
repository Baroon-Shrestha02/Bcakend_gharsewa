import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Stored as { "0": "dish washing", "1": "laundry" }
    subCategories: {
      type: Map,
      of: String,
      required: true,
    },

    wage: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    workDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: "Work date cannot be in the past",
      },
    },

    workTime: {
      type: String,
      enum: ["morning", "daytime", "evening"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    image: [
      {
        public_id: String,
        url: String,
      },
    ],

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workersNeeded: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    assignedWorkers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
