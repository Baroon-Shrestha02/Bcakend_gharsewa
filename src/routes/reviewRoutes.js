import express from "express";
import {
  addRating,
  getWorkerReviews,
} from "../Controllers/ratingController.js";
import protect from "../middlewares/verifyUser.js";
import { restrictTo } from "../middlewares/restictAccess.js";

const router = express.Router();

router.post("/add", protect, restrictTo("user"), addRating);

router.get("/worker/:workerId", getWorkerReviews);

export default router;
