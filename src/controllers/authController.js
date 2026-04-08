// completed controller and routes

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import User from "../models/userModel.js";
import generateOTP from "../utils/otpGenerate.js";
import sendEmail from "../utils/sendEmail.js";
import PendingUser from "../models/PendingUserModel.js";

export const registerUser = asyncErrorHandler(async (req, res, next) => {
  const {
    firstname,
    middlename,
    lastname,
    phone,
    email,
    password,
    role,
    skill_type,
    experience_years,
  } = req.body;

  // required fields
  if (!firstname || !lastname || !phone || !email || !password) {
    return next(new AppError("Please fill all required fields.", 400));
  }

  const allowedRoles = ["user", "worker"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  // check if real user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    return next(new AppError("User already exists.", 400));
  }

  // remove old pending signup
  await PendingUser.deleteMany({
    $or: [{ email }, { phone }],
  });

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  const newUserData = {
    firstname,
    middlename,
    lastname,
    phone,
    email,
    password: hashedPassword,
    role: userRole,
    otp,
    otpExpire: Date.now() + 5 * 60 * 1000,
  };

  // worker fields
  if (userRole === "worker") {
    if (!skill_type) {
      return next(new AppError("Worker must select a skill type.", 400));
    }

    newUserData.skill_type = skill_type;
    newUserData.experience_years = experience_years || 0;
  }

  // save pending signup
  const pendingUser = await PendingUser.create(newUserData);

  // send OTP email
  await sendEmail(
    pendingUser.email,
    "Signup OTP Verification",
    `Your OTP is ${otp}`,
  );

  res.status(201).json({
    status: "success",
    message: "OTP sent to email. Please verify signup.",
    data: {
      email: pendingUser.email,
      role: pendingUser.role,
    },
  });
});

// verify signup OTP
export const verifySignupOTP = asyncErrorHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  // find pending signup
  const pendingUser = await PendingUser.findOne({ email });

  if (!pendingUser) {
    return next(new AppError("Signup request expired or not found.", 404));
  }

  // verify OTP
  if (pendingUser.otp?.toString() !== otp?.toString()) {
    return next(new AppError("Invalid OTP", 400));
  }

  // verify expiry
  if (Date.now() > pendingUser.otpExpire) {
    return next(new AppError("OTP expired", 400));
  }

  // create real user
  const user = await User.create({
    firstname: pendingUser.firstname,
    middlename: pendingUser.middlename,
    lastname: pendingUser.lastname,
    phone: pendingUser.phone,
    email: pendingUser.email,
    password: pendingUser.password,
    role: pendingUser.role,
    skill_type: pendingUser.skill_type,
    experience_years: pendingUser.experience_years,
    emailVerified: true,
  });

  // remove pending signup
  await PendingUser.deleteOne({ email });

  res.status(201).json({
    status: "success",
    message: "Signup verified successfully",
    data: {
      id: user._id,
      role: user.role,
      email: user.email,
    },
  });
});
// login
export const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Email and password are required.", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("Invalid credentials.", 401));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError("Invalid credentials", 401));

  if (!user.emailVerified) {
    return next(new AppError("Please verify your email first.", 403));
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(user.email, "Login OTP", `Your OTP is ${otp}`);

  res.status(200).json({
    status: "success",
    message: "OTP sent to your email",
  });
});

// verify login OTP & Bearer token
export const verifyOTP = asyncErrorHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  if (user.otp !== otp) return next(new AppError("Invalid OTP", 400));
  if (Date.now() > user.otpExpire)
    return next(new AppError("OTP expired", 400));

  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  // generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.status(200).json({
    status: "success",
    message: "Login successful",
    token, // bearrer token for frontend/mobile
    role: user.role,
  });
});

// forgot password OTP
export const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(user.email, "Reset Password OTP", `Your OTP is ${otp}`);

  res.status(200).json({
    status: "success",
    message: "OTP sent to email",
  });
});

// reset pasword
export const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  if (user.otp !== otp) return next(new AppError("Invalid OTP", 400));
  if (Date.now() > user.otpExpire)
    return next(new AppError("OTP expired", 400));

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

//  get logged user
export const getLoggedUser = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

//  logout
export const logout = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please remove the token from client.",
  });
});
