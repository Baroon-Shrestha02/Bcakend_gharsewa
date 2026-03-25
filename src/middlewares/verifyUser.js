import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import User from "../models/userModel.js";
import Worker from "../models/workerModel.js";

const protect = asyncErrorHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("Not authorized.", 401));
  }

  if (!token) {
    return next(new AppError("Not authorized. No token provided.", 401));
  }

  // 🔹 Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 🔹 Get user from database
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  // 🔹 Attach user to request
  req.user = user;

  next();
});

export default protect;
