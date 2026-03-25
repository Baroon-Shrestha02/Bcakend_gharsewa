import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import User from "../models/userModel.js";
import Worker from "../models/workerModel.js";

const protect = asyncErrorHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized. No token provided.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  req.user = user;

  next();
});

export default protect;
