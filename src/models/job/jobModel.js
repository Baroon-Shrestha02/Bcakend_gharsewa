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

    subCategories: [
      {
        type: String,
        trim: true,
      },
    ],

    wage: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },
    workDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date().setHours(0, 0, 0, 0);
        },
        message: "Work date cannot be in the past",
      },
    },
    workTime: {
      type: String,
      enum: ["morning", "daytime", "evening"],
    },
    location: {
      type: String,
      required: true,
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
      // required: true,
    },
    workersNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
  },

  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
