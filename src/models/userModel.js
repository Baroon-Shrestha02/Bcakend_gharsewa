import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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

    role: {
      type: String,
      enum: ["user", "worker", "staff", "admin"],
      default: "user",
    },

    // Worker specific fields
    skill_type: {
      type: String,
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
      min: 0,
      default: 0,
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

    kyc_document: [
      {
        public_id: String,
        url: String,
      },
    ],

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    activeStatus: {
      type: Boolean,
      default: true,
    },

    otp: String,

    otpExpire: Date,

    otpAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
