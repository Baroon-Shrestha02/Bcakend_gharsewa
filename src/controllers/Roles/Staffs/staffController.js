import bcrypt from "bcrypt";
import User from "../../../models/userModel.js";
import AppError from "../../../utils/appError.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";

// create admin(staff only)
export const createStaff = asyncErrorHandler(async (req, res, next) => {
  const { firstname, lastname, phone, email, password } = req.body;

  if (!firstname || !lastname || !phone || !email || !password) {
    return next(new AppError("Please fill all required fields", 400));
  }

  const existStaff = await User.findOne({ email });

  if (existStaff) {
    return next(new AppError("Staff already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const staff = await User.create({
    firstname,
    lastname,
    phone,
    email,
    password: hashedPassword,
    role: "staff",
    isVerified: true,
  });

  res.status(201).json({
    status: "success",
    data: staff,
  });
});

// get all staff
export const getAllStaff = asyncErrorHandler(async (req, res, next) => {
  const staff = await User.find({
    role: "staff",
  }).select("-password");

  res.status(200).json({
    status: "success",
    results: staff.length,
    data: staff,
  });
});

// get staff by id
export const getStaffById = asyncErrorHandler(async (req, res, next) => {
  const staff = await User.findById(req.params.id).select("-password");

  if (!staff || staff.role !== "staff") {
    return next(new AppError("Staff not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: staff,
  });
});

// update the staff (admin only)
export const updateStaff = asyncErrorHandler(async (req, res, next) => {
  const staff = await User.findById(req.params.id);

  if (!staff || staff.role !== "staff") {
    return next(new AppError("Staff not found", 404));
  }

  // Prevent role modification
  if (req.body.role) delete req.body.role;

  const updatedStaff = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    status: "success",
    data: updatedStaff,
  });
});

// delete staff
export const deleteStaff = asyncErrorHandler(async (req, res, next) => {
  const staff = await User.findByIdAndUpdate(
    req.params.id,
    {
      isVerified: false,
    },
    {
      new: true,
    },
  );

  if (!staff) {
    return next(new AppError("Staff not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Staff removed successfully",
  });
});
