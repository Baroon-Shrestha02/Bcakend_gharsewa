import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema(
  {
    firstname: String,
    middlename: String,
    lastname: String,
    phone: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    role: String,
    skill_type: String,
    experience_years: Number,
    otp: String,
    otpExpire: Date,
  },
  { timestamps: true },
);

// auto delete after expiry
pendingUserSchema.index({ otpExpire: 1 }, { expireAfterSeconds: 0 });

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser;
