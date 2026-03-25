import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 15,
      trim: true,
    },
    middlename: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "worker",
      enum: ["worker"],
    },

    skill_type: {
      type: String,
      required: true,
      enum: [
        "plumber",
        "electrician",
        "carpenter",
        "painter",
        "mechanic",
        "cleaner",
        "other",
      ],
    },

    experience_years: {
      type: Number,
      default: 0,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    total_reviews: {
      type: Number,
      default: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    location: {
      address: String,
      city: String,
      state: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    profImg: {
      public_id: {
        type: String,
        default: "default_zwcp1h",
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dxu7hzo7w/image/upload/v1772623648/default_zwcp1h.jpg",
      },
    },

    KYC_status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    kycDocument: {
      public_id: String,
      url: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Worker = mongoose.models.Worker || mongoose.model("Worker", workerSchema);

export default Worker;
