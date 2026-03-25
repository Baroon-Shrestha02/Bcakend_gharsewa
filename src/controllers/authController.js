import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import User from "../models/userModel.js";
import generateOTP from "../utils/otpGenerate.js";
import sendEmail from "../utils/sendEmail.js";

// register
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

  if (!firstname || !lastname || !phone || !email || !password) {
    return next(new AppError("Please fill all required fields.", 400));
  }

  // prevent admin creation from public API
  const allowedRoles = ["user", "worker"];

  const userRole = allowedRoles.includes(role) ? role : "user";

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    return next(new AppError("User already exists.", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUserData = {
    firstname,
    middlename,
    lastname,
    phone,
    email,
    password: hashedPassword,
    role: userRole,
  };

  // worker specific fields
  if (userRole === "worker") {
    if (!skill_type) {
      return next(new AppError("Worker must select a skill type.", 400));
    }

    newUserData.skill_type = skill_type;
    newUserData.experience_years = experience_years || 0;
  }

  const user = await User.create(newUserData);

  // Generate sign up otp
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(user.email, "Signup OTP Verification", `Your OTP is ${otp}`);

  res.status(201).json({
    status: "success",
    message: "User registered successfully. OTP sent to email.",
    data: {
      id: user._id,
      role: user.role,
      email: user.email,
    },
  });
});

// verify signup otp
export const verifySignupOTP = asyncErrorHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  if (user.otp !== otp) return next(new AppError("Invalid OTP", 400));
  if (Date.now() > user.otpExpire)
    return next(new AppError("OTP expired", 400));

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Signup verified successfully",
  });
});

// login to send otp
export const login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Email and password are required.", 400));

  // find user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid credentials.", 401));
  }

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new AppError("Invalid credentials", 401));

  // genrate otp login
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

// verify login otp
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

  // create token
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: "success",
      message: "Login successful",
      role: user.role,
    });
});

// forget password to send otp
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

// reset password
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

// get logged user
export const getLoggedUser = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

//logout
export const logout = asyncErrorHandler(async (req, res, next) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
