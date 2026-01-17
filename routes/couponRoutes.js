import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} from "../controllers/couponController.js";

const router = express.Router();

/* ADMIN */
router.post("/", protect, isAdmin, createCoupon);
router.get("/", protect, isAdmin, getAllCoupons);
router.put("/:id", protect, isAdmin, updateCoupon);
router.delete("/:id", protect, isAdmin, deleteCoupon);

/* USER */
router.post("/apply", protect, applyCoupon);

export default router;
